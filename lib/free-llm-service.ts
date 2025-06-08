// lib/free-llm-service.ts
import { BaseLLMService, LLMResponse, DebateContext } from './llm-service';

export class FreeLLMService extends BaseLLMService {
  private googleApiKey: string | undefined;
  private huggingFaceApiKey: string | undefined;
  private openAIApiKey: string | undefined;
  private anthropicApiKey: string | undefined;
  private groqApiKey: string | undefined;

  constructor() {
    super();
    this.googleApiKey = process.env.GOOGLE_AI_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.openAIApiKey = process.env.OPENAI_API_KEY;
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.groqApiKey = process.env.GROQ_API_KEY;
  }

  async generateResponse(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    // Route to appropriate service based on model
    if (model.toLowerCase().includes('gpt')) {
      return this.callOpenAI(model, prompt, systemPrompt);
    } else if (model.toLowerCase().includes('claude')) {
      return this.callAnthropic(model, prompt, systemPrompt);
    } else if (model.toLowerCase().includes('gemini')) {
      return this.callGoogleAI(model, prompt, systemPrompt);
    } else if (model.toLowerCase().includes('(fast)') || model.toLowerCase().includes('groq')) {
      // Groq handles the "fast" models
      return this.callGroq(model, prompt, systemPrompt);
    } else if (model.toLowerCase().includes('mixtral') || model.toLowerCase().includes('llama')) {
      // Check if it's a "fast" variant first
      if (model.toLowerCase().includes('(fast)')) {
        return this.callGroq(model, prompt, systemPrompt);
      }
      return this.callHuggingFace(model, prompt, systemPrompt);
    } else {
      // Fallback to mock response
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private async callOpenAI(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    if (!this.openAIApiKey) {
      console.warn('OpenAI API key not found, using mock response');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }

    try {
      // Map friendly names to OpenAI model IDs
      const modelMap: { [key: string]: string } = {
        'gpt-4': 'gpt-4',
        'gpt-3.5 turbo': 'gpt-3.5-turbo',
        'gpt-3.5-turbo': 'gpt-3.5-turbo',
        'gpt-35': 'gpt-3.5-turbo',
        'gpt35': 'gpt-3.5-turbo',
      };

      const openAIModel = modelMap[model.toLowerCase()] || 'gpt-3.5-turbo';

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openAIModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      return {
        content: data.choices[0].message.content,
        model: model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      console.log('Falling back to mock response due to API error');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private async callAnthropic(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    if (!this.anthropicApiKey) {
      console.warn('Anthropic API key not found, using mock response');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }

    try {
      // Map friendly names to Anthropic model IDs
      const modelMap: { [key: string]: string } = {
        'claude-3-opus': 'claude-3-opus-20240229',
        'claude-3-sonnet': 'claude-3-sonnet-20240229',
        'claude-3-haiku': 'claude-3-haiku-20240307',
        'claude 3 sonnet': 'claude-3-sonnet-20240229',
        'claude': 'claude-3-sonnet-20240229',
      };

      const anthropicModel = modelMap[model.toLowerCase()] || 'claude-3-sonnet-20240229';

      const messages = [{
        role: 'user',
        content: prompt
      }];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: anthropicModel,
          messages: messages,
          system: systemPrompt,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Anthropic API error:', response.status, errorData);
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.content || !data.content[0]?.text) {
        throw new Error('Invalid response format from Anthropic');
      }

      return {
        content: data.content[0].text,
        model: model,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      console.log('Falling back to mock response due to API error');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private async callGroq(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse> {
    if (!this.groqApiKey) {
      console.warn('Groq API key not found, using mock response');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }

    try {
      // Map friendly names to Groq model IDs
      const modelMap: { [key: string]: string } = {
        'llama 3.1 (fast)': 'llama3-8b-8192',
        'llama-3.1-fast': 'llama3-8b-8192',
        'mixtral (fast)': 'mixtral-8x7b-32768',
        'mixtral-fast': 'mixtral-8x7b-32768',
        'groq-llama': 'llama3-8b-8192',
        'groq-mixtral': 'mixtral-8x7b-32768',
      };

      const groqModel = modelMap[model.toLowerCase()] || 'llama3-8b-8192';

      const messages = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error:', response.status, errorData);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Invalid response format from Groq');
      }

      return {
        content: data.choices[0].message.content,
        model: model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('Groq API error:', error);
      console.log('Falling back to mock response due to API error');
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
      // Map friendly names to Google AI model IDs
      const modelMap: { [key: string]: string } = {
        'gemini-pro': 'gemini-pro',
        'gemini pro': 'gemini-pro',
        'gemini': 'gemini-pro',
        'gemini pro (free)': 'gemini-pro',
      };

      const googleModel = modelMap[model.toLowerCase()] || 'gemini-pro';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${this.googleApiKey}`;
      
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

      console.log(`Calling Google AI API for model: ${googleModel}`);
      
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
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('LLM API error:', error);
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
        'mixtral (fast)': 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'llama-2-70b': 'meta-llama/Llama-2-70b-chat-hf',
        'llama 2 (free)': 'meta-llama/Llama-2-70b-chat-hf',
        'llama 3.1 (fast)': 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      };

      const hfModel = modelMap[model.toLowerCase()] || model;
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
      console.log('Falling back to mock response due to API error');
      return this.generateMockResponse(model, prompt, systemPrompt);
    }
  }

  private generateMockResponse(model: string, prompt: string, systemPrompt?: string): LLMResponse {
    // Check if this is a debate context
    const isDebate = systemPrompt?.includes('debate') || prompt.includes('position:');
    
    if (isDebate) {
      // Extract position and topic from prompt
      const isPro = prompt.includes('position: pro');
      const topicMatch = prompt.match(/Topic: (.+?)(?:\n|$)/);
      const topic = topicMatch?.[1] || 'the topic';
      
      // Extract turn number to vary responses
      const turnCount = (prompt.match(/Previous arguments:/g) || []).length;
      
      // Generate debate-specific responses that actually address the topic
      const generateDebateResponse = (isPro: boolean, topic: string, turnNumber: number): string => {
        if (turnNumber === 0) {
          // Opening arguments
          if (isPro) {
            return `I firmly believe that ${topic}. This position is supported by several compelling arguments. First, consider the cultural impact and influence this has had on society. Second, the evidence of quality and consistency speaks for itself. Third, the emotional and personal connections people have formed demonstrate the profound significance of this statement. These factors combine to make an undeniable case.`;
          } else {
            return `I respectfully disagree with the assertion that ${topic}. While I understand the appeal of this position, we must examine it critically. First, such absolute statements ignore the subjective nature of artistic preference. Second, there are numerous counterexamples that challenge this claim. Third, the criteria for "best" are highly debatable and context-dependent. We must approach this topic with more nuance.`;
          }
        } else if (turnNumber === 1) {
          // Second turn - responding to opponent
          if (isPro) {
            return `My opponent raises valid concerns about subjectivity, but they miss the crucial point about ${topic}. The evidence isn't just personal preference - it's measurable impact, critical acclaim, and lasting influence. When we examine objective metrics like innovation, consistency, and cultural significance, the conclusion becomes clear. The counterexamples mentioned are outliers that actually prove the rule when examined closely.`;
          } else {
            return `While my opponent appeals to metrics and influence regarding ${topic}, these arguments are fundamentally flawed. Popularity doesn't equal quality, and cultural impact can be negative as well as positive. Furthermore, the so-called "objective metrics" are themselves products of subjective judgment. We must not confuse commercial success or mainstream appeal with artistic merit or universal truth.`;
          }
        } else {
          // Final turn
          if (isPro) {
            return `In conclusion, the debate about ${topic} comes down to recognizing excellence when we see it. My opponent's relativistic approach would have us believe nothing can be definitively valued, but this nihilistic view ignores the consensus of experts, the test of time, and the profound impact on countless individuals. The evidence I've presented isn't just opinion - it's a recognition of demonstrable superiority that transcends personal taste.`;
          } else {
            return `To conclude, the claim that ${topic} represents a dangerous absolutism that stifles diversity and critical thinking. My opponent's arguments, while passionate, rely on circular reasoning and appeal to popularity. True appreciation requires acknowledging multiple perspectives and recognizing that "best" is a contextual, not universal, designation. We do ourselves a disservice by making such sweeping declarations.`;
          }
        }
      };
      
      const response = generateDebateResponse(isPro, topic, turnCount);
      
      return {
        content: response,
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
