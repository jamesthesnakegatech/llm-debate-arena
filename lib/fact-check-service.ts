import { freeLLMService } from './free-llm-service';

export interface FactCheckResult {
  claim: string;
  verdict: 'true' | 'false' | 'partially-true' | 'unverifiable';
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  sources?: string[];
  needsVerification: boolean;
}

export class FactCheckService {
  private factCheckModel = 'gemini-pro';

  async checkClaim(claim: string, context?: string): Promise<FactCheckResult> {
    const prompt = `Analyze this claim and determine if it's true, false, partially true, or unverifiable.

Claim: "${claim}"

Respond with:
VERDICT: [choose one: TRUE, FALSE, PARTIALLY-TRUE, or UNVERIFIABLE]
CONFIDENCE: [choose one: HIGH, MEDIUM, or LOW]
EXPLANATION: [one sentence explaining your verdict]
SOURCES: [what sources would verify this]

Example response:
VERDICT: TRUE
CONFIDENCE: HIGH
EXPLANATION: This is a well-established scientific fact.
SOURCES: Physics textbooks, scientific references`;

    try {
      const response = await freeLLMService.generateResponse(
        this.factCheckModel,
        prompt,
        'You are a fact-checker. Be concise and accurate.'
      );

      console.log('Fact-check response:', response.content);

      // More flexible parsing
      const content = response.content.toUpperCase();
      
      // Extract verdict
      let verdict: FactCheckResult['verdict'] = 'unverifiable';
      if (content.includes('VERDICT: TRUE') || content.includes('TRUE')) {
        verdict = 'true';
      } else if (content.includes('VERDICT: FALSE') || content.includes('FALSE')) {
        verdict = 'false';
      } else if (content.includes('PARTIALLY-TRUE') || content.includes('PARTIALLY TRUE')) {
        verdict = 'partially-true';
      }

      // Extract confidence
      let confidence: FactCheckResult['confidence'] = 'low';
      if (content.includes('CONFIDENCE: HIGH') || content.includes('HIGH')) {
        confidence = 'high';
      } else if (content.includes('CONFIDENCE: MEDIUM') || content.includes('MEDIUM')) {
        confidence = 'medium';
      }

      // Extract explanation (look for it after EXPLANATION:)
      const explanationMatch = response.content.match(/EXPLANATION:\s*([^\n]+)/i);
      let explanation = explanationMatch?.[1]?.trim();
      if (!explanation) explanation = `This claim appears to be ${verdict}.`;
      

      // For now, use generic sources
      const sources = ['Academic verification needed', 'Independent fact-checking required'];

      return {
        claim,
        verdict,
        confidence,
        explanation,
        sources,
        needsVerification: verdict !== 'true' || confidence !== 'high'
      };
    } catch (error) {
      console.error('Fact-check error:', error);
      
      // Fallback with mock response for testing
      const mockVerdicts: FactCheckResult['verdict'][] = ['true', 'false', 'partially-true', 'unverifiable'];
      const mockConfidences: FactCheckResult['confidence'][] = ['high', 'medium', 'low'];
      
      const verdict = mockVerdicts[Math.floor(Math.random() * mockVerdicts.length)];
      const confidence = mockConfidences[Math.floor(Math.random() * mockConfidences.length)];
      
      return {
        claim,
        verdict,
        confidence,
        explanation: `Mock fact-check: This claim appears to be ${verdict}.`,
        sources: ['Testing mode - real fact-checking unavailable'],
        needsVerification: true
      };
    }
  }

  async checkMultipleClaims(claims: string[], context?: string): Promise<FactCheckResult[]> {
    const results: FactCheckResult[] = [];
    
    // Process claims one by one to avoid overwhelming the API
    for (const claim of claims) {
      const result = await this.checkClaim(claim, context);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  extractClaimsFromText(text: string): string[] {
    const claims: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      // Look for factual claims
      if (
        /\d+%|\d+\s*(percent|million|billion)/i.test(trimmed) ||
        /study|research|data|evidence|shows|indicates|proves/i.test(trimmed) ||
        /always|never|all|every|none|no one/i.test(trimmed) ||
        trimmed.split(' ').length > 5 // Substantial sentences
      ) {
        claims.push(trimmed);
      }
    }
    
    return claims.slice(0, 3); // Limit to 3 claims
  }
}

export const factCheckService = new FactCheckService();
