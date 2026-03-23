import { Controller, Get, Query } from '@nestjs/common';
import { LlmCallsService } from './llm-calls.service';

@Controller('llm')
export class LlmController {
  constructor(private llmCalls: LlmCallsService) {}

  @Get('calls')
  async calls(@Query('limit') limit?: string) {
    const parsed = Number.parseInt(limit ?? '100', 10);
    return { calls: await this.llmCalls.listCalls(Number.isNaN(parsed) ? 100 : parsed) };
  }
}
