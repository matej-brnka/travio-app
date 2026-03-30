import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LlmCallsService } from './llm-calls.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdminGuard } from '../../auth/admin.guard';

@Controller('llm')
export class LlmController {
  constructor(private llmCalls: LlmCallsService) {}

  @Get('calls')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async calls(@Query('limit') limit?: string) {
    const parsed = Number.parseInt(limit ?? '100', 10);
    return { calls: await this.llmCalls.listCalls(Number.isNaN(parsed) ? 100 : parsed) };
  }
}
