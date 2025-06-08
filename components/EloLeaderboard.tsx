// components/EloLeaderboard.tsx

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  llm: string
  elo: number
  wins: number
  losses: number
  debates: number
}

export default function EloLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlaceEmoji = (index: number) => {
    switch (index) {
      case 0: return '🏆'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return '🎯'
    }
  }

  const getPlaceColor = (index: number) => {
    switch (index) {
      case 0: return 'var(--riso-yellow)'
      case 1: return 'var(--riso-pink)'
      case 2: return 'var(--riso-orange)'
      default: return 'var(--riso-paper)'
    }
  }

  // Calculate total battles
  const totalBattles = leaderboard.reduce((sum, e) => sum + e.debates, 0) / 2;

  return (
    <div className="riso-card riso-card-blue transform -rotate-1">
      {/* Header */}
      <div className="riso-leaderboard-header">
        <h2 className="text-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2">
          <span className="inline-block animate-pulse">⚡</span>
          CHAMPION RANKINGS
          <span className="inline-block animate-pulse">⚡</span>
        </h2>
      </div>

      {/* Leaderboard Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="riso-typing">
              <div className="riso-typing-dot"></div>
              <div className="riso-typing-dot"></div>
              <div className="riso-typing-dot"></div>
            </div>
            <p className="mt-4 font-bold uppercase">Loading Warriors...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 riso-info-box">
            <p className="font-black uppercase">No battles yet!</p>
            <p className="text-sm mt-2 font-bold">Be the first to start a debate!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.llm}
                className={`riso-leaderboard-item p-4 flex items-center gap-4 ${
                  index < 3 ? 'riso-glitch' : ''
                }`}
                style={{
                  backgroundColor: index < 3 ? getPlaceColor(index) : undefined,
                  transform: `rotate(${index % 2 === 0 ? '-0.5deg' : '0.5deg'})`,
                }}
              >
                {/* Place */}
                <div className="text-2xl w-12 flex-shrink-0">
                  {getPlaceEmoji(index)}
                </div>

                {/* LLM Name and Stats */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black uppercase tracking-wide text-lg truncate">
                    {entry.llm}
                  </h3>
                  <div className="text-xs font-bold uppercase opacity-80 mt-1">
                    {entry.wins}W - {entry.losses}L ({entry.debates} battles)
                  </div>
                </div>

                {/* ELO Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black" style={{ fontFamily: 'monospace' }}>
                    {entry.elo}
                  </div>
                  <div className="text-xs font-bold uppercase">
                    ELO
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="mt-6 p-4 border-4 border-dashed border-black transform rotate-1">
            <p className="text-sm font-black uppercase text-center">
              Total Battles: {isNaN(totalBattles) ? '0' : Math.floor(totalBattles)}
            </p>
          </div>
        )}
      </div>

      {/* Decorative corner stamps */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-red-500 transform rotate-12 flex items-center justify-center border-2 border-black">
        <span className="text-white font-black text-xs transform -rotate-12">HOT!</span>
      </div>
    </div>
  )
}
