import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { WalletTransactionType } from './interfaces/finance.interface';
import { WalletCreditedEvent } from './events/wallet-credited.event';

/**
 * Wallet Service — manages rider wallets and transaction history.
 *
 * Each rider gets a wallet on approval.
 * Credits: daily earnings from campaign assignments.
 * Debits: payouts.
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create wallet for a newly-approved rider.
   */
  async createWallet(riderId: string) {
    this.logger.log(`Creating wallet for rider ${riderId}`);

    // Check if wallet already exists
    const existing = await this.prisma.riderWallet.findUnique({
      where: { riderId },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.riderWallet.create({
      data: { riderId },
    });
  }

  /**
   * Credit rider wallet — daily earnings.
   */
  async creditWallet(params: {
    riderId: string;
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const wallet = await this.prisma.riderWallet.findUnique({
      where: { riderId: params.riderId },
    });

    if (!wallet) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.WALLET_NOT_FOUND,
        message: 'Rider wallet not found',
      });
    }

    // Create transaction + update balance in a transaction
    const [transaction] = await this.prisma.$transaction([
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.CREDIT,
          amount: params.amount,
          description: params.description,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
        },
      }),
      this.prisma.riderWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: params.amount },
          totalEarned: { increment: params.amount },
        },
      }),
    ]);

    // Emit event
    this.eventEmitter.emit(
      WalletCreditedEvent.EVENT_NAME,
      new WalletCreditedEvent(
        wallet.id,
        params.riderId,
        params.amount,
        params.referenceType || '',
        params.referenceId || '',
      ),
    );

    return transaction;
  }

  /**
   * Debit rider wallet — payout deduction.
   */
  async debitWallet(params: {
    riderId: string;
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
  }) {
    const wallet = await this.prisma.riderWallet.findUnique({
      where: { riderId: params.riderId },
    });

    if (!wallet) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.WALLET_NOT_FOUND,
        message: 'Rider wallet not found',
      });
    }

    if (wallet.balance < params.amount) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.INSUFFICIENT_BALANCE,
        message: 'Insufficient wallet balance',
      });
    }

    const [transaction] = await this.prisma.$transaction([
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.DEBIT,
          amount: params.amount,
          description: params.description,
          referenceType: params.referenceType,
          referenceId: params.referenceId,
        },
      }),
      this.prisma.riderWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: params.amount },
          totalPaidOut: { increment: params.amount },
        },
      }),
    ]);

    return transaction;
  }

  /**
   * Get rider wallet balance and info.
   */
  async getBalance(riderId: string) {
    const wallet = await this.prisma.riderWallet.findUnique({
      where: { riderId },
    });

    if (!wallet) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.WALLET_NOT_FOUND,
        message: 'Rider wallet not found',
      });
    }

    return wallet;
  }

  /**
   * Get rider wallet with recent transactions.
   */
  async getWalletWithTransactions(riderId: string, limit = 10) {
    const wallet = await this.prisma.riderWallet.findUnique({
      where: { riderId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.WALLET_NOT_FOUND,
        message: 'Rider wallet not found',
      });
    }

    return wallet;
  }

  /**
   * Get paginated transaction history for a rider.
   */
  async getTransactions(
    riderId: string,
    params: { page?: number; pageSize?: number; type?: string },
  ) {
    const { page = 1, pageSize = 20, type } = params;

    const wallet = await this.prisma.riderWallet.findUnique({
      where: { riderId },
    });

    if (!wallet) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.WALLET_NOT_FOUND,
        message: 'Rider wallet not found',
      });
    }

    const where: any = { walletId: wallet.id };
    if (type) where.type = type;

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return {
      data: transactions,
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

  /**
   * Get all wallets eligible for payout (balance >= minimum).
   */
  async getEligibleForPayout(minimumBalance: number) {
    return this.prisma.riderWallet.findMany({
      where: {
        balance: { gte: minimumBalance },
      },
    });
  }
}
