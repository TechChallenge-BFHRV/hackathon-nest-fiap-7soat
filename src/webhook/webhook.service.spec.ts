import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookService, UploadstatusService, PrismaService],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
