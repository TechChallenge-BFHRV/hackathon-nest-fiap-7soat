import { Module } from '@nestjs/common';
import { UploadstatusService } from './uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [UploadstatusService, PrismaService]
})
export class UploadstatusModule {}
