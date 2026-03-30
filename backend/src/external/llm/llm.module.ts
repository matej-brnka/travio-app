import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { OpenAiProvider } from './providers/openai.provider';
import { LlmCallsService } from './llm-calls.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [LlmController],
  providers: [LlmService, OpenAiProvider, LlmCallsService],
  exports: [LlmService],
})
export class LlmModule {}
