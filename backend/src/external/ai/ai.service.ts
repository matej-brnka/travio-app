import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.apiKey = config.get<string>('OPENAI_API_KEY');
    this.model = config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  async generateItinerary(params: AiParams): Promise<AiPlace[]> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('OpenAI API key is not configured');
    }

    const days = this.daysBetween(params.dateFrom, params.dateTo);
    const systemPrompt = `Jsi průvodce cestovního plánování. Generuješ konkrétní seznam zajímavých míst pro cestovní itinerář.
Odpovídáš POUZE ve formátu JSON bez jakéhokoli dalšího textu.`;

    const userPrompt = `Destinace: ${params.destination}
Počet dní: ${days}
Zájmy: ${params.interests.length ? params.interests.join(', ') : 'obecné cestování'}

Vygeneruj seznam max. ${days * 3} zajímavých míst ve formátu:
{"places":[{"name":"...","dayIndex":0,"emoji":"...","note":"...","priority":"must-see|chci-videt|mozna"}]}

dayIndex je 0-based (0 = první den, ${days - 1} = poslední den). Rozlož místa rovnoměrně mezi dny.`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        this.logger.error(`OpenAI responded with ${res.status}`);
        return [];
      }

      const data: any = await res.json();
      const content = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content);
      return parsed.places ?? [];
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
