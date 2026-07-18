import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_CODES } from '@solo-advertiser/contracts';

/**
 * Global exception filter that formats all errors into the standard API envelope.
 * Response shape: { success: false, error: { code, message, details }, timestamp, requestId }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ERROR_CODES.SYSTEM.INTERNAL_ERROR;
    let message = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp['code'] as string) || this.mapStatusToCode(status);
        message = (resp['message'] as string) || exception.message;
        details = resp['details'] as Record<string, unknown> | undefined;

        // Handle class-validator / Zod validation errors
        if (Array.isArray(resp['message'])) {
          message = 'Validation failed';
          details = { errors: resp['message'] };
          code = ERROR_CODES.VALIDATION.INVALID_INPUT;
        }
      } else {
        message = exceptionResponse as string;
        code = this.mapStatusToCode(status);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
      requestId: request.headers['x-request-id'] || undefined,
    });
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 401:
        return ERROR_CODES.AUTH.UNAUTHORIZED;
      case 403:
        return ERROR_CODES.AUTH.FORBIDDEN;
      case 404:
        return ERROR_CODES.RESOURCE.NOT_FOUND;
      case 409:
        return ERROR_CODES.RESOURCE.CONFLICT;
      default:
        return ERROR_CODES.SYSTEM.INTERNAL_ERROR;
    }
  }
}
