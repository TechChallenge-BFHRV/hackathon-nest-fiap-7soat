import { Injectable } from '@nestjs/common';
import { UploadLog } from '../core/entities/upload-log.entity';
import { User } from '../core/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadstatusService {
    constructor(private readonly prisma: PrismaService) {}
    
    async logUpload(file: UploadLog, user: User) {
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

    async updateLog(id: number, payload: UploadLog) {
        const data: { [key: string]: any } = {};
        for (const key in payload) {
            if (payload.hasOwnProperty(key)) {
                data[key] = payload[key];
            }
        }

        const log = await this.prisma.uploadLog.update({
            where: { id },
            data: data,
        });
        return log;
    }
}
