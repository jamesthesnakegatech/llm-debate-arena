// components/Leaderboard.tsx

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  llmName: string
  wins: number
  losses: number
  ties: number
  winRate: number
  totalDebates: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      
      const data = await response.json()
      setLeaderboard(data.leaderboard)
    } catch (err) {
      setError('Failed to load leaderboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🏆 Leaderboard</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🏆 Leaderboard</h2>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No debates completed yet. Start the first debate!
        </p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const getRankEmoji = (rank: number) => {
              if (rank === 0) return '🥇'
              if (rank === 1) return '🥈'
              if (rank === 2) return '🥉'
              return `${rank + 1}.`
            }

            const getWinRateColor = (rate: number) => {
              if (rate >= 70) return 'text-green-600'
              if (rate >= 40) return 'text-yellow-600'
              return 'text-red-600'
            }

            return (
              <div
                key={entry.llmName}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50' :
                  index === 1 ? 'border-gray-300 bg-gray-50' :
                  index === 2 ? 'border-orange-400 bg-orange-50' :
                  'border-gray-200 bg-white'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">
                      {getRankEmoji(index)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {entry.llmName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {entry.totalDebates} debate{entry.totalDebates !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getWinRateColor(entry.winRate)}`}>
                      {entry.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.wins}W - {entry.losses}L - {entry.ties}T
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t text-xs text-gray-500">
        <p>Win rate is calculated as: (Wins + 0.5 × Ties) / Total Debates</p>
        <p className="mt-1">Note: &quot;Both Weak&quot; votes count as losses for both LLMs</p>
      </div>
    </div>
  )
}
