import { Module } from '@nestjs/common';
import { CostSummaryController } from './cost-summary.controller';
import { InvitesController } from './invites.controller';
import { InviteGateController } from './invite-gate.controller';

@Module({
  controllers: [CostSummaryController, InvitesController, InviteGateController],
})
export class ServiceModule {}
