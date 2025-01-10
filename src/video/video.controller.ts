import { Post, UseInterceptors, UploadedFile, Controller } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Video')
@Controller('video')
export class VideoController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly videoService: VideoService,
    ) {}
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      })
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file): Promise<{ url: string }> {
    const res = await this.videoService.upload(file);
    console.log('res is:', res);
    return res;
    }

}