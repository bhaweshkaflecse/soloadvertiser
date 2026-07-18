import { z } from 'zod';

/**
 * UUID v4 validation schema.
 */
export const uuidSchema = z.string().uuid();

/**
 * Email validation schema.
 */
export const emailSchema = z.string().email().toLowerCase().trim();

/**
 * Phone number validation schema (international format).
 */
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)');

/**
 * Standard pagination query parameters.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Date range validation schema.
 */
export const dateRangeSchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((data) => data.from <= data.to, {
    message: 'Start date must be before or equal to end date',
  });

export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
