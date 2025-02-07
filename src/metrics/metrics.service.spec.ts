import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { Counter, register } from 'prom-client';

describe('MetricsService', () => {
  let metricsService: MetricsService;
  let mockCounter: Counter;

  beforeEach(async () => {
    // Mocking prom-client Counter
    register.clear();
    mockCounter = { inc: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: Counter,
          useValue: mockCounter,
        },
      ],
    }).compile();

    metricsService = module.get<MetricsService>(MetricsService);
    metricsService['requestCounter'] = mockCounter;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('incrementRequestCount', () => {
    it('should increment the request count for a given method, route, and status code', () => {
      const method = 'GET';
      const route = '/test';
      const statusCode = 200;

      // Call the method
      metricsService.incrementRequestCount(method, route, statusCode);

      // Verify the Counter's inc method is called
      expect(mockCounter.inc).toHaveBeenCalledWith({
        method,
        route,
        status_code: statusCode,
      });
    });
  });

  describe('getMetrics', () => {
    it('should return the metrics', async () => {
      const mockMetrics = 'some-metrics-data';

      // Mock register.metrics() to return some dummy metrics data
      jest.spyOn(register, 'metrics').mockResolvedValue(mockMetrics);

      // Call the method
      const result = await metricsService.getMetrics();

      // Verify that the metrics data is returned
      expect(result).toBe(mockMetrics);
      expect(register.metrics).toHaveBeenCalled();
    });
  });
});