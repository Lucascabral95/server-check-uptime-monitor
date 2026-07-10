import { Module } from '@nestjs/common';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
@Module({
  imports: [PrismaModule, UserModule, JwtModuleModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
