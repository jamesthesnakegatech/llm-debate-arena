// components/FactChecker/types.ts

export interface FactClaim {
  id: string;
  text: string;
  speaker: string;
  timestamp: Date;
  context?: string;
  messageId: string;
}

export interface FactCheckResult {
  claimId: string;
  verdict: 'verified' | 'false' | 'partially-true' | 'unverifiable';
  confidence: number;
  explanation: string;
  sources: Source[];
  checkTimestamp: Date;
}

export interface Source {
  title: string;
  url: string;
  relevance: number;
  snippet: string;
}

export interface FactCheckService {
  checkClaim(claim: FactClaim): Promise<FactCheckResult>;
  batchCheckClaims(claims: FactClaim[]): Promise<FactCheckResult[]>;
}

export interface DebateMessage {
  id: string;
  speaker: string;
  content: string;
  timestamp: Date;
  factChecks?: FactCheckResult[];
}

export interface FactCheckError {
  claimId: string;
  error: string;
  timestamp: Date;
}

export interface FactCheckSettings {
  autoCheck: boolean;
  minClaimLength: number;
  maxClaimsPerMessage: number;
  checkDelay: number;
}

export interface FactCheckStats {
  totalClaims: number;
  checkedClaims: number;
  verifiedClaims: number;
  falseClaims: number;
  partiallyTrueClaims: number;
  unverifiableClaims: number;
}
