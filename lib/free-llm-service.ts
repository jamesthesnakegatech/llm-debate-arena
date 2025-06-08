// lib/free-llm-service.ts
import { BaseLLMService, LLMResponse, DebateContext } from './llm-service';

export class FreeLLMService extends BaseLLMService {
  private googleApiKey: string | undefined;
  private huggingFaceApiKey: string | undefined;

  constructor() {
    super();
    this.googleApiKey = process.env.GOOGLE_AI_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
  }

  async generateResponse(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    // Route to appropriate service based on model
    if (model.includes('gemini')) {
      return this.callGoogleAI(model, prompt, systemPrompt);
    } else if (model.includes('mixtral') || model.includes('llama')) {
      return this.callHuggingFace(model, prompt, systemPrompt);
    } else {
      // Fallback to mock response
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private async callGoogleAI(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    if (!this.googleApiKey) {
      console.warn('Google AI API key not found, using mock response');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }

    try {
      // Updated Google AI API endpoint for Gemini
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.googleApiKey}`;
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log(`Calling Google AI API for model: ${model}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Google AI API error:', response.status, errorData);
        throw new Error(`Google AI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Google AI');
      }

      return {
        content: data.candidates[0].content.parts[0].text,
        model: model,
        usage: {
          promptTokens: 0, // Google AI doesn't provide token counts in the same way
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('LLM API error:', error);
      // Fallback to mock response on error
      console.log('Falling back to mock response due to API error');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private async callHuggingFace(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    if (!this.huggingFaceApiKey) {
      console.warn('HuggingFace API key not found, using mock response');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }

    try {
      // Map model names to HuggingFace model IDs
      const modelMap: { [key: string]: string } = {
        'mixtral-8x7b': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'llama-2-70b': 'meta-llama/Llama-2-70b-chat-hf',
      };

      const hfModel = modelMap[model] || model;
      const apiUrl = `https://api-inference.huggingface.co/models/${hfModel}`;

      const fullPrompt = systemPrompt 
        ? `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`
        : `<s>[INST] ${prompt} [/INST]`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('HuggingFace API error:', response.status, errorData);
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      
      // HuggingFace returns an array of generated texts
      const generatedText = Array.isArray(data) 
        ? data[0]?.generated_text || ''
        : data.generated_text || '';

      // Remove the prompt from the response if it's included
      const cleanedText = generatedText.replace(fullPrompt, '').trim();

      return {
        content: cleanedText || generatedText,
        model: model,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('LLM API error:', error);
      // Fallback to mock response on error
      console.log('Falling back to mock response due to API error');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private generateMockResponse(model: string, prompt: string, systemPrompt?: string): LLMResponse {
    // Check if this is a debate context
    const isDebate = systemPrompt?.includes('debate') || prompt.includes('position:');
    
    if (isDebate) {
      // Extract position from prompt
      const isPro = prompt.includes('position: pro');
      const topic = prompt.match(/Topic: (.+?)\n/)?.[1] || 'the topic';
      
      // Generate debate-specific responses
      const debateResponses = {
        pro: [
          `The evidence overwhelmingly supports the ${topic.toLowerCase()}. Recent studies from MIT and Stanford show a 23% increase in productivity metrics when this approach is implemented. Furthermore, employee satisfaction scores rise by 35%, leading to better retention and innovation.`,
          `My opponent fails to consider the long-term economic benefits. A comprehensive analysis by McKinsey demonstrates that organizations adopting this approach see a 40% reduction in operational costs while maintaining or improving quality standards. This isn't just theory—it's proven practice.`,
          `Let me address the counterargument directly. While traditional approaches have their place, the data shows they're increasingly obsolete. The World Economic Forum's 2024 report indicates that 78% of leading companies have already transitioned, with measurable improvements across all key performance indicators.`,
        ],
        con: [
          `While the proposition sounds appealing, we must examine the hidden costs. Harvard Business Review's analysis reveals that 65% of implementations fail to deliver promised benefits. The human element—collaboration, mentorship, and culture—suffers dramatically under this model.`,
          `The studies cited by my opponent cherry-pick data. A meta-analysis of 50 studies shows mixed results at best, with significant negative impacts on innovation and team cohesion. Google's own internal research found a 30% decrease in breakthrough innovations after adopting this approach.`,
          `We cannot ignore the societal implications. This approach exacerbates inequality, reduces opportunities for entry-level workers, and undermines the social fabric that makes organizations resilient. Short-term gains pale in comparison to long-term sustainability concerns.`,
        ],
      };

      const responses = isPro ? debateResponses.pro : debateResponses.con;
      const index = Math.floor(Math.random() * responses.length);
      
      return {
        content: responses[index],
        model: model,
        usage: {
          promptTokens: 50,
          completionTokens: 100,
          totalTokens: 150,
        },
      };
    }

    // Non-debate mock responses
    const responses = [
      "I present a compelling argument that addresses the core issue at hand. The evidence clearly supports this position through multiple empirical studies and real-world examples.",
      "Building on the previous point, we must consider the broader implications. Historical precedent shows us that this approach has proven successful in similar contexts.",
      "While my opponent raises interesting points, they fail to address the fundamental question. The data overwhelmingly supports a different conclusion.",
      "Let me clarify this crucial distinction that has been overlooked. The nuanced reality is far more complex than the simplified view presented.",
      "In conclusion, the preponderance of evidence, logical reasoning, and practical considerations all point to one clear answer.",
    ];

    const index = (model.length + prompt.length) % responses.length;
    
    return {
      content: responses[index],
      model: model,
      usage: {
        promptTokens: prompt.split(' ').length,
        completionTokens: responses[index].split(' ').length,
        totalTokens: prompt.split(' ').length + responses[index].split(' ').length,
      },
    };
  }
}

// Export a singleton instance
export const freeLLMService = new FreeLLMService();
