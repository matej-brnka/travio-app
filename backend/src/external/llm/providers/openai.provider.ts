import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmMessage, LlmOptions, LlmProvider } from '../interfaces/llm-provider.interface';

export class OpenAiProvider implements LlmProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly apiKey: string | undefined;
  private readonly defaultModel: string;
  private readonly defaultTemperature: number;
  private readonly defaultMaxTokens: number;

  constructor(private config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY');
    this.defaultModel = config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
    this.defaultTemperature = parseFloat(config.get<string>('OPENAI_TEMPERATURE') ?? '0.7');
    this.defaultMaxTokens = parseInt(config.get<string>('OPENAI_MAX_TOKENS') ?? '1000');
  }

  async generateCompletion(messages: LlmMessage[], options?: LlmOptions): Promise<string> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('OpenAI API key is not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model ?? this.defaultModel,
          messages: messages,
          temperature: options?.temperature ?? this.defaultTemperature,
          max_tokens: options?.maxTokens ?? this.defaultMaxTokens,
          response_format: options?.responseFormat ? { type: options.responseFormat } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
        throw new ServiceUnavailableException(`LLM Provider Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? '';
    } catch (error) {
      this.logger.error(`Failed to generate completion from OpenAI: ${error.message}`);
      throw error;
    }
  }
}
