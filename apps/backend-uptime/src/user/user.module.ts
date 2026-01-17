import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { envs } from '../config/envs.schema';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: envs.secret_jwt,
      signOptions: { expiresIn: envs.jwt_expires_in },
    }),
  ],
})
export class UserModule {}
