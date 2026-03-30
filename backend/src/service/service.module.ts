import { Module } from '@nestjs/common';
import { CostSummaryController } from './cost-summary.controller';

@Module({
  controllers: [CostSummaryController],
})
export class ServiceModule {}
