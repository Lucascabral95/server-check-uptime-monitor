import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Status } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from 'src/config/envs.schema';
import { generateNotificationEmailHtml } from 'src/utils/design-email';
import { SendEmailDto } from './dto';

@Injectable()
export class EmailService {
  private sesClient: SESClient;
  private fromEmail: string;
  private logger = new Logger(EmailService.name);
  private transporter?: nodemailer.Transporter;

  constructor() {
    this.sesClient = new SESClient({ region: envs.aws_region });

    if (envs.gmail_app_user && envs.gmail_app_password) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: envs.gmail_app_user,
          pass: envs.gmail_app_password,
        },
      });
    }

    this.fromEmail = envs.aws_ses_from_email;
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    if (!sendEmailDto.to) {
      this.logger.error('Email recipient is required');
      return;
    }

    const { to, subject, textBody, html } = sendEmailDto;
    const finalTo = to.trim();
    const bodyContent: {
      Text: { Data: string; Charset: string };
      Html?: { Data: string; Charset: string };
    } = {
      Text: { Data: textBody, Charset: 'UTF-8' },
    };

    if (html) {
      bodyContent.Html = { Data: html, Charset: 'UTF-8' };
    }

    try {
      await this.sesClient.send(
        new SendEmailCommand({
          Source: this.fromEmail,
          Destination: { ToAddresses: [finalTo] },
          Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: bodyContent,
          },
        }),
      );
      this.logger.log(`Email sent to ${finalTo} with AWS SES`);
    } catch (error) {
      const sesError = error as { Code?: string; name?: string; message?: string };
      this.logger.warn(`AWS SES failed: ${sesError.message ?? 'unknown error'}`);

      const mayUseFallback =
        sesError.Code === 'MessageRejected' ||
        sesError.name === 'MessageRejected' ||
        sesError.name === 'InvalidParameterValue' ||
        sesError.message?.includes("Missing final '@domain'");

      if (!mayUseFallback || !this.transporter) {
        throw error;
      }

      try {
        await this.transporter.sendMail({
          from: `"Backend Uptime Fallback" <${this.fromEmail}>`,
          to: finalTo,
          subject,
          text: textBody,
          html,
        });
        this.logger.log('Email sent with Gmail SMTP fallback');
      } catch (fallbackError) {
        this.logger.error(`Gmail SMTP fallback failed. ${fallbackError}`);
        throw fallbackError;
      }
    }
  }

  async sendNotificationEmail(email: string, nameServer: string, serverStatus: Status): Promise<void> {
    const subject = 'Actualización de estado de uno de tus servidores';
    const textBody = `El estado de tu servidor "${nameServer}" ha cambiado a: ${serverStatus}`;
    const html = generateNotificationEmailHtml({
      serverName: nameServer,
      status: serverStatus,
      recipientEmail: email,
    });

    await this.sendEmail({ to: email, subject, textBody, html });
  }
}
