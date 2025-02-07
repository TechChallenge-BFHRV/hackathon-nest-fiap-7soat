import { MetricsInterceptor } from './metrics.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Counter, Histogram, register } from 'prom-client';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;
  let mockCounter: Counter;
  let mockHistogram: Histogram;
  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    // Mock the Counter and Histogram
    register.clear();
    mockCounter = { inc: jest.fn() } as any;
    mockHistogram = { observe: jest.fn() } as any;

    // Create a new instance of the interceptor and inject the mocked metrics
    interceptor = new MetricsInterceptor();
    interceptor['httpRequestCounter'] = mockCounter;
    interceptor['httpRequestDuration'] = mockHistogram;

    // Mock the ExecutionContext and CallHandler
    mockRequest = { method: 'GET', url: '/test', route: { path: '/test' } };
    mockResponse = { statusCode: 200 };
    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
        getNext: jest.fn(),
      }),
    };

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('response')),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should call logRequest when a request fails', (done) => {
    // Mock the failed request
    const error = { status: 500 };
    mockCallHandler.handle = jest.fn().mockReturnValue(throwError(error));
    interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler).subscribe({
      error: () => {
        expect(mockCounter.inc).toHaveBeenCalledWith({
          method: 'GET',
          route: '/test',
          status_code: 500,
        });
        expect(mockHistogram.observe).toHaveBeenCalledWith(
          { method: 'GET', route: '/test', status_code: 500 },
          expect.any(Number)
        );
        done();
      },
    });
  });

  it('should capture duration of requests in the histogram', (done) => {
    const durationSpy = jest.spyOn(interceptor['httpRequestDuration'], 'observe');

    interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler).subscribe(() => {
      expect(durationSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should handle unknown errors and still throw them', (done) => {
    const error = new Error('Unknown Error');
    mockCallHandler.handle = jest.fn().mockReturnValue(throwError(error));

    interceptor.intercept(mockExecutionContext as ExecutionContext, mockCallHandler as CallHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });
});