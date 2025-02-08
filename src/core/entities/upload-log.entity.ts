export class UploadLog {
    id?: number;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    bucketS3?: string;
    keyS3?: string;
    status?: string;
    uploadStarted?: Date;
    uploadFinished?: Date;
    thumbnailsProcessed?: Boolean;
}