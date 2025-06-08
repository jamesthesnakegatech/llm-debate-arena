#!/bin/bash

echo "=== Installing ELO Rating System Files ==="
echo ""

# 1. Create backups with proper escaping
echo "Creating backups..."
cp "pages/api/debate/[id]/vote.ts" "pages/api/debate/[id]/vote.ts.backup" 2>/dev/null || echo "Vote API backup skipped"
cp "pages/api/leaderboard.ts" "pages/api/leaderboard.ts.backup" 2>/dev/null || echo "Leaderboard API backup skipped"
cp "components/Leaderboard.tsx" "components/Leaderboard.tsx.backup" 2>/dev/null || echo "Leaderboard component backup skipped"

# 2. Create the updated vote.ts with ELO
echo ""
echo "Creating updated vote.ts with ELO support..."
cat > "pages/api/debate/[id]/vote.ts" << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { EloRating } from '../../../../lib/elo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { winner, judgeId, reasoning } = req.body;

  if (!winner || !judgeId) {
    return res.status(400).json({ error: 'Winner and judgeId are required' });
  }

  try {
    // Get debate details
    const debate = await prisma.debate.findUnique({
      where: { id: id as string },
    });

    if (!debate) {
      return res.status(404).json({ error: 'Debate not found' });
    }

    if (debate.status !== 'completed') {
      return res.status(400).json({ error: 'Debate is not completed yet' });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        debateId: id as string,
        judgeId: judgeId,
      },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this debate' });
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        debateId: id as string,
        judgeId,
        winner,
        reasoning,
      },
    });

    // Get or create LLM ratings
    let llm1Rating = await prisma.lLMRating.findUnique({
      where: { llmName: debate.llm1Name },
    });

    if (!llm1Rating) {
      llm1Rating = await prisma.lLMRating.create({
        data: {
          llmName: debate.llm1Name,
          rating: EloRating.DEFAULT_RATING,
        },
      });
    }

    let llm2Rating = await prisma.lLMRating.findUnique({
      where: { llmName: debate.llm2Name },
    });

    if (!llm2Rating) {
      llm2Rating = await prisma.lLMRating.create({
        data: {
          llmName: debate.llm2Name,
          rating: EloRating.DEFAULT_RATING,
        },
      });
    }

    // Calculate new ratings
    const { scoreA, scoreB } = EloRating.getScores(winner, debate.llm1Name, debate.llm2Name);
    const { newRatingA, newRatingB, changeA, changeB } = EloRating.calculateNewRatings(
      llm1Rating.rating,
      llm2Rating.rating,
      scoreA
    );

    // Update ratings
    await prisma.lLMRating.update({
      where: { llmName: debate.llm1Name },
      data: {
        rating: newRatingA,
        wins: winner === 'llm1' ? { increment: 1 } : undefined,
        losses: winner === 'llm2' ? { increment: 1 } : undefined,
        ties: winner === 'tie' || winner === 'bothBad' ? { increment: 1 } : undefined,
        totalGames: { increment: 1 },
      },
    });

    await prisma.lLMRating.update({
      where: { llmName: debate.llm2Name },
      data: {
        rating: newRatingB,
        wins: winner === 'llm2' ? { increment: 1 } : undefined,
        losses: winner === 'llm1' ? { increment: 1 } : undefined,
        ties: winner === 'tie' || winner === 'bothBad' ? { increment: 1 } : undefined,
        totalGames: { increment: 1 },
      },
    });

    // Record rating history
    await prisma.ratingHistory.createMany({
      data: [
        {
          llmName: debate.llm1Name,
          debateId: debate.id,
          opponent: debate.llm2Name,
          ratingBefore: llm1Rating.rating,
          ratingAfter: newRatingA,
          ratingChange: changeA,
          result: winner === 'llm1' ? 'win' : winner === 'llm2' ? 'loss' : 'tie',
        },
        {
          llmName: debate.llm2Name,
          debateId: debate.id,
          opponent: debate.llm1Name,
          ratingBefore: llm2Rating.rating,
          ratingAfter: newRatingB,
          ratingChange: changeB,
          result: winner === 'llm2' ? 'win' : winner === 'llm1' ? 'loss' : 'tie',
        },
      ],
    });

    // Get updated vote counts
    const votes = await prisma.vote.findMany({
      where: { debateId: id as string },
    });

    const voteCount = {
      llm1: votes.filter(v => v.winner === 'llm1').length,
      llm2: votes.filter(v => v.winner === 'llm2').length,
      tie: votes.filter(v => v.winner === 'tie').length,
      bothBad: votes.filter(v => v.winner === 'bothBad').length,
    };

    res.status(200).json({ 
      success: true, 
      vote, 
      voteCount,
      ratingChanges: {
        [debate.llm1Name]: { 
          before: llm1Rating.rating, 
          after: newRatingA, 
          change: changeA 
        },
        [debate.llm2Name]: { 
          before: llm2Rating.rating, 
          after: newRatingB, 
          change: changeB 
        },
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
}
EOF

# 3. Create the updated leaderboard.ts
echo "Creating updated leaderboard.ts..."
cat > "pages/api/leaderboard.ts" << 'EOF'
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
EOF

# 4. Create the updated Leaderboard component
echo "Creating updated Leaderboard component..."
cat > "components/EloLeaderboard.tsx" << 'EOF'
import { useState, useEffect } from 'react';

interface LLMStats {
  rank: number;
  llmName: string;
  rating: number;
  wins: number;
  losses: number;
  ties: number;
  totalGames: number;
  winRate: string;
  performance: string;
}

interface RatingChange {
  llmName: string;
  opponent: string;
  change: number;
  result: string;
  topic: string;
  date: string;
}

export default function EloLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LLMStats[]>([]);
  const [recentChanges, setRecentChanges] = useState<RatingChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setRecentChanges(data.recentChanges || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return 'text-purple-600';
    if (rating >= 1800) return 'text-red-600';
    if (rating >= 1600) return 'text-orange-600';
    if (rating >= 1400) return 'text-yellow-600';
    if (rating >= 1200) return 'text-green-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🏆</span>
          <h2 className="text-2xl font-bold">ELO Leaderboard</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">LLM</th>
                <th className="pb-3 px-2 text-center">Rating</th>
                <th className="pb-3 px-2 text-center">W-L-T</th>
                <th className="pb-3 px-2 text-center">Win %</th>
                <th className="pb-3 px-2">Tier</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((llm) => (
                <tr key={llm.llmName} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-2 font-semibold">
                    {getRankIcon(llm.rank)}
                  </td>
                  <td className="py-4 px-2 font-medium">{llm.llmName}</td>
                  <td className={`py-4 px-2 text-center font-bold text-lg ${getRatingColor(llm.rating)}`}>
                    {llm.rating}
                  </td>
                  <td className="py-4 px-2 text-center text-sm">
                    <span className="text-green-600">{llm.wins}</span>-
                    <span className="text-red-600">{llm.losses}</span>-
                    <span className="text-gray-600">{llm.ties}</span>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <span className="font-medium">{llm.winRate}%</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      llm.performance === 'Grandmaster' ? 'bg-purple-100 text-purple-800' :
                      llm.performance === 'Master' ? 'bg-red-100 text-red-800' :
                      llm.performance === 'Expert' ? 'bg-orange-100 text-orange-800' :
                      llm.performance === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      llm.performance === 'Beginner' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {llm.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No ratings yet. Start some debates to see the leaderboard!
          </div>
        )}
      </div>

      {recentChanges.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Recent Rating Changes</h3>
          <div className="space-y-2">
            {recentChanges.slice(0, 5).map((change, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${
                      change.change > 0 ? 'text-green-600' : 
                      change.change < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {change.change > 0 ? '+' : ''}{change.change}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">{change.llmName}</span>
                    <span className="text-gray-500 mx-1">vs</span>
                    <span className="font-medium">{change.opponent}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {change.result === 'win' ? '✓ Won' : 
                   change.result === 'loss' ? '✗ Lost' : 
                   '- Tied'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-900 mb-2">How ELO Ratings Work</h4>
        <ul className="space-y-1 text-blue-800">
          <li>• All LLMs start at 1500 rating</li>
          <li>• Winning against higher-rated opponents gives more points</li>
          <li>• Losing to lower-rated opponents costs more points</li>
          <li>• Ratings update after each vote (not just debate completion)</li>
        </ul>
      </div>
    </div>
  );
}
EOF

echo ""
echo "✅ All files created successfully!"
echo ""
echo "Now update your main page to use the new EloLeaderboard component:"
echo "Replace <Leaderboard /> with <EloLeaderboard /> in pages/index.tsx"
echo "And import it: import EloLeaderboard from '../components/EloLeaderboard'"
echo ""
echo "Don't forget to run: npx prisma db push"
echo "to update your database schema!"
