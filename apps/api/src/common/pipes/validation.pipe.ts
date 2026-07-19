import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Custom validation pipe that works with Zod schemas.
 * Can be applied per-route or globally.
 *
 * Validates request body/query/params using Zod schemas and returns
 * structured errors matching the API envelope format.
 *
 * Usage:
 *   @UsePipes(new ZodValidationPipe(mySchema))
 *   async create(@Body() dto: MyDto) { ... }
 *
 *   // Or with the @ZodValidate decorator:
 *   @ZodValidate(mySchema)
 *   async create(@Body() dto: MyDto) { ... }
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // If no schema provided (global pipe mode), pass through
    if (!this.schema) {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = this.formatErrors(result.error);
      const fieldErrors = this.getFieldErrors(result.error);

      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          errors,
          fields: fieldErrors,
        },
      });
    }

    return result.data;
  }

  /**
   * Format Zod errors into a grouped structure by field path.
   */
  private formatErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(this.mapZodMessage(issue));
    }

    return formatted;
  }

  /**
   * Get a flat array of user-friendly field error messages.
   */
  private getFieldErrors(
    error: ZodError,
  ): Array<{ field: string; message: string; code: string }> {
    return error.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: this.mapZodMessage(issue),
      code: issue.code,
    }));
  }

  /**
   * Map Zod error codes to user-friendly messages.
   */
  private mapZodMessage(issue: any): string {
    switch (issue.code) {
      case 'invalid_type':
        if (issue.received === 'undefined') {
          return `${issue.path.join('.') || 'Field'} is required`;
        }
        return `Expected ${issue.expected}, received ${issue.received}`;

      case 'too_small':
        if (issue.type === 'string') {
          return issue.minimum === 1
            ? `${issue.path.join('.') || 'Field'} cannot be empty`
            : `Must be at least ${issue.minimum} characters`;
        }
        if (issue.type === 'number') {
          return `Must be at least ${issue.minimum}`;
        }
        if (issue.type === 'array') {
          return `Must contain at least ${issue.minimum} item(s)`;
        }
        return issue.message;

      case 'too_big':
        if (issue.type === 'string') {
          return `Must be at most ${issue.maximum} characters`;
        }
        if (issue.type === 'number') {
          return `Must be at most ${issue.maximum}`;
        }
        return issue.message;

      case 'invalid_string':
        if (issue.validation === 'email') {
          return 'Invalid email address';
        }
        if (issue.validation === 'url') {
          return 'Invalid URL format';
        }
        if (issue.validation === 'uuid') {
          return 'Invalid UUID format';
        }
        return issue.message;

      case 'invalid_enum_value':
        return `Must be one of: ${issue.options.join(', ')}`;

      case 'custom':
        return issue.message || 'Invalid value';

      default:
        return issue.message;
    }
  }
}
