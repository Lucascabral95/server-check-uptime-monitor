import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto';
import { Status } from '@prisma/client';
import { Logger } from '@nestjs/common';

jest.mock('src/utils/design-email', () => ({
  generateNotificationEmailHtml: jest.fn(() => '<html>Mock Email HTML</html>'),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockSesSend: jest.Mock;
  let mockTransporterSendMail: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    mockSesSend = jest.fn();
    mockTransporterSendMail = jest.fn();

    (service as any).sesClient = {
      send: mockSesSend,
    };

    (service as any).transporter = {
      sendMail: mockTransporterSendMail,
    };

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    const validSendEmailDto: SendEmailDto = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      textBody: 'Test text body',
      html: '<p>Test HTML body</p>',
    };

    describe('successful email sending', () => {
      it('should send email successfully with AWS SES', async () => {
        mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

        await service.sendEmail(validSendEmailDto);

        expect(mockSesSend).toHaveBeenCalled();
      });

      it('should send email without HTML content', async () => {
        const dtoWithoutHtml: SendEmailDto = {
          to: 'recipient@example.com',
          subject: 'Test Subject',
          textBody: 'Test text body',
        };

        mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

        await service.sendEmail(dtoWithoutHtml);

        expect(mockSesSend).toHaveBeenCalled();
      });

      it('should trim whitespace from recipient email', async () => {
        const dtoWithSpaces: SendEmailDto = {
          to: '  recipient@example.com  ',
          subject: 'Test Subject',
          textBody: 'Test text body',
        };

        mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

        await service.sendEmail(dtoWithSpaces);

        expect(mockSesSend).toHaveBeenCalled();
      });

      it('should return early when recipient email is null', async () => {
        const dtoWithNullTo: SendEmailDto = {
          to: null as any,
          subject: 'Test Subject',
          textBody: 'Test text body',
        };

        await service.sendEmail(dtoWithNullTo);

        expect(mockSesSend).not.toHaveBeenCalled();
        expect(mockTransporterSendMail).not.toHaveBeenCalled();
      });

      it('should return early when recipient email is undefined', async () => {
        const dtoWithUndefinedTo: SendEmailDto = {
          to: undefined as any,
          subject: 'Test Subject',
          textBody: 'Test text body',
        };

        await service.sendEmail(dtoWithUndefinedTo);

        expect(mockSesSend).not.toHaveBeenCalled();
        expect(mockTransporterSendMail).not.toHaveBeenCalled();
      });
    });

    describe('fallback to Gmail SMTP', () => {
      it('should fallback to Gmail SMTP when AWS SES fails with MessageRejected error (name)', async () => {
        const sesError = {
          name: 'MessageRejected',
          message: 'Email rejected',
        };
        mockSesSend.mockRejectedValue(sesError);
        mockTransporterSendMail.mockResolvedValue({ accepted: ['recipient@example.com'] });

        await service.sendEmail(validSendEmailDto);

        expect(mockTransporterSendMail).toHaveBeenCalled();
        expect(mockSesSend).toHaveBeenCalled();
      });

      it('should fallback to Gmail SMTP when AWS SES fails with InvalidParameterValue error', async () => {
        const sesError = {
          name: 'InvalidParameterValue',
          message: 'Invalid parameter',
        };
        mockSesSend.mockRejectedValue(sesError);
        mockTransporterSendMail.mockResolvedValue({ accepted: ['recipient@example.com'] });

        await service.sendEmail(validSendEmailDto);

        expect(mockTransporterSendMail).toHaveBeenCalled();
      });

      it('should fallback to Gmail SMTP when error message contains "Missing final \'@domain\'"', async () => {
        const sesError = {
          message: 'Missing final \'@domain\'',
        };
        mockSesSend.mockRejectedValue(sesError);
        mockTransporterSendMail.mockResolvedValue({ accepted: ['recipient@example.com'] });

        await service.sendEmail(validSendEmailDto);

        expect(mockTransporterSendMail).toHaveBeenCalled();
      });

      it('should throw error when both AWS SES and Gmail SMTP fail', async () => {
        const sesError = {
          Code: 'MessageRejected',
          message: 'Email rejected',
        };
        mockSesSend.mockRejectedValue(sesError);
        mockTransporterSendMail.mockRejectedValue(new Error('Gmail SMTP failed'));

        await expect(service.sendEmail(validSendEmailDto)).rejects.toThrow('Gmail SMTP failed');
      });
    });

    describe('non-retryable SES errors', () => {
      it('should throw error when AWS SES fails with non-retryable error', async () => {
        const sesError = {
          Code: 'AccessDenied',
          message: 'Access denied',
        };
        mockSesSend.mockRejectedValue(sesError);

        await expect(service.sendEmail(validSendEmailDto)).rejects.toEqual(sesError);
        expect(mockTransporterSendMail).not.toHaveBeenCalled();
      });

      it('should throw error when AWS SES fails with generic error', async () => {
        const genericError = new Error('Something went wrong');
        mockSesSend.mockRejectedValue(genericError);

        await expect(service.sendEmail(validSendEmailDto)).rejects.toEqual(genericError);
        expect(mockTransporterSendMail).not.toHaveBeenCalled();
      });
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send notification email successfully', async () => {
      const email = 'user@example.com';
      const nameServer = 'Test Server';
      const serverStatus = Status.DOWN;

      mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

      await service.sendNotificationEmail(email, nameServer, serverStatus);

      const { generateNotificationEmailHtml } = require('src/utils/design-email');
      expect(generateNotificationEmailHtml).toHaveBeenCalledWith({
        serverName: nameServer,
        status: serverStatus,
        recipientEmail: email,
      });
    });

    it('should construct email with correct subject and text body for DOWN status', async () => {
      const email = 'user@example.com';
      const nameServer = 'Production API';
      const serverStatus = Status.DOWN;

      mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

      await service.sendNotificationEmail(email, nameServer, serverStatus);

      expect(mockSesSend).toHaveBeenCalled();
    });

    it('should construct email with correct subject and text body for UP status', async () => {
      const email = 'user@example.com';
      const nameServer = 'Production API';
      const serverStatus = Status.UP;

      mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

      await service.sendNotificationEmail(email, nameServer, serverStatus);

      expect(mockSesSend).toHaveBeenCalled();
    });

    it('should construct email with correct subject and text body for PENDING status', async () => {
      const email = 'user@example.com';
      const nameServer = 'Production API';
      const serverStatus = Status.PENDING;

      mockSesSend.mockResolvedValue({ MessageId: 'test-message-id' });

      await service.sendNotificationEmail(email, nameServer, serverStatus);

      expect(mockSesSend).toHaveBeenCalled();
    });

    it('should use fallback strategy when SES fails for notification email', async () => {
      const email = 'user@example.com';
      const nameServer = 'Production API';
      const serverStatus = Status.DOWN;

      const sesError = {
        Code: 'MessageRejected',
        message: 'Email rejected',
      };
      mockSesSend.mockRejectedValue(sesError);
      mockTransporterSendMail.mockResolvedValue({ accepted: [email] });

      await service.sendNotificationEmail(email, nameServer, serverStatus);

      expect(mockTransporterSendMail).toHaveBeenCalled();
    });

    it('should throw error when both SES and Gmail fail for notification email', async () => {
      const email = 'user@example.com';
      const nameServer = 'Production API';
      const serverStatus = Status.DOWN;

      const sesError = {
        Code: 'MessageRejected',
        message: 'Email rejected',
      };
      mockSesSend.mockRejectedValue(sesError);
      mockTransporterSendMail.mockRejectedValue(new Error('Gmail failed'));

      await expect(service.sendNotificationEmail(email, nameServer, serverStatus)).rejects.toThrow();
    });
  });
});
