// pages/api/debate/[id]/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const debate = await prisma.debate.findUnique({
        where: { id: id as string },
        include: {
          turns: {
            orderBy: { turnNumber: 'asc' }
          },
          votes: true
        }
      });

      if (!debate) {
        return res.status(404).json({ success: false, error: 'Debate not found' });
      }

      // Calculate vote counts
      const voteCount = {
        llm1: debate.votes.filter(v => v.winner === 'llm1').length,
        llm2: debate.votes.filter(v => v.winner === 'llm2').length,
        tie: debate.votes.filter(v => v.winner === 'tie').length,
        bothBad: debate.votes.filter(v => v.winner === 'bothBad').length
      };

      // Properly serialize all dates and omit votes
      const { votes, ...debateWithoutVotes } = debate;
      const serializedDebate = {
        ...debateWithoutVotes,
        createdAt: debate.createdAt.toISOString(),
        updatedAt: debate.updatedAt.toISOString(),
        turns: debate.turns.map(turn => ({
          ...turn,
          createdAt: turn.createdAt.toISOString()
        })),
        voteCount
      };

      return res.status(200).json({ 
        success: true, 
        debate: serializedDebate 
      });
    } catch (error) {
      console.error('Error fetching debate:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch debate' 
      });
    }
  } else {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
}
