import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AdminReviewDto } from './dto/review.dto';
import type { UserRole } from '@fellowx/shared';

@Controller('admin')
@Roles('ADMIN' as UserRole)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get('members')
  findMembers(@Query() query: Record<string, string>) {
    return this.adminService.findMembers(query);
  }

  @Get('members/:id')
  findMember(@Param('id') id: string) {
    return this.adminService.findMember(id);
  }

  @Put('members/:id/status')
  updateMemberStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminService.updateMemberStatus(id, dto);
  }

  @Post('points/adjust')
  adjustPoints(@Body() dto: AdjustPointsDto, @CurrentUser() admin: { id: string }) {
    return this.adminService.adjustPoints(dto, admin.id);
  }

  @Get('points/transactions')
  findPointTransactions(@Query() query: Record<string, string>) {
    return this.adminService.findPointTransactions(query);
  }

  @Get('point-rules')
  findPointRules() {
    return this.adminService.findPointRules();
  }

  @Put('point-rules/:code')
  updatePointRule(@Param('code') code: string, @Body() dto: Record<string, unknown>) {
    return this.adminService.updatePointRule(code, dto);
  }

  @Get('rewards')
  findRewards() {
    return this.adminService.findRewards();
  }

  @Post('rewards')
  createReward(@Body() dto: Record<string, unknown>) {
    return this.adminService.createReward(dto);
  }

  @Put('rewards/:id')
  updateReward(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.adminService.updateReward(id, dto);
  }

  @Put('rewards/:id/status')
  updateRewardStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.adminService.updateRewardStatus(id, dto);
  }

  @Get('levels')
  findLevels() {
    return this.adminService.findLevels();
  }

  @Put('levels/:id')
  updateLevel(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.adminService.updateLevel(id, dto);
  }

  @Get('activities/review')
  findActivitiesForReview(@Query() query: Record<string, string>) {
    return this.adminService.findActivitiesForReview(query);
  }

  @Post('activities/:id/review')
  reviewActivity(@Param('id') id: string, @Body() dto: AdminReviewDto, @CurrentUser() admin: { id: string }) {
    return this.adminService.reviewActivity(id, dto, admin.id);
  }

  @Get('launchers')
  findLauncherApplications(@Query() query: Record<string, string>) {
    return this.adminService.findLauncherApplications(query);
  }

  @Post('launchers/:id/review')
  reviewLauncherApplication(@Param('id') id: string, @Body() dto: AdminReviewDto) {
    return this.adminService.reviewLauncherApplication(id, dto);
  }
}
