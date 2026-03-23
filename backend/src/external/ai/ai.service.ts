import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { ITINERARY_PROMPTS } from './ai.prompts';

export interface AiParams {
  destination: string;
  dateFrom: string;
  dateTo: string;
  interests: string[];
}

export interface AiPlace {
  name: string;
  dayIndex: number;
  emoji: string;
  note: string;
  priority: 'must-see' | 'chci-videt' | 'mozna';
  ticket?: 'need' | 'none';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private llm: LlmService) {}

  async generateItinerary(params: AiParams): Promise<AiPlace[]> {
    const days = this.daysBetween(params.dateFrom, params.dateTo);
    const systemPrompt = ITINERARY_PROMPTS.system;
    const userPrompt = ITINERARY_PROMPTS.user(params.destination, days, params.interests);
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    this.logger.log('[AI PROMPT][START]');
    this.logger.log(
      `[AI PROMPT][PAYLOAD] ${JSON.stringify(
        {
          responseFormat: 'json_object',
          messages,
        },
        null,
        2,
      )}`,
    );
    this.logger.log('[AI PROMPT][END]');
    
    try {
      const result = await this.llm.generateJson<{ places: AiPlace[] }>(messages);

      return result.places ?? [];
    } catch (err: any) {
      this.logger.error('AI generation failed', err.message);
      return [];
    }
  }

  private daysBetween(from: string, to: string): number {
    const diff = new Date(to).getTime() - new Date(from).getTime();
    return Math.round(diff / 86400000) + 1;
  }
}
