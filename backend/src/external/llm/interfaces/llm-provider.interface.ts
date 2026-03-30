export interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmActor {
  userId?: string;
  userEmail?: string;
}

export interface LlmProvider {
  generateCompletion(messages: LlmMessage[], options?: LlmOptions, actor?: LlmActor): Promise<string>;
}
