import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { VideoProcessorWebhookUpdateDto } from './core/entities/python-video-processor-webhook-update.dto';
import { Response } from 'express';
import { MailerService } from '../mailer/mailer.service';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly webhookService: WebhookService,
        private readonly mailerService: MailerService,
    ) {}
  @Post('video-processed')
  async handleVideoProcessed(@Body() body: VideoProcessorWebhookUpdateDto) {
    console.log(`Log ${body.logId} processed with status: ${body.status}`);
    console.log('whole argument is:', body);
    if (!body || !body.logId || !body.userEmail) {
      // res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid webhook call' });
    }
    // res.status(HttpStatus.OK).json({
      // message: 'Webhook processed successfully'
    // });
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
    } finally {
      const emailInfo = {
        to: ['vinicius.deliz@gmail.com', body.userEmail],
        from: 'vinicius.deliz@gmail.com',
        subject: `FIAPX - Update on thumbnails of ${body.keyS3}`,
        html: `<p>The video with the key ${body.keyS3} was proccessed in the platform with final status: <b>${body.status}</b>.</p>
        <p>Log in into the platform to get the download link.</p>`
      };
      this.mailerService.sendEmailFromTemplate(emailInfo);
    }
  }

}