import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { ERROR_CODES } from '@solo-advertiser/contracts';

/**
 * Custom validation pipe that works with Zod schemas.
 * Can be applied per-route or globally.
 *
 * Usage:
 *   @UsePipes(new ZodValidationPipe(mySchema))
 *   async create(@Body() dto: MyDto) { ... }
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = this.formatErrors(result.error);
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION.INVALID_INPUT,
        message: 'Validation failed',
        details: { errors },
      });
    }

    return result.data;
  }

  private formatErrors(error: ZodError): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join('.') || 'root';
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(issue.message);
    }

    return formatted;
  }
}
