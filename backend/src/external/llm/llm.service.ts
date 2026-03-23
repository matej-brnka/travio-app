import { Injectable } from '@nestjs/common';
import { LlmMessage, LlmOptions, LlmProvider } from './interfaces/llm-provider.interface';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class LlmService {
  private provider: LlmProvider;

  constructor(private openAiProvider: OpenAiProvider) {
    this.provider = this.openAiProvider;
  }

  async generateCompletion(messages: LlmMessage[], options?: LlmOptions): Promise<string> {
    return this.provider.generateCompletion(messages, options);
  }

  async generateJson<T>(messages: LlmMessage[], options?: LlmOptions): Promise<T> {
    const result = await this.provider.generateCompletion(messages, {
      ...options,
      responseFormat: 'json_object',
    });
    return JSON.parse(result) as T;
  }
}
