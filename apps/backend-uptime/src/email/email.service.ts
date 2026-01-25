import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config/envs.schema';
import { SendEmailDto } from './dto';
import { Status } from '@prisma/client';
import * as nodemailer from "nodemailer";
import { generateNotificationEmailHtml } from 'src/utils/design-email';

@Injectable()
export class EmailService {
  private sesClient: SESClient;
  private fromEmail: string;
  private logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    // Validar configuración crítica al inicio
    if (!envs.aws_ses_from_email) {
      this.logger.error('CRÍTICO: Faltan variables de entorno para emails.');
    }

    // 1. Inicialización de SES (Plan A)
    this.sesClient = new SESClient({
        region: envs.aws_region,
        credentials: {
            accessKeyId: envs.aws_access_key_id,
            secretAccessKey: envs.aws_secret_access_key,
        }
    });
    
    // 2. Inicialización de Nodemailer (Plan B)
    this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: envs.gmail_app_user,
            pass: envs.gmail_app_password,
        }
    });

    this.fromEmail = envs.aws_ses_from_email;
  }

  // async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
  //     if (!sendEmailDto.to) {
  //       this.logger.error('Intento de envío sin destinatario (to es null/undefined)');
  //       return; 
  //     }

  //     const { to, subject, textBody, html } = sendEmailDto;
  //     const finalTo = to.trim(); 

  //     const params = {
  //       Source: this.fromEmail,
  //       Destination: {
  //           ToAddresses: [finalTo],
  //       },
  //       Message: {
  //           Subject: {
  //               Data: subject,
  //               Charset: "UTF-8",
  //           },
  //           Body: {
  //               Text: {
  //                   Data: textBody,
  //                   Charset: "UTF-8",
  //               },
  //           },
  //           ...(html && {
  //               Html: {
  //                   Data: html,
  //                   Charset: "UTF-8",
  //               },
  //           }),
  //       },
  //     };
      
  //     try {
  //          const command = new SendEmailCommand(params);
  //          await this.sesClient.send(command);
  //          this.logger.log(`Email enviado exitosamente a ${finalTo} con AWS SES`);

  //     } catch (error) {
  //       this.logger.warn(`Fallo AWS SES. Error: ${error.message}`);

  //       if (
  //         error.Code === "MessageRejected" || 
  //         error.name === "MessageRejected" || 
  //         error.name === "InvalidParameterValue" ||
  //         error.message.includes("Missing final '@domain'")
  //       ) {
  //           this.logger.warn(`[Plan B] Activando Fallback Strategy para ${finalTo}...`);
            
  //           try {
  //               await this.transporter.sendMail({
  //                   from: `"Backend Uptime Fallback" <${this.fromEmail}>`,
  //                   to: finalTo,
  //                   subject: subject,
  //                   text: textBody,
  //                   html: html,
  //               });
  //               this.logger.log("Email enviado exitosamente con Gmail SMTP");

  //           } catch (fallbackError) {
  //               this.logger.error(`Fallo Gmail SMTP también. ${fallbackError}`);
  //               throw fallbackError; 
  //           }
  //       } else {
  //           this.logger.error('Error no manejado en SES', error);
  //           throw error;
  //       }
  //     }
  // }

    async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    if (!sendEmailDto.to) {
      this.logger.error('Intento de envío sin destinatario (to es null/undefined)');
      return;
    }

    const { to, subject, textBody, html } = sendEmailDto;
    const finalTo = to.trim();

    // Construcción del mensaje para SES (Corregida y Simplificada)
    const bodyContent: any = {
      Text: {
        Data: textBody,
        Charset: 'UTF-8',
      },
    };

    if (html) {
      bodyContent.Html = {
        Data: html,
        Charset: 'UTF-8',
      };
    }

    const params = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [finalTo],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: bodyContent, 
      },
    };

    try {
      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Email enviado exitosamente a ${finalTo} con AWS SES`);
    } catch (error) {
      this.logger.warn(`Fallo AWS SES. Error: ${error.message}`);

      if (
        error.Code === 'MessageRejected' ||
        error.name === 'MessageRejected' ||
        error.name === 'InvalidParameterValue' ||
        error.message.includes("Missing final '@domain'")
      ) {
        this.logger.warn(`[Plan B] Activando Fallback Strategy para ${finalTo}...`);

        try {
          await this.transporter.sendMail({
            from: `"Backend Uptime Fallback" <${this.fromEmail}>`,
            to: finalTo,
            subject: subject,
            text: textBody,
            html: html,
          });
          this.logger.log('Email enviado exitosamente con Gmail SMTP');
        } catch (fallbackError) {
          this.logger.error(`Fallo Gmail SMTP también. ${fallbackError}`);
          throw fallbackError;
        }
      } else {
        this.logger.error('Error no manejado en SES', error);
        throw error;
      }
    }
  }


  async sendNotificationEmail(email: string, nameServer: string, serverStatus: Status ): Promise<void> {
    const subject = "Actualización de estado de uno de tus servidores";
    const textBody = `El estado de tu servidor "${nameServer}" ha cambiado a: ${serverStatus}`;

    const html = generateNotificationEmailHtml({
      serverName: nameServer,
      status: serverStatus,
      recipientEmail: email
    });

    await this.sendEmail({
      to: email,
      subject,
      textBody,
      html,
    });
  }
}
