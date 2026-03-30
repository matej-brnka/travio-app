import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RolesService } from './roles.service';

@Controller('auth')
export class AuthController {
  constructor(private roles: RolesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { userId: string; email: string }) {
    const role = await this.roles.getRole(user.userId);
    return { ...user, role, isAdmin: role === 'admin' };
  }
}
