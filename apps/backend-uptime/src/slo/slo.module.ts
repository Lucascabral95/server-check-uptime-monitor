import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SloController } from './slo.controller';
import { SloService } from './slo.service';
import { UserModule } from 'src/user/user.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
@Module({
  imports: [PrismaModule, UserModule, JwtModuleModule],
  controllers: [SloController],
  providers: [SloService],
})
export class SloModule {}
