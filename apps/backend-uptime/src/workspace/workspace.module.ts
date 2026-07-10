import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
import { UserModule } from 'src/user/user.module';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceAccessGuard } from './guards/workspace-access.guard';
import { EntitlementService } from './entitlement.service';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [PrismaModule, JwtModuleModule, UserModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceAccessGuard, EntitlementService, ApiKeyService],
  exports: [WorkspaceService, WorkspaceAccessGuard, EntitlementService],
})
export class WorkspaceModule {}
