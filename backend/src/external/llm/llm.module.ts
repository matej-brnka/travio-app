import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { OpenAiProvider } from './providers/openai.provider';
import { LlmCallsService } from './llm-calls.service';

@Module({
  imports: [ConfigModule],
  controllers: [LlmController],
  providers: [LlmService, OpenAiProvider, LlmCallsService],
  exports: [LlmService],
})
export class LlmModule {}
