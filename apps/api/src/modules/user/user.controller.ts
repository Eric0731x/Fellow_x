import { Controller, Get, Put, Delete, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { UserRole } from '@fellowx/shared';

@Controller('members')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Roles('MEMBER' as UserRole)
  getMe(@CurrentUser() user: { id: string }) {
    return this.userService.getMe(user.id);
  }

  @Put('me')
  @Roles('MEMBER' as UserRole)
  updateMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.userService.updateMe(user.id, dto);
  }

  @Delete('me')
  @Roles('MEMBER' as UserRole)
  @HttpCode(HttpStatus.OK)
  deactivate(@CurrentUser() user: { id: string }) {
    return this.userService.deactivate(user.id);
  }
}
