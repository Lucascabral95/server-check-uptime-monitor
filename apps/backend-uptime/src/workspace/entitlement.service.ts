import { ForbiddenException, Injectable } from '@nestjs/common';
import { WorkspacePlan } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export const PLAN_LIMITS: Record<
  WorkspacePlan,
  { members: number; monitors: number; minIntervalSeconds: number }
> = {
  [WorkspacePlan.FREE]: { members: 1, monitors: 5, minIntervalSeconds: 300 },
  [WorkspacePlan.PRO]: { members: 5, monitors: 50, minIntervalSeconds: 60 },
  [WorkspacePlan.BUSINESS]: { members: 20, monitors: 250, minIntervalSeconds: 30 },
};

@Injectable()
export class EntitlementService {
  constructor(private readonly prisma: PrismaService) {}

  async get(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });
    if (!workspace) throw new ForbiddenException('Workspace not found');
    const limits = PLAN_LIMITS[workspace.plan];
    const [members, monitors] = await Promise.all([
      this.prisma.workspaceMembership.count({ where: { workspaceId } }),
      this.prisma.monitor.count({ where: { workspaceId } }),
    ]);
    return { plan: workspace.plan, limits, usage: { members, monitors } };
  }

  async assertMonitorCreationAllowed(workspaceId: string, frequency: number): Promise<void> {
    const entitlement = await this.get(workspaceId);
    if (entitlement.usage.monitors >= entitlement.limits.monitors) {
      throw new ForbiddenException(
        `The ${entitlement.plan} plan allows up to ${entitlement.limits.monitors} monitors`,
      );
    }
    if (frequency < entitlement.limits.minIntervalSeconds) {
      throw new ForbiddenException(
        `The ${entitlement.plan} plan requires an interval of at least ${entitlement.limits.minIntervalSeconds} seconds`,
      );
    }
  }
}
