// pages/api/debate/[id]/continue.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { freeLLMService } from '../../../../lib/free-llm-service';
import { getIO } from '../../../../lib/socket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get debate details with all turns
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
      include: { 
        turns: {
          orderBy: { turnNumber: 'asc' }
        } 
      },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status !== 'in_progress') {
      return res.status(400).json({ error: 'Debate is not in progress' });
    }

    // Check if debate is complete (6 turns)
    if (debate.turns.length >= 6) {
      await prisma.debate.update({
        where: { id: id as string },
        data: { status: 'completed' },
      });
      return res.status(400).json({ error: 'Debate already completed' });
    }

    // Determine which LLM should respond next
    const nextTurnNumber = debate.turns.length + 1;
    const isLLM1Turn = nextTurnNumber % 2 === 1;
    const currentLLM = isLLM1Turn ? debate.llm1Name : debate.llm2Name;
    const currentPosition = isLLM1Turn ? debate.llm1Position : debate.llm2Position;
    const opponentPosition = isLLM1Turn ? debate.llm2Position : debate.llm1Position;

    // Build previous turns context
    const previousTurns = debate.turns.map(turn => ({
      speaker: turn.llmName,
      message: turn.message,
    }));

    try {
      // Generate next response
      const llmResponse = await freeLLMService.generateDebateResponse(
        currentLLM,
        {
          topic: debate.topic,
          position: currentPosition as 'pro' | 'con',
          opponentPosition: opponentPosition as 'pro' | 'con',
          previousTurns,
        }
      );

      // Create new turn
      const newTurn = await prisma.turn.create({
        data: {
          debateId: debate.id,
          llmName: currentLLM,
          message: llmResponse.content,
          turnNumber: nextTurnNumber,
        },
      });

      // Check if debate is now complete
      if (nextTurnNumber === 6) {
        await prisma.debate.update({
          where: { id: id as string },
          data: { status: 'completed' },
        });
      }

      // Emit socket event for real-time update
      const io = getIO();
      if (io) {
        io.emit(`debate:${debate.id}:turn`, {
          turn: newTurn,
          debateId: debate.id,
          isComplete: nextTurnNumber === 6,
        });
      }

      res.status(200).json({ 
        success: true, 
        turn: newTurn,
        isComplete: nextTurnNumber === 6,
      });
    } catch (llmError) {
      console.error('LLM API error:', llmError);
      
      // Create a fallback turn
      const fallbackMessage = `[Note: Using fallback response due to API error] Addressing the previous arguments, I maintain that the ${currentPosition} position remains stronger. The evidence presented thus far supports this conclusion, and the practical implications clearly favor this approach. While respecting opposing viewpoints, the data and logic point decisively in this direction.`;
      
      const newTurn = await prisma.turn.create({
        data: {
          debateId: debate.id,
          llmName: currentLLM,
          message: fallbackMessage,
          turnNumber: nextTurnNumber,
        },
      });

      // Check if debate is now complete
      if (nextTurnNumber === 6) {
        await prisma.debate.update({
          where: { id: id as string },
          data: { status: 'completed' },
        });
      }

      // Emit socket event
      const io = getIO();
      if (io) {
        io.emit(`debate:${debate.id}:turn`, {
          turn: newTurn,
          debateId: debate.id,
          isComplete: nextTurnNumber === 6,
        });
      }

      res.status(200).json({ 
        success: true, 
        turn: newTurn,
        isComplete: nextTurnNumber === 6,
        note: 'API error occurred, using fallback response'
      });
    }
  } catch (error) {
    console.error('Continue debate error:', error);
    res.status(500).json({ error: 'Failed to continue debate' });
  }
}
