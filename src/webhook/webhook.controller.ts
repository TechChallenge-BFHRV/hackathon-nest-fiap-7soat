import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { VideoProcessorWebhookUpdateDto } from './core/entities/python-video-processor-webhook-update.dto';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly webhookService: WebhookService,
    ) {}
  @Post('video-processed')
  async handleVideoProcessed(@Body() body: VideoProcessorWebhookUpdateDto) {
    console.log(`Log ${body.logId} processed with status: ${body.status}`);

    // Update the database with the new status (pseudo-code)
    try {
      this.webhookService.updateVideoStatus(body.logId, body.status);
      return {
        status: HttpStatus.ACCEPTED,
        message: 'Video succesfully processed'
      };
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Something went wrong: ${error}`,
      }
    }
  }

}