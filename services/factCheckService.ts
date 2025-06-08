// services/factCheckService.ts
import { FactClaim, FactCheckResult, FactCheckService, Source } from '@/components/FactChecker/types';

interface GPTAnalysis {
  verdict: 'verified' | 'false' | 'partially-true' | 'unverifiable';
  confidence: number;
  explanation: string;
  reasoning?: string[];
  suggestedSources?: string[];
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl?: string;
}

export class OpenAIFactCheckService implements FactCheckService {
  private apiKey: string;
  private searchApiKey?: string;
  private model: string = 'gpt-4-turbo-preview';
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(apiKey: string, searchApiKey?: string, model?: string) {
    this.apiKey = apiKey;
    this.searchApiKey = searchApiKey;
    if (model) this.model = model;
  }

  async checkClaim(claim: FactClaim): Promise<FactCheckResult> {
    try {
      // Step 1: Search for relevant sources if search API is available
      const sources = this.searchApiKey 
        ? await this.searchForSources(claim.text)
        : [];

      // Step 2: Analyze the claim with GPT
      const analysis = await this.analyzeClaimWithGPT(claim, sources);
      
      // Step 3: If no sources were found but GPT suggests some, try to search for them
      if (sources.length === 0 && analysis.suggestedSources && this.searchApiKey) {
        const additionalSources = await this.searchForSuggestedSources(analysis.suggestedSources);
        sources.push(...additionalSources);
      }

      return {
        claimId: claim.id,
        verdict: analysis.verdict,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        sources: sources,
        checkTimestamp: new Date()
      };
    } catch (error) {
      console.error('Fact check failed:', error);
      
      // Return an error result instead of throwing
      return {
        claimId: claim.id,
        verdict: 'unverifiable',
        confidence: 0,
        explanation: 'Unable to verify this claim due to a technical error. Please try again.',
        sources: [],
        checkTimestamp: new Date()
      };
    }
  }

  async batchCheckClaims(claims: FactClaim[]): Promise<FactCheckResult[]> {
    const batchSize = 5; // Process 5 claims at a time to avoid rate limits
    const results: FactCheckResult[] = [];
    
    for (let i = 0; i < claims.length; i += batchSize) {
      const batch = claims.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(claim => this.checkClaim(claim))
      );
      
      // Extract results, handling any failures
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          // Create a failed result for rejected promises
          const failedClaim = batch[batchResults.indexOf(result)];
          results.push({
            claimId: failedClaim.id,
            verdict: 'unverifiable',
            confidence: 0,
            explanation: 'Failed to check this claim.',
            sources: [],
            checkTimestamp: new Date()
          });
        }
      }
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < claims.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  private async searchForSources(query: string): Promise<Source[]> {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          apiKey: this.searchApiKey,
          count: 5 // Request more results to filter
        })
      });

      if (!response.ok) {
        console.warn('Search API failed:', response.statusText);
        return [];
      }

      const data = await response.json();
      
      // Filter and rank sources
      return this.rankAndFilterSources(data.results || [], query);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  private async searchForSuggestedSources(suggestions: string[]): Promise<Source[]> {
    const allSources: Source[] = [];
    
    for (const suggestion of suggestions.slice(0, 2)) { // Limit to 2 suggestions
      const sources = await this.searchForSources(suggestion);
      allSources.push(...sources);
    }
    
    return allSources.slice(0, 3); // Return top 3 sources
  }

  private rankAndFilterSources(results: SearchResult[], query: string): Source[] {
    // Score sources based on relevance indicators
    const scoredResults = results.map(result => {
      let score = 0.5; // Base score
      
      // Boost score for certain domains
      const trustedDomains = [
        'wikipedia.org', 'britannica.com', 'nature.com', 'science.org',
        'reuters.com', 'apnews.com', 'bbc.com', 'npr.org', '.gov', '.edu'
      ];
      
      if (trustedDomains.some(domain => result.url.includes(domain))) {
        score += 0.3;
      }
      
      // Boost for query term matches
      const queryTerms = query.toLowerCase().split(' ');
      const matchCount = queryTerms.filter(term => 
        result.snippet.toLowerCase().includes(term)
      ).length;
      score += (matchCount / queryTerms.length) * 0.2;
      
      return {
        ...result,
        relevance: Math.min(score, 1)
      };
    });
    
    // Sort by relevance and take top 3
    return scoredResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map(result => ({
        title: result.title,
        url: result.url,
        relevance: result.relevance,
        snippet: result.snippet
      }));
  }

  private async analyzeClaimWithGPT(
    claim: FactClaim, 
    sources: Source[]
  ): Promise<GPTAnalysis> {
    const systemPrompt = `You are a professional fact-checker. Your job is to analyze claims for factual accuracy. 
Be objective, thorough, and base your analysis on available evidence. Consider context and nuance.
If you cannot verify a claim with high confidence, indicate this clearly.`;

    const userPrompt = `Analyze the following claim for factual accuracy:

Claim: "${claim.text}"
Speaker: ${claim.speaker}
Context: ${claim.context || 'No additional context provided'}

${sources.length > 0 ? `Available sources:
${sources.map((s, i) => `${i + 1}. ${s.title}
   URL: ${s.url}
   Summary: ${s.snippet}`).join('\n\n')}` : 'No external sources available. Use your knowledge to assess the claim.'}

Provide your analysis in the following JSON format:
{
  "verdict": "verified" | "false" | "partially-true" | "unverifiable",
  "confidence": 0.0-1.0,
  "explanation": "Clear explanation of your verdict in 2-3 sentences",
  "reasoning": ["Key point 1", "Key point 2", ...],
  "suggestedSources": ["search query 1", "search query 2"] // Only if no sources provided and claim needs verification
}`;

    return await this.makeGPTRequest(systemPrompt, userPrompt);
  }

  private async makeGPTRequest(systemPrompt: string, userPrompt: string): Promise<GPTAnalysis> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3, // Lower temperature for more consistent fact-checking
            max_tokens: 500,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse and validate the response
        const analysis = JSON.parse(content) as GPTAnalysis;
        
        // Validate required fields
        if (!analysis.verdict || typeof analysis.confidence !== 'number' || !analysis.explanation) {
          throw new Error('Invalid response format from GPT');
        }
        
        // Ensure confidence is within bounds
        analysis.confidence = Math.max(0, Math.min(1, analysis.confidence));
        
        return analysis;
      } catch (error) {
        lastError = error as Error;
        console.error(`GPT request attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        }
      }
    }
    
    // If all retries failed, return a default response
    console.error('All GPT request attempts failed:', lastError);
    return {
      verdict: 'unverifiable',
      confidence: 0,
      explanation: 'Unable to analyze this claim due to technical difficulties.',
      reasoning: ['Technical error prevented analysis'],
      suggestedSources: []
    };
  }
}

// Alternative implementation using local model or different API
export class LocalFactCheckService implements FactCheckService {
  async checkClaim(claim: FactClaim): Promise<FactCheckResult> {
    // Implementation for local model or alternative service
    // This is a placeholder - implement based on your specific needs
    
    return {
      claimId: claim.id,
      verdict: 'unverifiable',
      confidence: 0.5,
      explanation: 'Local fact-checking not yet implemented',
      sources: [],
      checkTimestamp: new Date()
    };
  }

  async batchCheckClaims(claims: FactClaim[]): Promise<FactCheckResult[]> {
    return Promise.all(claims.map(claim => this.checkClaim(claim)));
  }
}
