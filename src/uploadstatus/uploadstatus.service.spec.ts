import { Test, TestingModule } from '@nestjs/testing';
import { UploadstatusService } from './uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookService } from '../webhook/webhook.service';

describe('UploadstatusService', () => {
  let service: UploadstatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadstatusService, PrismaService, WebhookService],
    }).compile();

    service = module.get<UploadstatusService>(UploadstatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
