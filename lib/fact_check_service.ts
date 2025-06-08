// lib/fact-check-service.ts
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
  private factCheckModel = 'gemini-pro'; // Using Gemini for fact-checking

  async checkClaim(claim: string, context?: string): Promise<FactCheckResult> {
    const prompt = `You are a fact-checker AI. Analyze the following claim and provide a verdict.

Claim: "${claim}"
${context ? `Context: ${context}` : ''}

Provide your analysis in the following format:
1. VERDICT: [TRUE/FALSE/PARTIALLY-TRUE/UNVERIFIABLE]
2. CONFIDENCE: [HIGH/MEDIUM/LOW]
3. EXPLANATION: Brief explanation of your verdict
4. SOURCES: What sources would be needed to verify this claim

Be objective and base your analysis on:
- Known facts up to your knowledge cutoff
- Logical consistency
- Whether the claim contains specific, verifiable information
- Common knowledge and established facts`;

    try {
      const response = await freeLLMService.generateResponse(
        this.factCheckModel,
        prompt,
        'You are an expert fact-checker focused on accuracy and objectivity.'
      );

      // Parse the response
      const content = response.content;
      const verdictMatch = content.match(/VERDICT:\s*(TRUE|FALSE|PARTIALLY-TRUE|UNVERIFIABLE)/i);
      const confidenceMatch = content.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i);
      const explanationMatch = content.match(/EXPLANATION:\s*(.+?)(?=SOURCES:|$)/i);
      const sourcesMatch = content.match(/SOURCES:\s*(.+?)$/i);

      const verdict = (verdictMatch?.[1]?.toLowerCase() || 'unverifiable') as FactCheckResult['verdict'];
      const confidence = (confidenceMatch?.[1]?.toLowerCase() || 'low') as FactCheckResult['confidence'];
      const explanation = explanationMatch?.[1]?.trim() || 'Unable to verify this claim.';
      const sourcesText = sourcesMatch?.[1]?.trim() || '';

      // Parse sources into array
      const sources = sourcesText
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 3); // Limit to 3 sources

      return {
        claim,
        verdict,
        confidence,
        explanation,
        sources: sources.length > 0 ? sources : ['Independent verification needed'],
        needsVerification: verdict !== 'true' || confidence !== 'high'
      };
    } catch (error) {
      console.error('Fact-check error:', error);
      
      // Fallback response
      return {
        claim,
        verdict: 'unverifiable',
        confidence: 'low',
        explanation: 'Unable to verify this claim at this time.',
        sources: ['Manual verification required'],
        needsVerification: true
      };
    }
  }

  async checkMultipleClaims(claims: string[], context?: string): Promise<FactCheckResult[]> {
    // Check claims in parallel but limit concurrency
    const batchSize = 3;
    const results: FactCheckResult[] = [];

    for (let i = 0; i < claims.length; i += batchSize) {
      const batch = claims.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(claim => this.checkClaim(claim, context))
      );
      results.push(...batchResults);
    }

    return results;
  }

  extractClaimsFromText(text: string): string[] {
    const claims: string[] = [];
    
    // Extract sentences with factual claims
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    for (const sentence of sentences) {
      // Look for sentences with numbers, statistics, or factual assertions
      if (
        /\d+%|\d+\s*(percent|million|billion|study|studies|research)/i.test(sentence) ||
        /according to|study shows|research indicates|data shows|evidence suggests/i.test(sentence) ||
        /always|never|all|every|none|no one/i.test(sentence) ||
        /proven|established|fact|true|false/i.test(sentence)
      ) {
        claims.push(sentence.trim());
      }
    }
    
    return claims.slice(0, 5); // Limit to 5 claims per turn
  }
}

export const factCheckService = new FactCheckService();
