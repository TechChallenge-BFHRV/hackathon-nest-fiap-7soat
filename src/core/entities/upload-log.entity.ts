export class UploadLog {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    bucketS3?: string;
    keyS3?: string;
    status?: string;
    uploadFinished?: Date;
    thumbnailsProcessed?: Boolean;
}