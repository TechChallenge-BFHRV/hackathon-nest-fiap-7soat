import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from './video.service';

describe('VideoController', () => {
  let controller: VideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [PrismaService, VideoService],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
