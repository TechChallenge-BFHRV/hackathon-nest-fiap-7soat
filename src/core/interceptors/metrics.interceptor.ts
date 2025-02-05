import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private httpRequestCounter: Counter;
  private httpRequestDuration: Histogram;

  constructor() {
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 1.5, 5, 10], // Define appropriate buckets
    });

    register.registerMetric(this.httpRequestCounter);
    register.registerMetric(this.httpRequestDuration);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = process.hrtime();
    const { method, url } = request;
    const route = request.route ? request.route.path : request.url;
    return next.handle().pipe(
      tap(() => {
        // Capture successful responses (2xx)
        this.logRequest(method, url, response.statusCode, startTime);
      }),
      catchError((error) => {
        // Capture failed responses (4xx, 5xx)
        const statusCode = error.status || 500; // Default to 500 if unknown
        this.logRequest(method, url, statusCode, startTime);
        throw error; // Ensure the error is still thrown
      }),
    );
  }

  private logRequest(method: string, url: string, statusCode: number, startTime: [number, number]) {
    const duration = process.hrtime(startTime);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    this.httpRequestCounter.inc({ method, route: url, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route: url, status_code: statusCode }, durationInSeconds);
  }
}