import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, finalize } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const started = process.hrtime.bigint();
    return next.handle().pipe(
      finalize(() => {
        const route = request.route?.path ?? request.url.split('?')[0];
        const duration = Number(process.hrtime.bigint() - started) / 1e9;
        this.metrics.httpRequests.inc({
          method: request.method,
          route,
          status: String(response.statusCode),
        });
        this.metrics.httpDuration.observe({ method: request.method, route }, duration);
      }),
    );
  }
}
