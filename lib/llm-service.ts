// lib/llm-service.ts
export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface DebateContext {
  topic: string;
  position: 'pro' | 'con';
  opponentPosition: 'pro' | 'con';
  previousTurns: Array<{
    speaker: string;
    message: string;
  }>;
}

export interface LLMService {
  generateResponse(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse>;
  
  generateDebateResponse(
    model: string,
    context: DebateContext
  ): Promise<LLMResponse>;
}

// Base implementation with debate-specific logic
export abstract class BaseLLMService implements LLMService {
  abstract generateResponse(
    model: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<LLMResponse>;

  async generateDebateResponse(
    model: string,
    context: DebateContext
  ): Promise<LLMResponse> {
    const systemPrompt = `You are participating in a formal debate on the topic: "${context.topic}". 
You are arguing for the ${context.position} position. Your opponent is arguing for the ${context.opponentPosition} position.
Be persuasive, use logical arguments, cite evidence when possible, and directly address your opponent's points.
Keep your response focused and under 200 words.`;

    let prompt = `Topic: ${context.topic}\nYour position: ${context.position}\n\n`;
    
    if (context.previousTurns.length > 0) {
      prompt += "Previous arguments:\n";
      context.previousTurns.forEach((turn, index) => {
        prompt += `${turn.speaker}: ${turn.message}\n\n`;
      });
      prompt += "Now provide your response, addressing the opponent's latest points:";
    } else {
      prompt += "Please provide your opening argument:";
    }

    return this.generateResponse(model, prompt, systemPrompt);
  }
}
