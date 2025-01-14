import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
    async updateVideoStatus(videoId: string, status: string) {
        // Your database update logic here
        console.log(`Updating video ${videoId} to status: ${status}`);
    }

}
