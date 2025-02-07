import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Response } from 'express';
import { register } from 'prom-client';

describe('MetricsController', () => {
  let metricsController: MetricsController;
  let metricsService: MetricsService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const mockMetricsService = {
      getMetrics: jest.fn().mockResolvedValue('some-metrics-data'),
    };

    mockResponse = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    metricsController = module.get<MetricsController>(MetricsController);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return metrics data when calling getMetrics', async () => {
    await metricsController.getMetrics(mockResponse as Response);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', register.contentType);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
    expect(metricsService.getMetrics).toHaveBeenCalled();
  });
});