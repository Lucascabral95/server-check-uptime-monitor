import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProbeAgentController } from './probe-agent.controller';
import { ProbeAgentService } from './probe-agent.service';
import { UserModule } from 'src/user/user.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
@Module({
  imports: [PrismaModule, UserModule, JwtModuleModule],
  controllers: [ProbeAgentController],
  providers: [ProbeAgentService],
  exports: [ProbeAgentService],
})
export class ProbeAgentModule {}
