import { BadRequestException, Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createHmac, randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { SecretEnvelopeService } from 'src/uptime/services/secret-envelope.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { EventsService } from 'src/uptime/services/events.service';
import { Subscription } from 'rxjs';
import { Prisma } from '@prisma/client';
import { CreateAlertPolicyDto, CreateNotificationChannelDto } from './dto';

@Injectable()
export class AlertingService implements OnModuleInit, OnModuleDestroy {
  private subscription?: Subscription;
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly secrets: SecretEnvelopeService,
    @InjectQueue(QUEUES_NAME.NOTIFICATIONS) private readonly queue: Queue,
    private readonly events: EventsService,
  ) {}
  onModuleInit() {
    this.subscription = this.events.events$.subscribe(event => {
      if (event.type === 'monitor.status_changed' && event.workspaceId)
        void this.handleStateChange(
          event.monitorId,
          event.workspaceId,
          String(event.payload.status),
        );
    });
  }
  onModuleDestroy() {
    this.subscription?.unsubscribe();
  }
  private async handleStateChange(monitorId: string, workspaceId: string, status: string) {
    const incident = await this.prisma.incident.findFirst({
      where: { monitorId, status: status === 'UP' ? 'RESOLVED' : 'ONGOING' },
      orderBy: { createdAt: 'desc' },
    });
    if (incident)
      await this.enqueueIncidentNotifications(incident.id, monitorId, workspaceId, status);
  }

  listChannels(workspaceId: string) {
    return this.prisma.notificationChannel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, type: true, enabled: true, createdAt: true, updatedAt: true },
    });
  }

  async createChannel(workspaceId: string, dto: CreateNotificationChannelDto) {
    this.validateChannelConfig(dto.type, dto.config);
    const config = this.protectConfig(dto.config);
    return this.prisma.notificationChannel.create({
      data: {
        workspaceId,
        name: dto.name,
        type: dto.type,
        config: config as Prisma.InputJsonValue,
      },
    });
  }

  async createPolicy(workspaceId: string, dto: CreateAlertPolicyDto) {
    const channels = await this.prisma.notificationChannel.findMany({
      where: { id: { in: dto.channelIds }, workspaceId },
      select: { id: true },
    });
    if (channels.length !== dto.channelIds.length)
      throw new NotFoundException('Notification channel not found in workspace');
    const monitors = await this.prisma.monitor.findMany({
      where: { id: { in: dto.monitorIds }, workspaceId },
      select: { id: true },
    });
    if (monitors.length !== dto.monitorIds.length)
      throw new NotFoundException('Monitor not found in workspace');
    return this.prisma.alertPolicy.create({
      data: {
        workspaceId,
        name: dto.name,
        severity: dto.severity,
        monitorIds: dto.monitorIds,
        cooldownSeconds: dto.cooldownSeconds ?? 300,
        recoveryEnabled: dto.recoveryEnabled ?? true,
        channels: { connect: dto.channelIds.map(id => ({ id })) },
      },
      include: { channels: { select: { id: true, name: true, type: true } } },
    });
  }

  listPolicies(workspaceId: string) {
    return this.prisma.alertPolicy.findMany({
      where: { workspaceId },
      include: { channels: { select: { id: true, name: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async testChannel(workspaceId: string, channelId: string) {
    const channel = await this.prisma.notificationChannel.findFirst({
      where: { id: channelId, workspaceId },
    });
    if (!channel) throw new NotFoundException('Notification channel not found');
    const delivery = await this.prisma.notificationDelivery.create({
      data: {
        channelId,
        idempotencyKey: `test:${channelId}:${Date.now()}`,
        payload: { status: 'TEST', message: 'Server Check notification test' },
      },
    });
    await this.deliver(delivery.id);
    return { sent: true, deliveryId: delivery.id };
  }

  async enqueueIncidentNotifications(
    incidentId: string,
    monitorId: string,
    workspaceId: string | null,
    status: string,
  ) {
    if (!workspaceId) return [];
    const policies = await this.prisma.alertPolicy.findMany({
      where: { workspaceId, enabled: true },
      include: { channels: true },
    });
    const matching = policies.filter(
      policy =>
        Array.isArray(policy.monitorIds) && (policy.monitorIds as string[]).includes(monitorId),
    );
    const created: string[] = [];
    for (const policy of matching) {
      for (const channel of policy.channels.filter(item => item.enabled)) {
        const idempotencyKey = `${incidentId}:${channel.id}:${status}`;
        const delivery = await this.prisma.notificationDelivery.upsert({
          where: { idempotencyKey },
          create: {
            channelId: channel.id,
            policyId: policy.id,
            monitorId,
            incidentId,
            idempotencyKey,
            payload: { incidentId, monitorId, status, severity: policy.severity },
          },
          update: {},
        });
        created.push(delivery.id);
        await this.queue.add(
          `notification-${delivery.id}`,
          { deliveryId: delivery.id },
          { jobId: delivery.id },
        );
      }
    }
    return created;
  }

  async deliver(deliveryId: string) {
    const delivery = await this.prisma.notificationDelivery.findUnique({
      where: { id: deliveryId },
      include: { channel: true },
    });
    if (!delivery || delivery.status === 'SENT') return;
    const config = this.revealConfig(delivery.channel.config as Record<string, unknown>);
    const payload = delivery.payload as Record<string, unknown>;
    try {
      if (delivery.channel.type === 'EMAIL')
        await this.email.sendEmail({
          to: String(config.email),
          subject: `Monitor ${payload.status}`,
          textBody: JSON.stringify(payload),
        });
      else {
        const endpoint = String(config.url ?? config.webhookUrl ?? '');
        if (!endpoint.startsWith('https://')) throw new Error('Webhook endpoint must use HTTPS');
        const body = JSON.stringify(payload);
        const signature = createHmac('sha256', String(config.secret ?? randomUUID()))
          .update(body)
          .digest('hex');
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-server-check-signature': signature },
          body,
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error(`Notification provider returned ${response.status}`);
      }
      await this.prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: { status: 'SENT', sentAt: new Date(), attempts: { increment: 1 } },
      });
    } catch (error) {
      await this.prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : 'Delivery failed',
          nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** delivery.attempts)),
        },
      });
      throw error;
    }
  }

  private protectConfig(config: Record<string, unknown>) {
    const copy = { ...config };
    for (const key of ['secret', 'token', 'password'])
      if (typeof copy[key] === 'string') copy[key] = this.secrets.encrypt(copy[key] as string);
    return copy;
  }
  private revealConfig(config: Record<string, unknown>) {
    const copy = { ...config };
    for (const key of ['secret', 'token', 'password'])
      if (copy[key]) copy[key] = this.secrets.decrypt(copy[key]);
    return copy;
  }
  private validateChannelConfig(type: CreateNotificationChannelDto['type'], config: Record<string, unknown>) {
    if (type === 'EMAIL' && typeof config.email !== 'string') throw new BadRequestException('EMAIL channel requires config.email');
    if (type !== 'EMAIL' && (typeof config.url !== 'string' || !config.url.startsWith('https://'))) throw new BadRequestException('Webhook channels require an HTTPS config.url');
    if (type !== 'EMAIL' && typeof config.secret !== 'string') throw new BadRequestException('Webhook channels require config.secret');
  }
}
