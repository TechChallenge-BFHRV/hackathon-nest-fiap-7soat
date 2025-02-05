import { Controller, Get, Res } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Response } from 'express';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
    return this.metricsService.getMetrics();
  }
}