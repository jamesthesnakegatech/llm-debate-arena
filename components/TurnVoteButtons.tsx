// components/TurnVoteButtons.tsx

import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react'

interface TurnVoteButtonsProps {
  turnId: string
  onVote: (turnId: string, vote: 'up' | 'down') => void
  initialVotes?: { up: number; down: number }
  userVote?: 'up' | 'down' | null
}

export default function TurnVoteButtons({ 
  turnId, 
  onVote, 
  initialVotes = { up: 0, down: 0 },
  userVote = null 
}: TurnVoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [currentUserVote, setCurrentUserVote] = useState<'up' | 'down' | null>(userVote)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleVote = (voteType: 'up' | 'down') => {
    // Trigger animation
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)

    // If clicking the same vote, remove it
    if (currentUserVote === voteType) {
      setCurrentUserVote(null)
      setVotes(prev => ({
        ...prev,
        [voteType]: Math.max(0, prev[voteType] - 1)
      }))
      onVote(turnId, voteType) // You might want to handle unvoting differently
      return
    }

    // Update votes
    const newVotes = { ...votes }
    
    // Remove previous vote if exists
    if (currentUserVote) {
      newVotes[currentUserVote] = Math.max(0, newVotes[currentUserVote] - 1)
    }
    
    // Add new vote
    newVotes[voteType] = newVotes[voteType] + 1
    
    setVotes(newVotes)
    setCurrentUserVote(voteType)
    onVote(turnId, voteType)
  }

  return (
    <div className="flex items-center gap-3 mt-4">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        className={`riso-vote-button px-4 py-2 flex items-center gap-2 transform transition-all ${
          currentUserVote === 'up' 
            ? 'riso-vote-button selected rotate-2 scale-110' 
            : 'hover:rotate-2 hover:scale-105'
        } ${isAnimating && currentUserVote === 'up' ? 'riso-shake' : ''}`}
        style={{
          backgroundColor: currentUserVote === 'up' ? 'var(--riso-green)' : 'var(--riso-paper)',
          color: currentUserVote === 'up' ? 'var(--riso-paper)' : 'var(--riso-black)'
        }}
      >
        <ThumbsUp className="w-5 h-5" />
        <span className="font-black text-sm">{votes.up}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        className={`riso-vote-button px-4 py-2 flex items-center gap-2 transform transition-all ${
          currentUserVote === 'down' 
            ? 'riso-vote-button selected -rotate-2 scale-110' 
            : 'hover:-rotate-2 hover:scale-105'
        } ${isAnimating && currentUserVote === 'down' ? 'riso-shake' : ''}`}
        style={{
          backgroundColor: currentUserVote === 'down' ? 'var(--riso-red)' : 'var(--riso-paper)',
          color: currentUserVote === 'down' ? 'var(--riso-paper)' : 'var(--riso-black)'
        }}
      >
        <ThumbsDown className="w-5 h-5" />
        <span className="font-black text-sm">{votes.down}</span>
      </button>

      {/* Decorative element that appears on vote */}
      {isAnimating && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <Sparkles 
            className="w-8 h-8 animate-ping" 
            style={{ color: currentUserVote === 'up' ? 'var(--riso-green)' : 'var(--riso-red)' }}
          />
        </div>
      )}

      {/* Score indicator */}
      <div className="ml-4 flex items-center gap-1">
        <span className="font-black text-xs uppercase tracking-wider">Score:</span>
        <span 
          className="riso-badge text-xs"
          style={{
            backgroundColor: votes.up > votes.down ? 'var(--riso-green)' : 
                           votes.down > votes.up ? 'var(--riso-red)' : 
                           'var(--riso-yellow)',
            color: 'var(--riso-paper)'
          }}
        >
          {votes.up - votes.down > 0 ? '+' : ''}{votes.up - votes.down}
        </span>
      </div>
    </div>
  )
}
