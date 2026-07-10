import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StatusPageController } from './status-page.controller';
import { StatusPageService } from './status-page.service';
import { UserModule } from 'src/user/user.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';

@Module({
  imports: [PrismaModule, UserModule, JwtModuleModule],
  controllers: [StatusPageController],
  providers: [StatusPageService],
  exports: [StatusPageService],
})
export class StatusPageModule {}
