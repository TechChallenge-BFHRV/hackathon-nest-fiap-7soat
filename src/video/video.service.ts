import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Logger, Injectable } from '@nestjs/common';
import { Readable } from 'stream';

@Injectable()
export class VideoService {
    private s3Client: S3Client;
    async upload(file) {
      const bucketS3 = 'hackathon-7soat-fiap-49-nest';
      const key = `uploads/${Date.now()}-${file.originalname}`;
      const fileUrl = await this.uploadToS3(bucketS3, key, file.buffer, file.mimetype);
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
}