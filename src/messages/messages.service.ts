import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class MessagesService {
    private readonly sqsClient: SQSClient;
    private readonly queueUrl: string;

    constructor() {
        this.sqsClient = new SQSClient({
            region: 'us-east-1',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Ensure AWS_ACCESS_KEY_ID is set
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Ensure AWS_SECRET_ACCESS_KEY is set
              sessionToken: process.env.AWS_SESSION_TOKEN,
            },
        });
        // SQS Queue URL (Ensure it's defined in your environment variables)
        this.queueUrl = process.env.SQS_QUEUE_URL;
    }
  
    async sendMessage(messageBody: any): Promise<void> {
        try {
          const command = new SendMessageCommand({
            QueueUrl: this.queueUrl, // Queue URL
            MessageBody: JSON.stringify(messageBody), // Message payload
          });
    
          const response = await this.sqsClient.send(command);
          console.log('Message sent successfully:', response);
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      }

}
