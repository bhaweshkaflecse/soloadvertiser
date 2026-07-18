import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import {
  LedgerAccountType,
  LedgerEntryType,
  LedgerReferenceType,
} from './interfaces/finance.interface';
import { FinanceQueryDto } from './dto';

/**
 * Ledger Service — immutable, append-only double-entry ledger.
 *
 * RULE-FIN-004: Ledger ALWAYS balanced (total debits = total credits).
 * RULE-FIN-006: Entries IMMUTABLE (no update/delete).
 * RULE-FIN-007: Five ledger account types.
 */
@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a single ledger entry. Append-only, immutable.
   */
  async createEntry(params: {
    accountType: LedgerAccountType;
    entryType: LedgerEntryType;
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    createdBy?: string;
  }) {
    this.logger.log(
      `Creating ledger entry: ${params.entryType} ${params.accountType} ${params.amount}`,
    );

    const entry = await this.prisma.ledgerEntry.create({
      data: {
        accountType: params.accountType as any,
        entryType: params.entryType as any,
        amount: params.amount,
        currency: 'NPR',
        description: params.description,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        createdBy: params.createdBy,
      },
    });

    return entry;
  }

  /**
   * Create a double-entry pair (debit one account, credit another).
   * This ensures the ledger stays balanced.
   */
  async createDoubleEntry(params: {
    debitAccount: LedgerAccountType;
    creditAccount: LedgerAccountType;
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    createdBy?: string;
  }) {
    this.logger.log(
      `Double entry: DEBIT ${params.debitAccount}, CREDIT ${params.creditAccount}, amount=${params.amount}`,
    );

    const [debit, credit] = await this.prisma.$transaction([
      this.prisma.ledgerEntry.create({
        data: {
          accountType: params.debitAccount as any,
          entryType: 'DEBIT' as any,
          amount: params.amount,
          currency: 'NPR',
          description: params.description,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          createdBy: params.createdBy,
        },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          accountType: params.creditAccount as any,
          entryType: 'CREDIT' as any,
          amount: params.amount,
          currency: 'NPR',
          description: params.description,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
          createdBy: params.createdBy,
        },
      }),
    ]);

    return { debit, credit };
  }

  /**
   * Get balance for a specific account type.
   * Balance = SUM(credits) - SUM(debits) for the account.
   */
  async getBalance(accountType: LedgerAccountType): Promise<number> {
    const result = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      where: { accountType: accountType as any },
      _sum: { amount: true },
    });

    let credits = 0;
    let debits = 0;

    for (const row of result) {
      if (row.entryType === 'CREDIT') {
        credits = row._sum.amount || 0;
      } else {
        debits = row._sum.amount || 0;
      }
    }

    return credits - debits;
  }

  /**
   * Get all entries for a specific reference (e.g., all entries for a campaign).
   */
  async getEntriesByReference(referenceType: string, referenceId: string) {
    return this.prisma.ledgerEntry.findMany({
      where: { referenceType, referenceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verify global ledger balance.
   * RULE-FIN-004: Total debits MUST equal total credits.
   */
  async verifyBalance(): Promise<{ isBalanced: boolean; totalDebits: number; totalCredits: number }> {
    const result = await this.prisma.ledgerEntry.groupBy({
      by: ['entryType'],
      _sum: { amount: true },
    });

    let totalDebits = 0;
    let totalCredits = 0;

    for (const row of result) {
      if (row.entryType === 'DEBIT') {
        totalDebits = row._sum.amount || 0;
      } else {
        totalCredits = row._sum.amount || 0;
      }
    }

    const isBalanced = totalDebits === totalCredits;

    if (!isBalanced) {
      this.logger.error(
        `LEDGER IMBALANCE DETECTED! Debits=${totalDebits}, Credits=${totalCredits}`,
      );
    }

    return { isBalanced, totalDebits, totalCredits };
  }

  /**
   * Query ledger entries with filters and pagination.
   */
  async queryEntries(query: FinanceQueryDto) {
    const { accountType, referenceType, referenceId, startDate, endDate, page = 1, pageSize = 20 } = query;

    const where: any = {};

    if (accountType) where.accountType = accountType;
    if (referenceType) where.referenceType = referenceType;
    if (referenceId) where.referenceId = referenceId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);

    return {
      data: entries,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page * pageSize < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}
