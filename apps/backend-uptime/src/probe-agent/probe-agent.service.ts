import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { InternalAlertService } from 'src/observability/internal-alert.service';

@Injectable()
export class ProbeAgentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProbeAgentService.name);
  private timer?: NodeJS.Timeout;
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly platformAlerts?: InternalAlertService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => void this.reconcileStaleAgents(), 60000);
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async register(name: string, region: string, version: string) {
    const token = randomBytes(32).toString('base64url');
    const agent = await this.prisma.probeAgent.create({
      data: { name, region, version, tokenHash: createHash('sha256').update(token).digest('hex') },
      select: { id: true, name: true, region: true, version: true },
    });
    return { agent, token };
  }
  async authenticate(region: string, token: string) {
    const agent = await this.prisma.probeAgent.findUnique({ where: { region } });
    if (!agent || !agent.enabled || !this.matches(token, agent.tokenHash))
      throw new ForbiddenException('Invalid probe agent credentials');
    return agent;
  }
  async heartbeat(
    region: string,
    token: string,
    version: string,
    queueLagMs: number,
    capacity: number,
  ) {
    const agent = await this.authenticate(region, token);
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.probeAgent.update({
        where: { id: agent.id },
        data: { lastSeenAt: now, version },
      }),
      this.prisma.agentHeartbeat.create({
        data: { agentId: agent.id, version, queueLagMs, capacity },
      }),
    ]);
    return { accepted: true, receivedAt: now };
  }
  async dispatch(
    runId: string,
    monitorId: string,
    url: string,
    workspaceId: string | null,
    timeoutMs = 10000,
  ) {
    const agents = await this.prisma.probeAgent.findMany({
      where: { enabled: true, OR: [{ workspaceId: null }, { workspaceId }] },
      select: { id: true },
    });
    if (agents.length) {
      await this.prisma.probeAssignment.createMany({
        data: agents.map(agent => ({ agentId: agent.id, runId, monitorId, url, timeoutMs })),
        skipDuplicates: true,
      });
    }
    return agents.length;
  }
  async claimJobs(region: string, token: string, limit = 10) {
    const agent = await this.authenticate(region, token);
    const now = new Date();
    const jobs = await this.prisma.probeAssignment.findMany({
      where: {
        agentId: agent.id,
        OR: [{ status: 'PENDING' }, { status: 'LEASED', leasedUntil: { lt: now } }],
      },
      orderBy: { createdAt: 'asc' },
      take: Math.min(limit, 50),
    });
    const leasedUntil = new Date(Date.now() + 30000);
    await Promise.all(
      jobs.map(job =>
        this.prisma.probeAssignment.update({
          where: { id: job.id },
          data: { status: 'LEASED', leasedUntil },
        }),
      ),
    );
    return jobs.map(job => ({
      assignmentId: job.id,
      runId: job.runId,
      monitorId: job.monitorId,
      url: job.url,
      method: job.method,
      timeoutMs: job.timeoutMs,
    }));
  }
  async receiveResult(
    region: string,
    token: string,
    input: {
      runId: string;
      monitorId: string;
      success: boolean;
      statusCode: number;
      durationMs: number;
      error?: string;
    },
    signature?: string,
  ) {
    const agent = await this.authenticate(region, token);
    if (!signature || !this.verifySignature(token, input, signature))
      throw new ForbiddenException('Invalid probe result signature');
    if (agent.workspaceId) {
      const monitor = await this.prisma.monitor.findFirst({
        where: { id: input.monitorId, workspaceId: agent.workspaceId },
        select: { id: true },
      });
      if (!monitor) throw new NotFoundException('Monitor is outside the probe agent workspace');
    }
    await this.prisma.probeResult.upsert({
      where: { runId_region: { runId: input.runId, region } },
      create: {
        runId: input.runId,
        region,
        monitorId: input.monitorId,
        success: input.success,
        statusCode: input.statusCode,
        durationMs: input.durationMs,
        error: input.error,
      },
      update: {
        success: input.success,
        statusCode: input.statusCode,
        durationMs: input.durationMs,
        error: input.error,
      },
    });
    await this.prisma.probeAssignment.updateMany({
      where: { agentId: agent.id, runId: input.runId, monitorId: input.monitorId },
      data: {
        status: input.success ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        leasedUntil: null,
      },
    });
    const results = await this.prisma.probeResult.findMany({
      where: { runId: input.runId, monitorId: input.monitorId },
      select: { success: true, region: true },
    });
    if (results.length >= 2) {
      const passed = results.filter(item => item.success).length;
      const status = passed === results.length ? 'UP' : passed > 0 ? 'DEGRADED' : 'DOWN';
      await this.prisma.monitor.update({
        where: { id: input.monitorId },
        data: { status, lastCheck: new Date() },
      });
    }
    return { accepted: true, agentRegion: agent.region, regionsReceived: results.length };
  }
  listAgents() {
    return this.prisma.probeAgent.findMany({
      select: {
        id: true,
        name: true,
        region: true,
        version: true,
        enabled: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: { region: 'asc' },
    });
  }
  async health() {
    const staleBefore = new Date(Date.now() - 90000);
    const agents = await this.prisma.probeAgent.findMany({
      select: {
        id: true,
        name: true,
        region: true,
        version: true,
        enabled: true,
        lastSeenAt: true,
        heartbeats: {
          orderBy: { receivedAt: 'desc' },
          take: 1,
          select: { queueLagMs: true, capacity: true, receivedAt: true },
        },
      },
    });
    return agents.map(agent => ({
      ...agent,
      healthy: !agent.enabled || Boolean(agent.lastSeenAt && agent.lastSeenAt >= staleBefore),
      latestHeartbeat: agent.heartbeats[0] ?? null,
    }));
  }
  private async reconcileStaleAgents() {
    const stale = (await this.health()).filter(agent => agent.enabled && !agent.healthy);
    for (const agent of stale) {
      this.logger.error(`Probe agent stale: ${agent.region}; no heartbeat in the last 90 seconds`);
      this.platformAlerts?.raise(
        `probe-agent:${agent.region}`,
        'critical',
        `Probe agent ${agent.region} has missed its heartbeat`,
      );
    }
    for (const agent of (await this.health()).filter(item => item.healthy))
      this.platformAlerts?.resolve(`probe-agent:${agent.region}`);
    return stale.length;
  }
  private matches(token: string, hash: string) {
    const actual = createHash('sha256').update(token).digest('hex');
    return actual.length === hash.length && timingSafeEqual(Buffer.from(actual), Buffer.from(hash));
  }
  private verifySignature(token: string, payload: unknown, signature: string) {
    const expected = createHmac('sha256', token).update(JSON.stringify(payload)).digest('hex');
    return (
      expected.length === signature.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    );
  }
}
