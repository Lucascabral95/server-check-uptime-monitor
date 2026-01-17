import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * Standard error response format
 */
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  details?: unknown;
}

/**
 * Global exception filter for Prisma errors
 *
 * Automatically catches Prisma errors and transforms them into
 * appropriate HTTP responses with consistent formatting.
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientInitializationError
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = {
      statusCode: 500,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.handleKnownRequestError(exception, errorResponse);
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      this.handleUnknownRequestError(exception, errorResponse);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      this.handleValidationError(exception, errorResponse);
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.handleInitializationError(exception, errorResponse);
    }

    this.logger.error(
      `${errorResponse.error}: ${errorResponse.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private handleKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    errorResponse: ErrorResponse,
  ): void {
    const { code, meta } = exception;
    const modelName = (meta as any)?.modelName;
    const entityName = modelName ? modelName.toLowerCase() : 'record';

    switch (code) {
      case 'P2025':
        errorResponse.statusCode = 404;
        errorResponse.error = 'Not Found';
        errorResponse.message = `${entityName} not found`;
        break;

      case 'P2002': {
        const target = (meta as any)?.target as string[] | undefined;
        const fields = target ? ` (${target.join(', ')})` : '';
        errorResponse.statusCode = 409;
        errorResponse.error = 'Conflict';
        errorResponse.message = `A ${entityName} with this${fields} value already exists`;
        errorResponse.details = { fields: target };
        break;
      }

      case 'P2003':
        errorResponse.statusCode = 400;
        errorResponse.error = 'Bad Request';
        errorResponse.message = 'Invalid reference provided';
        errorResponse.details = { field: (meta as any)?.field_name };
        break;

      case 'P2014':
        errorResponse.statusCode = 400;
        errorResponse.error = 'Bad Request';
        errorResponse.message = `The change would violate required relations for ${entityName}`;
        errorResponse.details = { relation: (meta as any)?.relation };
        break;

      case 'P2018':
        errorResponse.statusCode = 400;
        errorResponse.error = 'Bad Request';
        errorResponse.message = `Required related record for ${entityName} was not found`;
        errorResponse.details = { relation: (meta as any)?.relation };
        break;

      case 'P2009':
        errorResponse.statusCode = 400;
        errorResponse.error = 'Validation Error';
        errorResponse.message = 'Invalid query parameters';
        break;

      case 'P2004':
        errorResponse.statusCode = 400;
        errorResponse.error = 'Validation Error';
        errorResponse.message = `Required field is missing for ${entityName}`;
        errorResponse.details = { field: (meta as any)?.field_name };
        break;

      case 'P2006':
        errorResponse.statusCode = 400;
        errorResponse.error = 'Validation Error';
        errorResponse.message = `Invalid value provided for ${entityName}`;
        errorResponse.details = { field: (meta as any)?.field_name };
        break;

      case 'P2024':
        errorResponse.statusCode = 503;
        errorResponse.error = 'Service Unavailable';
        errorResponse.message = 'Database connection timeout. Please try again later.';
        break;

      case 'P2034':
        errorResponse.statusCode = 409;
        errorResponse.error = 'Conflict';
        errorResponse.message = `Transaction failed due to concurrent updates on ${entityName}. Please retry.`;
        break;

      default:
        this.logger.warn(`Unhandled Prisma error code: ${code}`);
        errorResponse.statusCode = 500;
        errorResponse.error = 'Internal Server Error';
        errorResponse.message = `Database error (${code})`;
        errorResponse.details = { code, meta };
    }
  }

  private handleUnknownRequestError(
    exception: Prisma.PrismaClientUnknownRequestError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = 500;
    errorResponse.error = 'Internal Server Error';
    errorResponse.message = 'An unknown database error occurred';
    errorResponse.details = { message: exception.message };
  }

  private handleValidationError(
    exception: Prisma.PrismaClientValidationError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = 400;
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Invalid data provided';
    errorResponse.details = { message: exception.message };
  }

  private handleInitializationError(
    exception: Prisma.PrismaClientInitializationError,
    errorResponse: ErrorResponse,
  ): void {
    errorResponse.statusCode = 503;
    errorResponse.error = 'Service Unavailable';
    errorResponse.message = 'Database connection failed';
    errorResponse.details = {
      errorCode: exception.errorCode,
      message: exception.message,
    };
  }
}
