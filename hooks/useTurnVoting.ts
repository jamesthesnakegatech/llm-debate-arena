import { useState, useEffect } from 'react';
import { TurnVote } from '@/types/debate';

export function useTurnVoting(debateId: string) {
  const [turnVotes, setTurnVotes] = useState<Map<string, TurnVote>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storageKey = `debate-${debateId}-votes`;
    const savedVotes = localStorage.getItem(storageKey);
    if (savedVotes) {
      try {
        const parsed = JSON.parse(savedVotes);
        // Properly type the entries when creating the Map
        const votesMap = new Map<string, TurnVote>();
        Object.entries(parsed).forEach(([key, value]) => {
          votesMap.set(key, value as TurnVote);
        });
        setTurnVotes(votesMap);
      } catch (error) {
        console.error('Error loading saved votes:', error);
      }
    }
  }, [debateId]);

  const handleVote = async (turnId: string, voteType: 'up' | 'down') => {
    setIsLoading(true);
    
    try {
      const currentVote = turnVotes.get(turnId) || {
        turnId,
        upvotes: 0,
        downvotes: 0,
        userVote: null
      };

      let newVote: TurnVote = { ...currentVote };
      
      if (currentVote.userVote === 'up') {
        newVote.upvotes = Math.max(0, newVote.upvotes - 1);
      } else if (currentVote.userVote === 'down') {
        newVote.downvotes = Math.max(0, newVote.downvotes - 1);
      }

      if (currentVote.userVote === voteType) {
        newVote.userVote = null;
      } else {
        if (voteType === 'up') {
          newVote.upvotes += 1;
        } else {
          newVote.downvotes += 1;
        }
        newVote.userVote = voteType;
      }

      const newVotesMap = new Map(turnVotes);
      newVotesMap.set(turnId, newVote);
      setTurnVotes(newVotesMap);

      const storageKey = `debate-${debateId}-votes`;
      const votesObj = Object.fromEntries(newVotesMap);
      localStorage.setItem(storageKey, JSON.stringify(votesObj));

      await fetch(`/api/debate/${debateId}/vote-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnId,
          voteType: newVote.userVote
        })
      }).catch(console.error);

    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    turnVotes,
    handleVote,
    isLoading
  };
}
