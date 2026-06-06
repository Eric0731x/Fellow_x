import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { Ownership } from '../../common/decorators/ownership.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RegistrationService } from './registration.service';
import { RegisterDto } from './dto/register.dto';
import { ReviewDto } from './dto/review.dto';
import { RegistrationQueryDto } from './dto/registration-query.dto';
import type { UserRole } from '@fellowx/shared';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('activities/:id/register')
  @Roles('MEMBER' as UserRole)
  register(@CurrentUser() user: { id: string }, @Param('id') activityId: string, @Body() dto: RegisterDto) {
    return this.registrationService.register(user.id, activityId, dto);
  }

  @Get('registrations/mine')
  @Roles('MEMBER' as UserRole)
  findMine(@CurrentUser() user: { id: string }, @Query() query: RegistrationQueryDto) {
    return this.registrationService.findMine(user.id, query);
  }

  @Post('registrations/:id/cancel')
  @Roles('MEMBER' as UserRole)
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.registrationService.cancel(user.id, id);
  }

  @Get('activities/:id/registrations')
  @Roles('LAUNCHER' as UserRole)
  @Ownership('activity')
  findByActivity(@Param('id') activityId: string, @Query() query: RegistrationQueryDto) {
    return this.registrationService.findByActivity(activityId, query);
  }

  @Post('registrations/:id/review')
  @Roles('LAUNCHER' as UserRole)
  review(@Param('id') id: string, @Body() dto: ReviewDto) {
    return this.registrationService.review(id, dto);
  }
}
