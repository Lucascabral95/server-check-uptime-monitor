import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatusPageService {
  constructor(private readonly prisma: PrismaService) {}
  create(workspaceId: string, name: string, slug: string, description?: string) {
    return this.prisma.statusPage.create({ data: { workspaceId, name, slug, description } });
  }
  async addComponent(statusPageId: string, monitorId: string, name: string) {
    const page = await this.prisma.statusPage.findFirst({
      where: { id: statusPageId, workspace: { monitors: { some: { id: monitorId } } } },
    });
    if (!page) throw new NotFoundException('Status page or monitor not found');
    return this.prisma.statusPageComponent.create({ data: { statusPageId, monitorId, name } });
  }
  list(workspaceId: string) {
    return this.prisma.statusPage.findMany({
      where: { workspaceId },
      include: { components: true },
    });
  }
  async publicPage(slug: string) {
    const page = await this.prisma.statusPage.findFirst({
      where: { slug, isPublished: true },
      include: {
        components: {
          include: { monitor: { select: { id: true, name: true, status: true, lastCheck: true } } },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!page) throw new NotFoundException('Status page not found');
    return {
      id: page.id,
      name: page.name,
      description: page.description,
      updatedAt: page.updatedAt,
      components: page.components.map(item => ({
        id: item.id,
        name: item.name,
        status: item.monitor.status,
        lastCheck: item.monitor.lastCheck,
      })),
    };
  }
  async subscribe(slug: string, email: string) {
    const page = await this.prisma.statusPage.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });
    if (!page) throw new NotFoundException('Status page not found');
    const token = randomBytes(32).toString('base64url');
    await this.prisma.statusPageSubscriber.upsert({
      where: { statusPageId_email: { statusPageId: page.id, email } },
      create: {
        statusPageId: page.id,
        email,
        tokenHash: createHash('sha256').update(token).digest('hex'),
      },
      update: {
        tokenHash: createHash('sha256').update(token).digest('hex'),
        unsubscribedAt: null,
        confirmedAt: null,
      },
    });
    return { accepted: true, confirmationToken: token };
  }
  async confirm(token: string) {
    const subscriber = await this.prisma.statusPageSubscriber.findUnique({
      where: { tokenHash: createHash('sha256').update(token).digest('hex') },
    });
    if (!subscriber) throw new NotFoundException('Subscription token not found');
    return this.prisma.statusPageSubscriber.update({
      where: { id: subscriber.id },
      data: { confirmedAt: new Date(), unsubscribedAt: null },
      select: { id: true, confirmedAt: true },
    });
  }
  async unsubscribe(token: string) {
    const subscriber = await this.prisma.statusPageSubscriber.findUnique({
      where: { tokenHash: createHash('sha256').update(token).digest('hex') },
    });
    if (!subscriber) throw new NotFoundException('Subscription token not found');
    return this.prisma.statusPageSubscriber.update({
      where: { id: subscriber.id },
      data: { unsubscribedAt: new Date() },
      select: { id: true, unsubscribedAt: true },
    });
  }
}
