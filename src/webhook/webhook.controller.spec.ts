import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WebhookController', () => {
  let controller: WebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [WebhookService, UploadstatusService, PrismaService],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
