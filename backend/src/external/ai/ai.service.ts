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
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private llm: LlmService) {}

  async generateItinerary(params: AiParams): Promise<AiPlace[]> {
    const days = this.daysBetween(params.dateFrom, params.dateTo);
    
    try {
      const result = await this.llm.generateJson<{ places: AiPlace[] }>([
        { role: 'system', content: ITINERARY_PROMPTS.system },
        { role: 'user', content: ITINERARY_PROMPTS.user(params.destination, days, params.interests) },
      ]);

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
