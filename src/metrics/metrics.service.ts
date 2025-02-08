import { Injectable } from '@nestjs/common';
import { Counter, collectDefaultMetrics, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private requestCounter: Counter;

  constructor() {
    collectDefaultMetrics(); // Collects default Node.js metrics (CPU, memory, etc.)
  }

  incrementRequestCount(method: string, route: string, statusCode: number) {
    this.requestCounter.inc({ method, route, status_code: statusCode });
  }

  getMetrics() {
    return register.metrics();
  }
}