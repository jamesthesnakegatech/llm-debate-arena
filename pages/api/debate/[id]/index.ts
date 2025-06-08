import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
      include: {
        turns: {
          orderBy: { turnNumber: 'asc' }
        },
        votes: true
      }
    })

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' })
    }

    // Calculate vote counts
    const voteCount = {
      llm1: debate.votes.filter(v => v.winner === 'llm1').length,
      llm2: debate.votes.filter(v => v.winner === 'llm2').length,
      tie: debate.votes.filter(v => v.winner === 'tie').length
    }

    res.status(200).json({
      success: true,
      debate: {
        ...debate,
        voteCount,
        turns: debate.turns.map(turn => ({
          ...turn,
          createdAt: turn.createdAt.toISOString()
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching debate:', error)
    res.status(500).json({ 
      error: 'Failed to fetch debate' 
    })
  }
}
