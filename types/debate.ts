export interface TurnVote {
  turnId: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface TurnWithVotes {
  id: string;
  llmName: string;
  message: string;
  turnNumber: number;
  createdAt: string;
  argumentStrength?: number;
  strengthBreakdown?: string;
  factClaims?: string;
  votes?: TurnVote;
}
