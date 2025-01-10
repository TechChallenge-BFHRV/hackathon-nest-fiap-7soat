import { Test, TestingModule } from '@nestjs/testing';
import { UploadstatusService } from './uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UploadstatusService', () => {
  let service: UploadstatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadstatusService, PrismaService],
    }).compile();

    service = module.get<UploadstatusService>(UploadstatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
