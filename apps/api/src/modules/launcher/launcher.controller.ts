import { Controller, Post, Get, Body } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LauncherService } from './launcher.service';
import { ApplyDto } from './dto/apply.dto';
import type { UserRole } from '@fellowx/shared';

@Controller('launchers')
export class LauncherController {
  constructor(private readonly launcherService: LauncherService) {}

  @Post('apply')
  @Roles('MEMBER' as UserRole)
  apply(@CurrentUser() user: { id: string }, @Body() dto: ApplyDto) {
    return this.launcherService.apply(user.id, dto);
  }

  @Get('apply/mine')
  @Roles('MEMBER' as UserRole)
  findMyApplication(@CurrentUser() user: { id: string }) {
    return this.launcherService.findMyApplication(user.id);
  }
}
