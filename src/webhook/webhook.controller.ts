import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly webhookService: WebhookService,
    ) {}
  @Post('video-processed')
  async handleVideoProcessed(@Body() body: { logId: string; userId: number; status: string }) {
    console.log(`Log ${body.logId} processed with status: ${body.status}`);

    // Update the database with the new status (pseudo-code)
    this.webhookService.updateVideoStatus(body.logId, body.status);
  }

}