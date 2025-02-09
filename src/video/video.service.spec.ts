import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));


describe('VideoService', () => {
  let videoService: VideoService;
  let uploadStatusService: UploadstatusService;
  let messageService: MessagesService;
  let s3ClientMock: jest.Mocked<S3Client>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoService, UploadstatusService, PrismaService, MessagesService],
    }).compile();

    videoService = module.get<VideoService>(VideoService);
    uploadStatusService = module.get<UploadstatusService>(UploadstatusService);
    messageService = module.get<MessagesService>(MessagesService);
    s3ClientMock = new S3Client({}) as jest.Mocked<S3Client>;

    jest.spyOn(videoService, 'getS3').mockReturnValue(s3ClientMock);
  });

  describe('upload', () => {
    const mockLog = {
      id: 1,
      userId: 1,
      fileName: 'filename',
      fileType: 'video/mp4',
      fileSize: 333333,
      uploadStarted: new Date(),
      uploadFinished: new Date(),
      bucketS3: 'our-test-bucket',
      keyS3: 'our-test-key.mp4',
      thumbnailsProcessed: null,
      status: '',
    };
    it('should upload a file and return the file URL', async () => {
      const mockFile = {
        originalname: 'test.mp4',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from('mock file data'),
      };
      const mockUser = { email: 'user@example.com' };

      const mockUrl = 'https://mock-bucket.s3.us-east-1.amazonaws.com/uploads/mockfile.mp4';

      jest.spyOn(uploadStatusService, 'logUpload').mockResolvedValue(mockLog);
      jest.spyOn(videoService, 'uploadToS3').mockResolvedValue(mockUrl);
      jest.spyOn(uploadStatusService, 'updateLog').mockResolvedValue(undefined);
      jest.spyOn(messageService, 'sendMessage').mockResolvedValue(undefined);

      const result = await videoService.upload(mockFile, mockUser);

      expect(uploadStatusService.logUpload).toHaveBeenCalledWith(
        { fileName: 'test.mp4', fileType: 'video/mp4', fileSize: 1024 },
        mockUser,
      );
      expect(videoService.uploadToS3).toHaveBeenCalled();
      expect(uploadStatusService.updateLog).toHaveBeenCalledWith(mockLog.id, {
        bucketS3: process.env.S3_BUCKET_NAME,
        keyS3: expect.stringContaining('uploads/'),
      });
      expect(messageService.sendMessage).toHaveBeenCalled();
      expect(result).toEqual({ url: mockUrl });
    });

    it('should throw an error if upload fails', async () => {
      const mockFile = {
        originalname: 'test.mp4',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from('mock file data'),
      };
      const mockUser = { email: 'user@example.com' };
      jest.spyOn(uploadStatusService, 'logUpload').mockResolvedValue(mockLog);
      jest.spyOn(videoService, 'uploadToS3').mockRejectedValue(new Error('S3 error'));

      await expect(videoService.upload(mockFile, mockUser)).rejects.toThrow('S3 error');
    });
  });

  describe('uploadToS3', () => {
    it('should upload a file to S3 and return the URL', async () => {
      const bucket = 'mock-bucket';
      const key = 'uploads/test.mp4';
      const buffer = Buffer.from('mock file data');
      const contentType = 'video/mp4';
      const mockUrl = `https://${bucket}.s3.us-east-1.amazonaws.com/${key}`;

      jest.spyOn(s3ClientMock, 'send').mockResolvedValue(undefined as never);

      const result = await videoService.uploadToS3(bucket, key, buffer, contentType);

      expect(s3ClientMock.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
      expect(result).toEqual(mockUrl);
    });

    it('should throw an error if file type is invalid', async () => {
      const bucket = 'mock-bucket';
      const key = 'uploads/test.txt';
      const buffer = Buffer.from('mock file data');
      const contentType = 'text/plain';

      await expect(videoService.uploadToS3(bucket, key, buffer, contentType)).rejects.toThrow(
        'Invalid file type. Only video files are allowed.',
      );
    });
  });

  describe('generatePresignedUrl', () => {
    it('should return a presigned URL', async () => {
      const bucket = 'mock-bucket';
      const key = 'uploads/test.mp4';
      const mockUrl = 'https://mock-presigned-url.com';

      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const result = await videoService.generatePresignedUrl(bucket, key);

      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(S3Client), expect.any(GetObjectCommand), { expiresIn: 3600 });
      expect(result).toBe(mockUrl);
    });
  });
});
