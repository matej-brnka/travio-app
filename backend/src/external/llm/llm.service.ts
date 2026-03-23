import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmMessage, LlmOptions, LlmProvider } from './interfaces/llm-provider.interface';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class LlmService implements OnModuleInit {
  private provider: LlmProvider;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    // Default provider is OpenAI. Can be made configurable via env if needed.
    this.provider = new OpenAiProvider(this.config);
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
