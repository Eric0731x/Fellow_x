import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RewardService } from './reward.service';
import { RewardQueryDto } from './dto/reward-query.dto';
import type { UserRole } from '@fellowx/shared';

@Controller()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get('rewards')
  @Public()
  findAll(@Query() query: RewardQueryDto) {
    return this.rewardService.findAll(query);
  }

  @Post('rewards/:id/redeem')
  @Roles('MEMBER' as UserRole)
  redeem(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.rewardService.redeem(user.id, id);
  }

  @Get('orders/mine')
  @Roles('MEMBER' as UserRole)
  findMyOrders(@CurrentUser() user: { id: string }, @Query() query: RewardQueryDto) {
    return this.rewardService.findMyOrders(user.id, query);
  }
}
