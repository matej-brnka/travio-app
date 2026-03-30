import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RolesService } from './roles.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private roles: RolesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { userId?: string } | undefined;

    if (!user?.userId) throw new UnauthorizedException();

    const isAdmin = await this.roles.isAdmin(user.userId);
    if (!isAdmin) throw new ForbiddenException('Admin only');

    return true;
  }
}
