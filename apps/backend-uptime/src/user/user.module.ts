import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';

@Module({
  controllers: [UserController],
  providers: [
    UserService, 
    JwtStrategy, 
    JwtAuthGuard,
  ],
  imports: [
    PrismaModule,
    JwtModuleModule,
  ],
  exports: [UserService, JwtAuthGuard],
})
export class UserModule {}
