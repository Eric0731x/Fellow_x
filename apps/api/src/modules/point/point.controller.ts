import { Controller, Get, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PointService } from './point.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import type { UserRole } from '@fellowx/shared';

@Controller('points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('summary')
  @Roles('MEMBER' as UserRole)
  getSummary(@CurrentUser() user: { id: string }) {
    return this.pointService.getSummary(user.id);
  }

  @Get('transactions')
  @Roles('MEMBER' as UserRole)
  getTransactions(@CurrentUser() user: { id: string }, @Query() query: TransactionQueryDto) {
    return this.pointService.getTransactions(user.id, query);
  }

  @Post('daily-check-in')
  @Roles('MEMBER' as UserRole)
  dailyCheckIn(@CurrentUser() user: { id: string }) {
    return this.pointService.dailyCheckIn(user.id);
  }
}
