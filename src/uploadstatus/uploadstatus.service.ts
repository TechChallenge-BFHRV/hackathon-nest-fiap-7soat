import { Injectable } from '@nestjs/common';
import { UploadLog } from '../core/entities/upload-log.entity';
import { User } from '../core/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadstatusService {
    constructor(private readonly prisma: PrismaService) {}
    
    async logUpload(file: UploadLog, user: User) {
        console.log('will do something with this...', file, user);

        const log = await this.prisma.uploadLog.create({
            data: {
                fileName: file.fileName,
                fileType: file.fileType,
                fileSize: file.fileSize,
                userId: user.id,
            }
        })
        return log;
    }

    async updateLog(id: number, s3Object) {
        const log = await this.prisma.uploadLog.update({
            where: { id },
            data: {
                uploadFinished: new Date(),
                s3Bucket: s3Object.bucketS3,
                s3Key: s3Object.key,
            }
        });
        return log;
    }
}
