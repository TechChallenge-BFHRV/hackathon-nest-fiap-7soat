import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { Counter, register } from 'prom-client';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let customHttpErrorCounter: Counter;
  let mockResponse: Partial<Response>;
  let mockHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    register.clear();
    customHttpErrorCounter = new Counter({
      name: 'custom_http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status_code'],
    });

    filter = new GlobalExceptionFilter();
    filter["httpErrorCounter"] = customHttpErrorCounter;
    jest.spyOn(customHttpErrorCounter, 'inc');

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    };
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Custom Error Message', 400);
    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Custom Error Message',
    });
    expect(customHttpErrorCounter.inc).toHaveBeenCalledWith({
      method: 'GET',
      route: '/test',
      status_code: 400,
    });
  });

  it('should handle unknown exceptions as internal server errors', () => {
    const exception = new Error('Unknown Error');
    filter.catch(exception, mockHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal Server Error',
    });
    expect(customHttpErrorCounter.inc).toHaveBeenCalledWith({
      method: 'GET',
      route: '/test',
      status_code: 500,
    });
  });
});
