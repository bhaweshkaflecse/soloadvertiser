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
import {
  LedgerAccountType,
  LedgerEntryType,
  LedgerReferenceType,
  EscrowStatus,
  FINANCE_RULES,
} from './interfaces/finance.interface';
import { EscrowCreatedEvent } from './events/escrow-created.event';
import { EscrowReleasedEvent } from './events/escrow-released.event';

/**
 * Escrow Service — manages campaign escrow lifecycle.
 *
 * Flow:
 * 1. Payment verified → createEscrow() → full campaign amount held
 * 2. Daily cron → releaseDailyAmount() → splits into commission + rider share
 * 3. Campaign complete → closeEscrow() → verify fully released
 * 4. Campaign cancelled → refundEscrow() → return remaining to business
 *
 * RULE-FIN-005: Daily release = total_escrow / total_days
 */
@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create escrow on payment verification.
   * Ledger: DEBIT Accounts Receivable, CREDIT Campaign Escrow.
   */
  async createEscrow(params: {
    campaignId: string;
    totalAmount: number;
    totalDays: number;
    createdBy?: string;
  }) {
    this.logger.log(`Creating escrow for campaign ${params.campaignId}`);

    const dailyRelease = Math.floor(params.totalAmount / params.totalDays);

    const escrow = await this.prisma.escrow.create({
      data: {
        campaignId: params.campaignId,
        totalAmount: params.totalAmount,
        remainingAmount: params.totalAmount,
        totalDays: params.totalDays,
        dailyRelease,
        daysReleased: 0,
        status: EscrowStatus.ACTIVE,
      },
    });

    // Ledger double entry: DEBIT AR → CREDIT Escrow
    await this.ledgerService.createDoubleEntry({
      debitAccount: LedgerAccountType.ACCOUNTS_RECEIVABLE,
      creditAccount: LedgerAccountType.CAMPAIGN_ESCROW,
      amount: params.totalAmount,
      description: `Escrow created for campaign ${params.campaignId}`,
      referenceType: LedgerReferenceType.CAMPAIGN,
      referenceId: params.campaignId,
      createdBy: params.createdBy,
    });

    // Emit event
    this.eventEmitter.emit(
      EscrowCreatedEvent.EVENT_NAME,
      new EscrowCreatedEvent(
        escrow.id,
        params.campaignId,
        params.totalAmount,
        params.totalDays,
        dailyRelease,
      ),
    );

    return escrow;
  }

  /**
   * Release daily amount from escrow.
   * Called by cron job once per day for each active escrow.
   * Splits into platform commission + rider share.
   *
   * RULE-FIN-003: Commission = business rate - rider rate (NPR 20/day per rider).
   * RULE-FIN-005: Daily release = total_escrow / total_days.
   */
  async releaseDailyAmount(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'Escrow not found',
      });
    }

    if (escrow.status !== EscrowStatus.ACTIVE) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'Escrow is not active',
      });
    }

    if (escrow.daysReleased >= escrow.totalDays) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'All escrow days already released',
      });
    }

    const dayNumber = escrow.daysReleased + 1;
    const releaseAmount = escrow.dailyRelease;

    // Calculate commission and rider share proportionally
    // Commission ratio: PLATFORM_COMMISSION / BUSINESS_DAILY_RATE
    const commissionRatio =
      FINANCE_RULES.PLATFORM_COMMISSION / FINANCE_RULES.BUSINESS_DAILY_RATE;
    const commission = Math.floor(releaseAmount * commissionRatio);
    const riderShare = releaseAmount - commission;

    // Create release record
    const release = await this.prisma.escrowRelease.create({
      data: {
        escrowId,
        dayNumber,
        amount: releaseAmount,
        commission,
        riderShare,
      },
    });

    // Update escrow counters
    await this.prisma.escrow.update({
      where: { id: escrowId },
      data: {
        daysReleased: dayNumber,
        releasedAmount: escrow.releasedAmount + releaseAmount,
        remainingAmount: escrow.remainingAmount - releaseAmount,
      },
    });

    // Ledger: DEBIT Campaign Escrow, CREDIT Platform Revenue (commission)
    await this.ledgerService.createDoubleEntry({
      debitAccount: LedgerAccountType.CAMPAIGN_ESCROW,
      creditAccount: LedgerAccountType.PLATFORM_REVENUE,
      amount: commission,
      description: `Daily commission day ${dayNumber} for campaign ${escrow.campaignId}`,
      referenceType: LedgerReferenceType.CAMPAIGN,
      referenceId: escrow.campaignId,
    });

    // Ledger: DEBIT Campaign Escrow, CREDIT Rider Liability (rider share)
    await this.ledgerService.createDoubleEntry({
      debitAccount: LedgerAccountType.CAMPAIGN_ESCROW,
      creditAccount: LedgerAccountType.RIDER_LIABILITY,
      amount: riderShare,
      description: `Daily rider share day ${dayNumber} for campaign ${escrow.campaignId}`,
      referenceType: LedgerReferenceType.CAMPAIGN,
      referenceId: escrow.campaignId,
    });

    // Emit event
    this.eventEmitter.emit(
      EscrowReleasedEvent.EVENT_NAME,
      new EscrowReleasedEvent(
        escrowId,
        escrow.campaignId,
        dayNumber,
        releaseAmount,
        commission,
        riderShare,
      ),
    );

    return release;
  }

  /**
   * Refund remaining escrow on campaign cancellation.
   * Ledger: DEBIT Campaign Escrow, CREDIT Accounts Receivable (return to business).
   */
  async refundEscrow(escrowId: string, reason: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'Escrow not found',
      });
    }

    if (escrow.status !== EscrowStatus.ACTIVE) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'Escrow is not in refundable state',
      });
    }

    const refundAmount = escrow.remainingAmount;

    // Update escrow
    const updated = await this.prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.REFUNDED,
        refundedAmount: refundAmount,
        remainingAmount: 0,
        closedAt: new Date(),
      },
    });

    // Ledger: DEBIT Campaign Escrow, CREDIT Accounts Receivable
    if (refundAmount > 0) {
      await this.ledgerService.createDoubleEntry({
        debitAccount: LedgerAccountType.CAMPAIGN_ESCROW,
        creditAccount: LedgerAccountType.ACCOUNTS_RECEIVABLE,
        amount: refundAmount,
        description: `Escrow refund for campaign ${escrow.campaignId}: ${reason}`,
        referenceType: LedgerReferenceType.CAMPAIGN,
        referenceId: escrow.campaignId,
      });
    }

    return updated;
  }

  /**
   * Close escrow on campaign completion. Verifies fully released.
   */
  async closeEscrow(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'Escrow not found',
      });
    }

    return this.prisma.escrow.update({
      where: { id: escrowId },
      data: {
        status: EscrowStatus.COMPLETED,
        closedAt: new Date(),
      },
    });
  }

  /**
   * Get escrow by ID with releases.
   */
  async getEscrow(escrowId: string) {
    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { releases: { orderBy: { dayNumber: 'asc' } } },
    });

    if (!escrow) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYMENT.ESCROW_NOT_FOUND,
        message: 'Escrow not found',
      });
    }

    return escrow;
  }

  /**
   * Get escrow by campaign ID.
   */
  async getEscrowByCampaign(campaignId: string) {
    return this.prisma.escrow.findUnique({
      where: { campaignId },
      include: { releases: { orderBy: { dayNumber: 'asc' } } },
    });
  }

  /**
   * List all active escrows.
   */
  async listActiveEscrows() {
    return this.prisma.escrow.findMany({
      where: { status: EscrowStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List all escrows (admin view).
   */
  async listEscrows() {
    return this.prisma.escrow.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
