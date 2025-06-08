import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all LLM ratings
    const ratings = await prisma.lLMRating.findMany({
      orderBy: { rating: 'desc' },
    });

    // Get recent rating changes
    const recentChanges = await prisma.ratingHistory.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        debate: {
          select: {
            topic: true,
          },
        },
      },
    });

    // Calculate additional stats
    const leaderboard = ratings.map((rating, index) => ({
      rank: index + 1,
      llmName: rating.llmName,
      rating: rating.rating,
      wins: rating.wins,
      losses: rating.losses,
      ties: rating.ties,
      totalGames: rating.totalGames,
      winRate: rating.totalGames > 0 
        ? ((rating.wins / rating.totalGames) * 100).toFixed(1) 
        : '0.0',
      performance: getRatingPerformance(rating.rating),
    }));

    res.status(200).json({ 
      success: true,
      leaderboard,
      recentChanges: recentChanges.map(change => ({
        llmName: change.llmName,
        opponent: change.opponent,
        change: change.ratingChange,
        result: change.result,
        topic: change.debate.topic,
        date: change.createdAt,
      })),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

function getRatingPerformance(rating: number): string {
  if (rating >= 2000) return 'Grandmaster';
  if (rating >= 1800) return 'Master';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1400) return 'Intermediate';
  if (rating >= 1200) return 'Beginner';
  return 'Novice';
}
