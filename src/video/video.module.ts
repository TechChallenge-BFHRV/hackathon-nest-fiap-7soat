import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VideoService } from './video.service';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';

@Module({
    controllers: [VideoController],
    imports: [PrismaModule],
    providers: [VideoService, UploadstatusService],
})
export class VideoModule {}
