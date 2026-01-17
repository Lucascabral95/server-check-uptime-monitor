import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { envs } from '../config/envs.schema';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy, JwtAuthGuard],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: envs.secret_jwt,
      signOptions: { expiresIn: envs.jwt_expires_in },
    }),
  ],
  exports: [UserService, JwtAuthGuard],
})
export class UserModule {}
