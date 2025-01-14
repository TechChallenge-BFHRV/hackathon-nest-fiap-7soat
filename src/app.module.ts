import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VideoModule } from './video/video.module';
import { UploadstatusModule } from './uploadstatus/uploadstatus.module';
import { MessagesModule } from './messages/messages.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    VideoModule,
    UploadstatusModule,
    MessagesModule,
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
