// components/EnhancedFactCheckIndicator.tsx
import React, { useState, useEffect } from 'react';

interface FactCheckClaim {
  text: string;
  verdict?: 'true' | 'false' | 'partially-true' | 'unverifiable' | 'pending';
  confidence?: 'high' | 'medium' | 'low';
  explanation?: string;
  sources?: string[];
  needsVerification: boolean;
}

interface EnhancedFactCheckIndicatorProps {
  claims: FactCheckClaim[];
  turnId: string;
  debateId: string;
}

export default function EnhancedFactCheckIndicator({ claims, turnId, debateId }: EnhancedFactCheckIndicatorProps) {
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [factCheckedClaims, setFactCheckedClaims] = useState<FactCheckClaim[]>(claims);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check if any claims need fact-checking
    const pendingClaims = claims.filter(c => c.verdict === 'pending' || !c.verdict);
    if (pendingClaims.length > 0 && !isChecking) {
      checkFacts(pendingClaims);
    }
  }, [claims]);

  const checkFacts = async (claimsToCheck: FactCheckClaim[]) => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claims: claimsToCheck.map(c => c.text),
          context: `Debate turn ${turnId}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.results) {
          // Update claims with fact-check results
          setFactCheckedClaims(prev => {
            const updated = [...prev];
            data.results.forEach((result: any, index: number) => {
              const claimIndex = prev.findIndex(c => c.text === claimsToCheck[index].text);
              if (claimIndex !== -1) {
                updated[claimIndex] = {
                  ...updated[claimIndex],
                  ...result
                };
              }
            });
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Fact-checking error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case 'true': return 'text-green-600 bg-green-50 border-green-200';
      case 'false': return 'text-red-600 bg-red-50 border-red-200';
      case 'partially-true': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unverifiable': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerdictIcon = (verdict?: string) => {
    switch (verdict) {
      case 'true': return '✓';
      case 'false': return '✗';
      case 'partially-true': return '≈';
      case 'unverifiable': return '?';
      case 'pending': return '⏳';
      default: return '🔍';
    }
  };

  const getVerdictLabel = (verdict?: string) => {
    switch (verdict) {
      case 'true': return 'Verified';
      case 'false': return 'False';
      case 'partially-true': return 'Partially True';
      case 'unverifiable': return 'Unverifiable';
      case 'pending': return 'Checking...';
      default: return 'Fact Check';
    }
  };

  if (!factCheckedClaims || factCheckedClaims.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {factCheckedClaims.map((claim, index) => (
        <div key={`${turnId}-claim-${index}`} className="relative">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all ${getVerdictColor(claim.verdict)}`}
            onClick={() => setExpandedClaim(expandedClaim === index ? null : index)}
          >
            <span className="text-base">{getVerdictIcon(claim.verdict)}</span>
            <span>{getVerdictLabel(claim.verdict)}</span>
            {claim.confidence && (
              <span className="opacity-75">({claim.confidence})</span>
            )}
            <svg
              className={`w-3 h-3 transition-transform ${expandedClaim === index ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandedClaim === index && (
            <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border max-w-md animate-fadeIn">
              <div className="text-sm space-y-3">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Claim:</p>
                  <p className="text-gray-700 italic">"{claim.text}"</p>
                </div>
                
                {claim.verdict && claim.verdict !== 'pending' && (
                  <>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getVerdictIcon(claim.verdict)}</span>
                      <div>
                        <p className="font-medium">{getVerdictLabel(claim.verdict)}</p>
                        {claim.confidence && (
                          <p className="text-xs text-gray-500">Confidence: {claim.confidence}</p>
                        )}
                      </div>
                    </div>
                    
                    {claim.explanation && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Explanation:</p>
                        <p className="text-gray-700 text-xs">{claim.explanation}</p>
                      </div>
                    )}
                    
                    {claim.sources && claim.sources.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Verification needed from:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {claim.sources.map((source, idx) => (
                            <li key={idx}>• {source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                
                {claim.verdict === 'pending' && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Fact-checking in progress...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
