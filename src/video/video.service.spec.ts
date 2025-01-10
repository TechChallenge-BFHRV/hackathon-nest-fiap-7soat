import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService, UploadstatusService, PrismaService],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
