import { UsePipes } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../pipes/validation.pipe';

/**
 * Decorator that applies Zod schema validation to an endpoint.
 *
 * Usage:
 *   @Post()
 *   @ZodValidate(createUserSchema)
 *   async createUser(@Body() dto: CreateUserDto) { ... }
 *
 *   @Get()
 *   @ZodValidate(queryParamsSchema)
 *   async list(@Query() query: ListQueryDto) { ... }
 */
export function ZodValidate(schema: ZodSchema): MethodDecorator {
  return UsePipes(new ZodValidationPipe(schema));
}
