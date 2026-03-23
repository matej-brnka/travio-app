import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PlacesModule } from '../../places/places.module';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [PlacesModule, LlmModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
