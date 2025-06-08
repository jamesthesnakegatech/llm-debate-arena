export interface FactClaim {
  text: string
  needsVerification: boolean
  confidence: 'high' | 'medium' | 'low'
  sources?: string[]
}

export interface ArgumentStrengthBreakdown {
  logic: number
  evidence: number
  relevance: number
  persuasiveness: number
}

export interface DebateAnalysis {
  argumentStrength: number
  strengthBreakdown: ArgumentStrengthBreakdown
  factClaims: FactClaim[]
}

export class DebateAnalysisService {
  /**
   * Analyze a debate turn for fact-checking needs and argument strength
   */
  static analyzeDebateTurn(
    message: string,
    topic: string,
    position: 'pro' | 'con',
    turnNumber: number
  ): DebateAnalysis {
    // Extract potential fact claims from the message
    const factClaims = this.extractFactClaims(message)
    
    // Calculate argument strength scores
    const strengthBreakdown = this.calculateArgumentStrength(message, topic, position)
    
    // Calculate overall strength (weighted average)
    const argumentStrength = Math.round(
      (strengthBreakdown.logic * 0.3 +
       strengthBreakdown.evidence * 0.3 +
       strengthBreakdown.relevance * 0.2 +
       strengthBreakdown.persuasiveness * 0.2)
    )

    return {
      argumentStrength,
      strengthBreakdown,
      factClaims
    }
  }

  /**
   * Extract claims that might need fact-checking
   */
  private static extractFactClaims(message: string): FactClaim[] {
    const claims: FactClaim[] = []
    
    // Patterns that often indicate factual claims
    const factPatterns = [
      /(\d+%|percent)/gi,
      /studies (show|indicate|demonstrate)/gi,
      /research (shows|indicates|proves)/gi,
      /according to/gi,
      /statistics (show|indicate)/gi,
      /data (shows|demonstrates)/gi,
      /scientific evidence/gi,
      /proven/gi,
      /fact/gi,
      /(\d+) (million|billion|thousand)/gi,
      /in (\d{4})/gi, // years
    ]

    // Split message into sentences
    const sentences = message.match(/[^.!?]+[.!?]+/g) || []
    
    sentences.forEach(sentence => {
      let needsVerification = false
      let confidence: 'high' | 'medium' | 'low' = 'low'
      
      // Check if sentence contains fact patterns
      factPatterns.forEach(pattern => {
        if (pattern.test(sentence)) {
          needsVerification = true
          
          // Determine confidence level based on claim type
          if (/\d+%|statistics|data/.test(sentence)) {
            confidence = 'high'
          } else if (/studies|research|according/.test(sentence)) {
            confidence = 'medium'
          }
        }
      })
      
      if (needsVerification) {
        claims.push({
          text: sentence.trim(),
          needsVerification,
          confidence,
          sources: this.suggestSources(sentence)
        })
      }
    })

    return claims
  }

  /**
   * Suggest potential sources for fact-checking
   */
  private static suggestSources(claim: string): string[] {
    const sources: string[] = []
    
    if (/climate|environment|warming/i.test(claim)) {
      sources.push('IPCC Reports', 'NASA Climate Data')
    }
    if (/economic|GDP|unemployment/i.test(claim)) {
      sources.push('World Bank Data', 'IMF Statistics')
    }
    if (/health|medical|disease/i.test(claim)) {
      sources.push('WHO Database', 'CDC Reports')
    }
    if (/technology|AI|software/i.test(claim)) {
      sources.push('Gartner Research', 'MIT Technology Review')
    }
    
    // Default sources if no specific match
    if (sources.length === 0) {
      sources.push('Academic journals', 'Government statistics')
    }
    
    return sources
  }

  /**
   * Calculate argument strength scores
   */
  private static calculateArgumentStrength(
    message: string,
    topic: string,
    position: 'pro' | 'con'
  ): ArgumentStrengthBreakdown {
    const words = message.toLowerCase().split(/\s+/)
    const sentences = message.match(/[^.!?]+[.!?]+/g) || []
    
    // Logic score - check for logical connectors and structure
    const logicIndicators = [
      'therefore', 'thus', 'hence', 'because', 'since', 'if', 'then',
      'consequently', 'as a result', 'furthermore', 'moreover', 'however'
    ]
    const logicCount = words.filter(word => logicIndicators.includes(word)).length
    const logicScore = Math.min(100, 50 + (logicCount * 10))
    
    // Evidence score - check for evidence indicators
    const evidenceIndicators = [
      'research', 'study', 'data', 'statistics', 'evidence', 'proven',
      'demonstrates', 'shows', 'indicates', 'survey', 'analysis'
    ]
    const evidenceCount = words.filter(word => evidenceIndicators.includes(word)).length
    const evidenceScore = Math.min(100, 40 + (evidenceCount * 12))
    
    // Relevance score - check topic keywords
    const topicWords = topic.toLowerCase().split(/\s+/)
    const relevantWords = words.filter(word => 
      topicWords.some(topicWord => word.includes(topicWord))
    ).length
    const relevanceScore = Math.min(100, 60 + (relevantWords * 5))
    
    // Persuasiveness score - check for rhetorical elements
    const persuasiveIndicators = [
      'clearly', 'obviously', 'undoubtedly', 'certainly', 'must',
      'should', 'critical', 'essential', 'vital', 'important'
    ]
    const persuasiveCount = words.filter(word => persuasiveIndicators.includes(word)).length
    const sentenceVariety = this.calculateSentenceVariety(sentences)
    const persuasivenessScore = Math.min(100, 50 + (persuasiveCount * 8) + sentenceVariety)
    
    return {
      logic: logicScore,
      evidence: evidenceScore,
      relevance: relevanceScore,
      persuasiveness: persuasivenessScore
    }
  }

  /**
   * Calculate sentence variety for persuasiveness
   */
  private static calculateSentenceVariety(sentences: string[]): number {
    if (sentences.length === 0) return 0
    
    const lengths = sentences.map(s => s.split(/\s+/).length)
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length
    
    // Higher variance (more variety) is better, up to a point
    return Math.min(20, Math.sqrt(variance) * 2)
  }
}
