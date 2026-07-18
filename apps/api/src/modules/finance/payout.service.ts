import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { LedgerService } from './ledger.service';
import { WalletService } from './wallet.service';
import {
  LedgerAccountType,
  LedgerReferenceType,
  PayoutBatchStatus,
  PayoutItemStatus,
  SUPPORTED_PAYOUT_METHODS,
  FINANCE_RULES,
} from './interfaces/finance.interface';
import { PayoutCompletedEvent } from './events/payout-completed.event';

/**
 * Payout Service — batch generation, approval, and completion.
 *
 * Flow:
 * 1. Finance staff generates batch → finds eligible riders (balance >= NPR 500)
 * 2. Finance staff approves batch
 * 3. Finance processes payments manually (outside system)
 * 4. Finance marks each item complete (with proof) or failed (with reason)
 *
 * RULE-PAY-001: Payout cycle every 15 days.
 * RULE-PAY-002: Minimum payout NPR 500.
 * RULE-PAY-003: Supported methods: eSewa, Khalti, Bank Transfer, IME Pay.
 * RULE-PAY-004: Finance Staff manually approves batches.
 * RULE-PAY-005: Payout completion requires proof upload.
 */
@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate a payout batch for all eligible riders.
   * RULE-PAY-002: Only include wallets with balance >= NPR 500 (50000 paisa).
   */
  async generateBatch(generatedBy: string, cycleDate?: Date) {
    this.logger.log('Generating payout batch');

    const eligibleWallets = await this.walletService.getEligibleForPayout(
      FINANCE_RULES.MINIMUM_PAYOUT,
    );

    if (eligibleWallets.length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.BELOW_MINIMUM,
        message: 'No riders eligible for payout (minimum NPR 500)',
      });
    }

    const totalAmount = eligibleWallets.reduce((sum, w) => sum + w.balance, 0);

    // Create batch with items in a transaction
    const batch = await this.prisma.payoutBatch.create({
      data: {
        cycleDate: cycleDate || new Date(),
        riderCount: eligibleWallets.length,
        totalAmount,
        status: PayoutBatchStatus.GENERATED,
        generatedBy,
        items: {
          create: eligibleWallets.map((wallet) => ({
            riderId: wallet.riderId,
            walletId: wallet.id,
            amount: wallet.balance,
            method: 'esewa', // default — can be updated per rider preference
            status: PayoutItemStatus.PENDING,
          })),
        },
      },
      include: { items: true },
    });

    this.logger.log(
      `Payout batch ${batch.id} generated: ${eligibleWallets.length} riders, total=${totalAmount}`,
    );

    return batch;
  }

  /**
   * Approve a generated payout batch.
   * RULE-PAY-004: Finance Staff manually approves batches.
   */
  async approveBatch(batchId: string, approvedBy: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.BATCH_NOT_APPROVABLE,
        message: 'Payout batch not found',
      });
    }

    if (batch.status !== PayoutBatchStatus.GENERATED) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.BATCH_NOT_APPROVABLE,
        message: `Batch is in '${batch.status}' state and cannot be approved`,
      });
    }

    return this.prisma.payoutBatch.update({
      where: { id: batchId },
      data: {
        status: PayoutBatchStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Complete an individual payout item (rider paid).
   * RULE-PAY-005: Requires proof upload.
   *
   * Ledger: DEBIT Rider Liability, CREDIT Rider Payout.
   */
  async completeItem(
    itemId: string,
    proofMediaId: string,
    referenceId?: string,
  ) {
    const item = await this.prisma.payoutItem.findUnique({
      where: { id: itemId },
      include: { batch: true },
    });

    if (!item) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.BELOW_MINIMUM,
        message: 'Payout item not found',
      });
    }

    if (!proofMediaId) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.NO_PROOF,
        message: 'Proof of payment is required to complete payout',
      });
    }

    if (item.status !== PayoutItemStatus.PENDING) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.BATCH_NOT_APPROVABLE,
        message: 'Payout item is not in pending state',
      });
    }

    // Update item as completed
    const updated = await this.prisma.payoutItem.update({
      where: { id: itemId },
      data: {
        status: PayoutItemStatus.COMPLETED,
        proofMediaId,
        referenceId: referenceId || null,
        completedAt: new Date(),
      },
    });

    // Debit rider wallet
    await this.walletService.debitWallet({
      riderId: item.riderId,
      amount: item.amount,
      description: `Payout batch ${item.batchId} item ${itemId}`,
      referenceType: 'payout_batch',
      referenceId: item.batchId,
    });

    // Ledger: DEBIT Rider Liability, CREDIT Rider Payout
    await this.ledgerService.createDoubleEntry({
      debitAccount: LedgerAccountType.RIDER_LIABILITY,
      creditAccount: LedgerAccountType.RIDER_PAYOUT,
      amount: item.amount,
      description: `Payout to rider ${item.riderId} via ${item.method}`,
      referenceType: LedgerReferenceType.PAYOUT,
      referenceId: itemId,
    });

    // Emit event
    this.eventEmitter.emit(
      PayoutCompletedEvent.EVENT_NAME,
      new PayoutCompletedEvent(
        itemId,
        item.batchId,
        item.riderId,
        item.amount,
        item.method,
      ),
    );

    // Check if all items in batch are completed/failed → mark batch completed
    await this.checkBatchCompletion(item.batchId);

    return updated;
  }

  /**
   * Mark a payout item as failed.
   */
  async failItem(itemId: string, reason: string) {
    const item = await this.prisma.payoutItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.BELOW_MINIMUM,
        message: 'Payout item not found',
      });
    }

    if (item.status !== PayoutItemStatus.PENDING) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.BATCH_NOT_APPROVABLE,
        message: 'Payout item is not in pending state',
      });
    }

    const updated = await this.prisma.payoutItem.update({
      where: { id: itemId },
      data: {
        status: PayoutItemStatus.FAILED,
        failureReason: reason,
      },
    });

    // Check if all items in batch are completed/failed
    await this.checkBatchCompletion(item.batchId);

    return updated;
  }

  /**
   * Check if all items in a batch are done (completed or failed).
   * If so, mark the batch as completed.
   */
  private async checkBatchCompletion(batchId: string) {
    const pendingCount = await this.prisma.payoutItem.count({
      where: { batchId, status: PayoutItemStatus.PENDING },
    });

    if (pendingCount === 0) {
      await this.prisma.payoutBatch.update({
        where: { id: batchId },
        data: {
          status: PayoutBatchStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }
  }

  /**
   * Get batch detail with items.
   */
  async getBatch(batchId: string) {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });

    if (!batch) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.BATCH_NOT_APPROVABLE,
        message: 'Payout batch not found',
      });
    }

    return batch;
  }

  /**
   * List all payout batches.
   */
  async listBatches() {
    return this.prisma.payoutBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
  }

  /**
   * Get payout history for a specific rider.
   */
  async getRiderPayouts(riderId: string) {
    return this.prisma.payoutItem.findMany({
      where: { riderId },
      include: { batch: { select: { cycleDate: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Export batch as CSV for manual bank processing.
   */
  async exportBatchCsv(batchId: string): Promise<string> {
    const batch = await this.prisma.payoutBatch.findUnique({
      where: { id: batchId },
      include: { items: true },
    });

    if (!batch) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.BATCH_NOT_APPROVABLE,
        message: 'Payout batch not found',
      });
    }

    const header = 'rider_id,wallet_id,amount_paisa,amount_npr,method,account_detail,status\n';
    const rows = batch.items
      .map(
        (item) =>
          `${item.riderId},${item.walletId},${item.amount},${(item.amount / 100).toFixed(2)},${item.method},${item.accountDetail || ''},${item.status}`,
      )
      .join('\n');

    return header + rows;
  }
}
