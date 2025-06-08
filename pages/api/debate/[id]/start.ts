// pages/api/debate/[id]/start.ts
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
    // Get debate details
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
      include: { turns: true },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status === 'completed') {
      return res.status(400).json({ error: 'Debate already completed' });
    }

    // If debate is in_progress but has no turns, reset it
    if (debate.status === 'in_progress' && debate.turns.length === 0) {
      await prisma.debate.update({
        where: { id: id as string },
        data: { status: 'created' },
      });
      debate.status = 'created';
    }

    // If debate already has turns, return them
    if (debate.turns.length > 0) {
      return res.status(200).json({ 
        success: true, 
        turns: debate.turns,
        message: 'Debate already in progress',
        status: debate.status
      });
    }

    // Update debate status
    await prisma.debate.update({
      where: { id: id as string },
      data: { status: 'in_progress' },
    });

    // Generate first turn (LLM1)
    try {
      const llm1Response = await freeLLMService.generateDebateResponse(
        debate.llm1Name,
        {
          topic: debate.topic,
          position: debate.llm1Position as 'pro' | 'con',
          opponentPosition: debate.llm2Position as 'pro' | 'con',
          previousTurns: [],
        }
      );

      const turn1 = await prisma.turn.create({
        data: {
          debateId: debate.id,
          llmName: debate.llm1Name,
          message: llm1Response.content,
          turnNumber: 1,
        },
      });

      // Emit socket event for real-time update
      const io = getIO();
      if (io) {
        io.emit(`debate:${debate.id}:turn`, {
          turn: turn1,
          debateId: debate.id,
        });
      }

      res.status(200).json({ 
        success: true, 
        turn: turn1,
        message: 'Debate started successfully' 
      });
    } catch (llmError) {
      console.error('LLM API error:', llmError);
      
      // Create a fallback turn with error message
      const fallbackMessage = `[Note: Using fallback response due to API error] As an advocate for the ${debate.llm1Position} position on "${debate.topic}", I present the following arguments: The ${debate.llm1Position} stance offers compelling benefits that deserve careful consideration. Evidence from various studies and real-world applications supports this position. The implications for society, economy, and individual wellbeing all point toward adopting this approach.`;
      
      const turn1 = await prisma.turn.create({
        data: {
          debateId: debate.id,
          llmName: debate.llm1Name,
          message: fallbackMessage,
          turnNumber: 1,
        },
      });

      // Emit socket event for real-time update
      const io = getIO();
      if (io) {
        io.emit(`debate:${debate.id}:turn`, {
          turn: turn1,
          debateId: debate.id,
        });
      }

      res.status(200).json({ 
        success: true, 
        turn: turn1,
        message: 'Debate started with fallback response',
        note: 'API error occurred, using fallback response' 
      });
    }
  } catch (error) {
    console.error('Start debate error:', error);
    res.status(500).json({ error: 'Failed to start debate' });
  }
}
