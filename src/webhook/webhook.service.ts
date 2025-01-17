import { Injectable } from '@nestjs/common';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';

@Injectable()
export class WebhookService {
    constructor(
        private uploadStatusService: UploadstatusService,
    ) {}
    async updateVideoStatus(logId: number, status: string) {
        const uploadFinished = new Date();
        let thumbnailsProcessed: Boolean;
        if (status === 'okay') {
            thumbnailsProcessed = true;
        }
        this.uploadStatusService.updateLog(logId, { status, uploadFinished, thumbnailsProcessed })
    }

}
