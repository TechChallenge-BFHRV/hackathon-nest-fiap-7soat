import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sg from '@sendgrid/mail';
 
 
export type EmailData = string | { name?: string; email: string };
 
export interface Email {
  to: EmailData[];
  cc?: EmailData[];
  from: EmailData;
  subject: string;
  html: string;
}
 
 
@Injectable()
export class MailerService {
  private emailSender: string;
  private enabled = true;
 
  constructor(
    private readonly configService: ConfigService,
  ) {
 
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (!apiKey) {
      console.error('SENDGRID_API_KEY not found in environment variables');
      this.enabled = false;
    }
 
    sg.setApiKey(apiKey);
    this.emailSender = this.configService.get('SENDGRID_SENDER');
  }
 
 async sendEmailFromTemplate<T>(
    emailInfo: Partial<Email> & { to: EmailData[] },
    settings: sg.MailDataRequired['mailSettings'] = {},
  ) {
    if (!emailInfo.to.length) {
      throw new Error('No recipient found');
    }
 
    const html = `<p>Olá,</p><p>Algum evento ocorreu na aplicação de geração de miniaturas envolvendo o seu usuário.</p>`;
    const metadata = {
      subject: 'FIAP X - Geração de Miniaturas'
    }
 
    return this.send(
      {
        to: emailInfo.to,
        from: emailInfo.from ?? this.emailSender,
        subject: emailInfo.subject || metadata.subject,
        html: emailInfo.html || html,
      },
      settings,
    );
  }

  async send(
    email: Email,
    settings: sg.MailDataRequired['mailSettings'] = {},
  ): Promise<void> {
    if (!this.enabled) {
      console.warn('Email sending is disabled');
      return;
    }

    try {
      await sg.send({ ...email, mailSettings: { ...settings } });
    } catch (err) {
      throw new Error(err);
    }
  }
}