import { Injectable } from '@nestjs/common';
import { CheckRunStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface CheckRunResult {
  runId: string;
  region: string;
  monitorId: string;
  statusCode: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

type CheckRunWriter = Pick<Prisma.TransactionClient, 'checkRun' | 'pingLog' | 'probeResult'>;

@Injectable()
export class CheckRunService {
  constructor(private readonly prisma: PrismaService) {}

  async begin(runId: string, monitorId: string, region = 'primary'): Promise<boolean> {
    const existing = await this.prisma.checkRun.findUnique({
      where: { runId_region: { runId, region } },
      select: { status: true },
    });

    if (existing?.status === CheckRunStatus.SUCCEEDED) {
      return false;
    }

    await this.prisma.checkRun.upsert({
      where: { runId_region: { runId, region } },
      create: { runId, region, monitorId, statusCode: 0 },
      update: {
        monitorId,
        status: CheckRunStatus.PROCESSING,
        completedAt: null,
        error: null,
      },
    });

    return true;
  }

  async recordFailure(result: CheckRunResult): Promise<void> {
    await this.prisma.$transaction(tx => this.persistResult(tx, result, CheckRunStatus.FAILED));
  }

  async persistSuccess(tx: CheckRunWriter, result: CheckRunResult): Promise<void> {
    await this.persistResult(tx, result, CheckRunStatus.SUCCEEDED);
  }

  private async persistResult(
    tx: CheckRunWriter,
    result: CheckRunResult,
    status: CheckRunStatus,
  ): Promise<void> {
    const completedAt = new Date();

    await tx.checkRun.upsert({
      where: { runId_region: { runId: result.runId, region: result.region } },
      create: {
        runId: result.runId,
        region: result.region,
        monitorId: result.monitorId,
        status,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        success: result.success,
        error: result.error ?? null,
        completedAt,
      },
      update: {
        monitorId: result.monitorId,
        status,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        success: result.success,
        error: result.error ?? null,
        completedAt,
      },
    });

    await tx.pingLog.upsert({
      where: { runId: result.runId },
      create: {
        runId: result.runId,
        monitorId: result.monitorId,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        success: result.success,
        error: result.error ?? null,
        timestamp: completedAt,
      },
      update: {
        monitorId: result.monitorId,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        success: result.success,
        error: result.error ?? null,
        timestamp: completedAt,
      },
    });

    await tx.probeResult.upsert({
      where: { runId_region: { runId: result.runId, region: result.region } },
      create: {
        runId: result.runId,
        region: result.region,
        monitorId: result.monitorId,
        success: result.success,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        error: result.error ?? null,
        checkedAt: completedAt,
      },
      update: {
        monitorId: result.monitorId,
        success: result.success,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        error: result.error ?? null,
        checkedAt: completedAt,
      },
    });
  }
}
