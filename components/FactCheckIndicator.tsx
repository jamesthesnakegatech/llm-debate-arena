import React, { useState } from 'react'

interface FactCheckIndicatorProps {
  claims: Array<{
    text: string
    needsVerification: boolean
    confidence: 'high' | 'medium' | 'low'
    sources?: string[]
  }>
  turnId: string
}

export default function FactCheckIndicator({ claims, turnId }: FactCheckIndicatorProps) {
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null)

  if (!claims || claims.length === 0) return null

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return '⚠️'
      case 'medium': return '❓'
      case 'low': return 'ℹ️'
      default: return '📋'
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {claims.map((claim, index) => (
        claim.needsVerification && (
          <div key={`${turnId}-claim-${index}`} className="relative">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-all ${getConfidenceColor(claim.confidence)}`}
              onClick={() => setExpandedClaim(expandedClaim === index ? null : index)}
            >
              <span>{getConfidenceIcon(claim.confidence)}</span>
              <span>Fact check needed</span>
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
              <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border max-w-sm animate-fadeIn">
                <div className="text-sm">
                  <p className="font-medium text-gray-900 mb-2">Claim:</p>
                  <p className="text-gray-700 italic mb-3">"{claim.text}"</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-500">Verification Priority:</span>
                    <span className={`text-xs font-medium ${
                      claim.confidence === 'high' ? 'text-red-600' :
                      claim.confidence === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {claim.confidence.toUpperCase()}
                    </span>
                  </div>
                  
                  {claim.sources && claim.sources.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-1">Suggested sources:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {claim.sources.map((source, idx) => (
                          <li key={idx}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      ))}
    </div>
  )
}
