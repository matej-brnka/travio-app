import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RolesService } from './roles.service';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesService, AdminGuard],
  exports: [JwtStrategy, RolesService, AdminGuard],
})
export class AuthModule {}
