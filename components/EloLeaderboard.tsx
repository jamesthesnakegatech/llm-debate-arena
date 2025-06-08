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
