import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const ALLOWED_SCOPES = new Set([
  'monitors:read',
  'monitors:write',
  'incidents:read',
  'projects:read',
]);

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string) {
    return this.prisma.apiKey.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        prefix: true,
        scopes: true,
        expiresAt: true,
        revokedAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    workspaceId: string,
    actorId: string,
    name: string,
    scopes: string[],
    expiresAt?: Date,
  ) {
    const invalidScopes = scopes.filter(scope => !ALLOWED_SCOPES.has(scope));
    if (scopes.length === 0 || invalidScopes.length > 0) {
      throw new BadRequestException('API key scopes are invalid');
    }
    const rawKey = `sc_${randomBytes(32).toString('base64url')}`;
    const prefix = rawKey.slice(0, 10);
    try {
      const apiKey = await this.prisma.apiKey.create({
        data: { workspaceId, name: name.trim(), prefix, keyHash: hash(rawKey), scopes, expiresAt },
        select: {
          id: true,
          name: true,
          prefix: true,
          scopes: true,
          expiresAt: true,
          createdAt: true,
        },
      });
      await this.prisma.auditLog.create({
        data: {
          workspaceId,
          actorUserId: actorId,
          action: 'api_key.created',
          entityType: 'ApiKey',
          entityId: apiKey.id,
          metadata: { name, scopes },
        },
      });
      return { ...apiKey, key: rawKey };
    } catch (error) {
      if (error?.code === 'P2002') throw new ConflictException('API key already exists');
      throw error;
    }
  }

  async revoke(workspaceId: string, actorId: string, id: string) {
    const result = await this.prisma.apiKey.updateMany({
      where: { id, workspaceId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundException('API key not found or already revoked');
    await this.prisma.auditLog.create({
      data: {
        workspaceId,
        actorUserId: actorId,
        action: 'api_key.revoked',
        entityType: 'ApiKey',
        entityId: id,
      },
    });
    return { revoked: true };
  }
}
