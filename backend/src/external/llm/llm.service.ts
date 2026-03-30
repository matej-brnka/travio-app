import { Injectable } from '@nestjs/common';
import { LlmActor, LlmMessage, LlmOptions, LlmProvider } from './interfaces/llm-provider.interface';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class LlmService {
  private provider: LlmProvider;

  constructor(private openAiProvider: OpenAiProvider) {
    this.provider = this.openAiProvider;
  }

  async generateCompletion(messages: LlmMessage[], options?: LlmOptions, actor?: LlmActor): Promise<string> {
    return this.provider.generateCompletion(messages, options, actor);
  }

  async generateJson<T>(messages: LlmMessage[], options?: LlmOptions, actor?: LlmActor): Promise<T> {
    const result = await this.provider.generateCompletion(messages, {
      ...options,
      responseFormat: 'json_object',
    }, actor);
    return JSON.parse(result) as T;
  }
}
