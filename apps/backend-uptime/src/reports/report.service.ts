import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { envs } from 'src/config/envs.schema';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}
  createLink(monitorId: string, userId: string, format: 'csv' | 'pdf', expiresInSeconds = 3600) {
    const payload = Buffer.from(
      JSON.stringify({
        monitorId,
        userId,
        format,
        exp: Date.now() + Math.min(expiresInSeconds, 86400) * 1000,
      }),
    ).toString('base64url');
    const signature = createHmac('sha256', envs.secret_jwt).update(payload).digest('base64url');
    return {
      token: `${payload}.${signature}`,
      expiresAt: new Date(Date.now() + Math.min(expiresInSeconds, 86400) * 1000),
    };
  }
  async render(token: string) {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) throw new UnauthorizedException('Invalid report link');
    const expected = createHmac('sha256', envs.secret_jwt).update(payload).digest('base64url');
    if (
      expected.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    )
      throw new UnauthorizedException('Invalid report link signature');
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      monitorId: string;
      format: 'csv' | 'pdf';
      exp: number;
    };
    if (data.exp < Date.now()) throw new UnauthorizedException('Report link expired');
    const monitor = await this.prisma.monitor.findUnique({
      where: { id: data.monitorId },
      select: { id: true, name: true, url: true, status: true },
    });
    if (!monitor) throw new NotFoundException('Monitor not found');
    const aggregates = await this.prisma.monitorAggregate.findMany({
      where: {
        monitorId: data.monitorId,
        granularity: 'DAILY',
        bucketStart: { gte: new Date(Date.now() - 90 * 86400000) },
      },
      orderBy: { bucketStart: 'asc' },
    });
    const rows = aggregates.map(row =>
      [
        row.bucketStart.toISOString(),
        row.checks,
        row.successes,
        row.failures,
        row.downtimeMs.toString(),
      ].join(','),
    );
    const csv = ['bucketStart,checks,successes,failures,downtimeMs', ...rows].join('\n');
    if (data.format === 'csv')
      return {
        body: Buffer.from(csv),
        contentType: 'text/csv; charset=utf-8',
        filename: `${monitor.name}-report.csv`,
      };
    const text = `${monitor.name} (${monitor.url})\nStatus: ${monitor.status}\n\n${csv}`;
    return {
      body: this.pdf(text),
      contentType: 'application/pdf',
      filename: `${monitor.name}-report.pdf`,
    };
  }
  private pdf(text: string) {
    const lines = text
      .split('\n')
      .slice(0, 45)
      .map(line => line.replace(/[()\\]/g, '\\$&'));
    const stream = `BT /F1 10 Tf 50 760 Td ${lines.map(line => `(${line}) Tj 0 -14 Td`).join(' ')} ET`;
    const objects = [
      `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`,
      `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`,
      `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`,
      `4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
      `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
    ];
    let output = '%PDF-1.4\n';
    const offsets = [0];
    for (const object of objects) {
      offsets.push(Buffer.byteLength(output));
      output += `${object}\n`;
    }
    const xref = Buffer.byteLength(output);
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
      .slice(1)
      .map(offset => `${String(offset).padStart(10, '0')} 00000 n `)
      .join(
        '\n',
      )}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return Buffer.from(output);
  }
}
