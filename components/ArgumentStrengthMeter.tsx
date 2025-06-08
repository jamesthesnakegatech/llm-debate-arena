import React, { useState } from 'react'

interface ArgumentStrengthMeterProps {
  strength: number // 0-100
  breakdown: {
    logic: number // 0-100
    evidence: number // 0-100
    relevance: number // 0-100
    persuasiveness: number // 0-100
  }
  turnId: string
}

export default function ArgumentStrengthMeter({ strength, breakdown, turnId }: ArgumentStrengthMeterProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getStrengthColor = (value: number) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-blue-500'
    if (value >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStrengthLabel = (value: number) => {
    if (value >= 80) return 'Strong'
    if (value >= 60) return 'Good'
    if (value >= 40) return 'Fair'
    return 'Weak'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'logic': return '🧠'
      case 'evidence': return '📊'
      case 'relevance': return '🎯'
      case 'persuasiveness': return '💬'
      default: return '📝'
    }
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Argument Strength</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {showDetails ? 'Hide' : 'Show'} details
          </button>
        </div>
        <span className={`text-sm font-bold ${
          strength >= 80 ? 'text-green-600' :
          strength >= 60 ? 'text-blue-600' :
          strength >= 40 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {getStrengthLabel(strength)} ({strength}%)
        </span>
      </div>

      {/* Main strength meter */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out ${getStrengthColor(strength)}`}
          style={{ width: `${strength}%` }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
        </div>
        
        {/* Tick marks */}
        <div className="absolute inset-0 flex items-center">
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute w-0.5 h-full bg-gray-300"
              style={{ left: `${tick}%` }}
            />
          ))}
        </div>
      </div>

      {/* Detailed breakdown */}
      {showDetails && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          {Object.entries(breakdown).map(([category, value]) => (
            <div key={`${turnId}-${category}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="text-xs font-medium text-gray-600 capitalize">
                    {category}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-700">{value}%</span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${getStrengthColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
          
          <div className="pt-3 mt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Scoring criteria:</strong> Logic assesses reasoning quality, 
              Evidence evaluates factual support, Relevance measures on-topic focus, 
              and Persuasiveness gauges rhetorical effectiveness.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
