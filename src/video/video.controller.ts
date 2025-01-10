import { Post, UseInterceptors, UploadedFile, Controller, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiBearerAuth()
@ApiTags('Video')
@Controller('video')
export class VideoController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly videoService: VideoService,
    ) {}

    @UseGuards(JwtAuthGuard)
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
    async upload(@UploadedFile() file: Express.Multer.File, @Req() req): Promise<{ url: string }> {
        const res = await this.videoService.upload(file);
        return res;
    }

}