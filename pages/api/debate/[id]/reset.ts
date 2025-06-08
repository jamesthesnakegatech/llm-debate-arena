// pages/api/debate/[id]/reset.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // Get debate
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    // Delete all turns
    await prisma.turn.deleteMany({
      where: { debateId: id as string },
    });

    // Delete all votes
    await prisma.vote.deleteMany({
      where: { debateId: id as string },
    });

    // Reset debate status
    const updatedDebate = await prisma.debate.update({
      where: { id: id as string },
      data: { 
        status: 'created',
        winner: null,
      },
    });

    res.status(200).json({ 
      success: true, 
      debate: updatedDebate,
      message: 'Debate reset successfully' 
    });
  } catch (error) {
    console.error('Reset debate error:', error);
    res.status(500).json({ error: 'Failed to reset debate' });
  }
}
