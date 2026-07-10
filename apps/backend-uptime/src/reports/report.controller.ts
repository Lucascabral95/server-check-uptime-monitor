import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MonitorOwnerGuard } from 'src/auth/guards/monitor-owner.guard';
import { RequestUserDto } from 'src/user/dto';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reports: ReportService) {}
  @Get(':monitorId') @UseGuards(JwtAuthGuard, MonitorOwnerGuard) link(
    @Param('monitorId') monitorId: string,
    @Query('format') format: 'csv' | 'pdf' = 'csv',
    @Query('expiresIn') expiresIn: string,
    @Request() req: RequestUserDto,
  ) {
    if (!['csv', 'pdf'].includes(format))
      throw new UnauthorizedException('format must be csv or pdf');
    return this.reports.createLink(monitorId, req.user.dbUserId, format, Number(expiresIn) || 3600);
  }
  @Get('download/:token') async download(@Param('token') token: string, @Res() response: Response) {
    const report = await this.reports.render(token);
    response.set({
      'Content-Type': report.contentType,
      'Content-Disposition': `attachment; filename="${report.filename.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
    });
    return response.send(report.body);
  }
}
