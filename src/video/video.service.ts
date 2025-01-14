import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Logger, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class VideoService {
    private s3Client: S3Client;
    constructor(
      private uploadStatusService: UploadstatusService,
      private messageService: MessagesService,
    ) {}
    async upload(file, user) {
      const initLog = await this.uploadStatusService.logUpload({ fileName: file.originalname, fileType: file.mimetype, fileSize: file.size }, user);
      const bucketS3 = 'hackathon-7soat-fiap-49-nest';
      const key = `uploads/${Date.now()}-${file.originalname}`;
      const fileUrl = await this.uploadToS3(bucketS3, key, file.buffer, file.mimetype);
      if (fileUrl) {
       await this.uploadStatusService.updateLog(initLog.id, { bucketS3, key });
       await this.messageService.sendMessage({
        bucketS3,
        key,
        userEmail: user.email,
        logId: initLog.id,
       })
      }
      return { url: fileUrl };
    }

    async uploadToS3(
      bucketName: string,
      key: string,
      file: Buffer | Readable,
      contentType: string,
    ): Promise<string> {
      const s3 = this.getS3();
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      };
      try {
        if (!params.ContentType.startsWith('video/')) {
          throw new Error('Invalid file type. Only video files are allowed.');
        }
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return `https://${bucketName}.s3.us-east-1.amazonaws.com/${key}`;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }

    getS3() {
      this.s3Client = new S3Client({
        region: 'us-east-1', // e.g., 'us-east-1'
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        },
      });
      return this.s3Client;
    }

    async generatePresignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
      const s3 = this.getS3();
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(s3, command, { expiresIn });
      return url;
    }
}