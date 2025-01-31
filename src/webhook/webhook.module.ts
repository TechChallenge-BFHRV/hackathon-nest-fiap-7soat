import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { UploadstatusService } from '../uploadstatus/uploadstatus.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [WebhookController],
    providers: [WebhookService, UploadstatusService, PrismaService, MailerService, ConfigService],
})
export class WebhookModule {}
