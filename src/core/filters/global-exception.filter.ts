import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Counter } from 'prom-client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private httpErrorCounter: Counter;

  constructor() {
    this.httpErrorCounter = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status_code'],
    });
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500; // Default to Internal Server Error
    let message = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message;
    }

    // Track all HTTP errors in Prometheus
    this.httpErrorCounter.inc({
      method: request.method,
      route: request.url,
      status_code: status,
    });

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}