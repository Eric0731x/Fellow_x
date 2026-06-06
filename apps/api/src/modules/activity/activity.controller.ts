import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Ownership } from '../../common/decorators/ownership.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { LifecycleDto } from './dto/lifecycle.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
import type { UserRole } from '@fellowx/shared';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @Public()
  findAll(@Query() query: ActivityQueryDto) {
    return this.activityService.findAll(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Post()
  @Roles('LAUNCHER' as UserRole)
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateActivityDto) {
    return this.activityService.create(user.id, dto);
  }

  @Put(':id')
  @Roles('LAUNCHER' as UserRole)
  @Ownership('activity')
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activityService.update(id, dto);
  }

  @Post(':id/submit-review')
  @Roles('LAUNCHER' as UserRole)
  @Ownership('activity')
  submitReview(@Param('id') id: string) {
    return this.activityService.submitReview(id);
  }

  @Post(':id/lifecycle')
  @Roles('LAUNCHER' as UserRole)
  @Ownership('activity')
  lifecycle(@Param('id') id: string, @Body() dto: LifecycleDto) {
    return this.activityService.lifecycle(id, dto);
  }

  @Delete(':id')
  @Roles('LAUNCHER' as UserRole)
  @Ownership('activity')
  remove(@Param('id') id: string) {
    return this.activityService.remove(id);
  }
}
