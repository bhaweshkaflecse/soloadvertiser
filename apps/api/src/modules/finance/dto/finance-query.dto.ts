import { IsEnum, IsOptional, IsString, IsInt, Min, Max, IsDateString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { LedgerAccountType } from '../interfaces/finance.interface';

/**
 * Query DTO for ledger entries — supports filtering by account, reference, and date range.
 */
export class FinanceQueryDto {
  @IsOptional()
  @IsEnum(LedgerAccountType)
  accountType?: LedgerAccountType;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

/**
 * Query DTO for wallet transactions — paginated.
 */
export class WalletTransactionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  type?: string; // 'credit' | 'debit'
}

/**
 * Query DTO for payout items failure.
 */
export class FailPayoutItemDto {
  @IsString()
  reason: string;
}
