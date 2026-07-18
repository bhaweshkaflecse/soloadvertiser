import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitPaymentDto } from './dto';
import { ERROR_CODES } from '@solo-advertiser/contracts';
import { CampaignStatus } from '@solo-advertiser/types';
import { CampaignFundedEvent } from './events/campaign-funded.event';

/**
 * Campaign payment service — handles payment submission and admin verification.
 *
 * Flow: Business submits proof → Finance Staff verifies → auto-transitions to RECRUITING_RIDERS.
 * RULE-CMP-005: Cannot skip payment states.
 * RULE-CMP-010: NPR only.
 */
@Injectable()
export class CampaignPaymentService {
  private readonly logger = new Logger(CampaignPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Business submits payment proof.
   * Transitions campaign: PENDING_PAYMENT → PAYMENT_SUBMITTED.
   */
  async submitPayment(campaignId: string, businessId: string, dto: SubmitPaymentDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { payment: true },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    // Ownership check
    if (campaign.businessId !== businessId) {
      throw new ForbiddenException({
        code: ERROR_CODES.CAMPAIGN.UNAUTHORIZED_ACTION,
        message: 'You do not own this campaign',
      });
    }

    // Must be in PENDING_PAYMENT
    if (campaign.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.PAYMENT_REQUIRED,
        message: 'Campaign must be in PENDING_PAYMENT status to submit payment',
      });
    }

    // Amount validation
    if (dto.amount < campaign.totalCost) {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.PAYMENT_REQUIRED,
        message: `Payment amount must be at least ${campaign.totalCost} paisa (campaign cost)`,
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Create or update payment record
      const payment = campaign.payment
        ? await tx.campaignPayment.update({
            where: { id: campaign.payment.id },
            data: {
              method: dto.method,
              amount: dto.amount,
              referenceId: dto.referenceId,
              paymentDate: new Date(dto.paymentDate),
              proofMediaId: dto.proofMediaId,
              status: 'submitted',
              rejectionReason: null,
            },
          })
        : await tx.campaignPayment.create({
            data: {
              campaignId,
              method: dto.method,
              amount: dto.amount,
              referenceId: dto.referenceId,
              paymentDate: new Date(dto.paymentDate),
              proofMediaId: dto.proofMediaId,
              status: 'submitted',
            },
          });

      // Transition campaign
      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: 'PAYMENT_SUBMITTED' },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: campaign.status,
          toStatus: 'PAYMENT_SUBMITTED',
          reason: `Payment submitted: ${dto.method} - ${dto.referenceId}`,
        },
      });

      return payment;
    });

    this.logger.log(`Payment submitted for campaign: ${campaignId}`);
    return result;
  }

  /**
   * Admin (Finance Staff+): Verify payment.
   * Transitions: PAYMENT_SUBMITTED → PAYMENT_VERIFIED → RECRUITING_RIDERS (auto).
   */
  async verifyPayment(campaignId: string, adminUserId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { payment: true },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    if (campaign.status !== 'PAYMENT_SUBMITTED') {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.INVALID_STATE_TRANSITION,
        message: 'Campaign must be in PAYMENT_SUBMITTED status to verify payment',
      });
    }

    if (!campaign.payment) {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.PAYMENT_REQUIRED,
        message: 'No payment record found for this campaign',
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Verify payment
      await tx.campaignPayment.update({
        where: { id: campaign.payment!.id },
        data: {
          status: 'verified',
          verifiedBy: adminUserId,
          verifiedAt: new Date(),
        },
      });

      // Transition: PAYMENT_SUBMITTED → PAYMENT_VERIFIED → RECRUITING_RIDERS (auto)
      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: 'RECRUITING_RIDERS' },
      });

      // Record both transitions
      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: 'PAYMENT_SUBMITTED',
          toStatus: 'PAYMENT_VERIFIED',
          reason: 'Payment verified by finance staff',
          changedBy: adminUserId,
        },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: 'PAYMENT_VERIFIED',
          toStatus: 'RECRUITING_RIDERS',
          reason: 'Auto-transition after payment verification',
          changedBy: adminUserId,
        },
      });

      return tx.campaign.findUnique({
        where: { id: campaignId },
        include: { payment: true },
      });
    });

    this.logger.log(`Payment verified for campaign: ${campaignId} by: ${adminUserId}`);
    this.eventEmitter.emit(
      CampaignFundedEvent.EVENT_NAME,
      new CampaignFundedEvent(
        campaignId,
        campaign.businessId,
        campaign.payment.amount,
      ),
    );

    return result;
  }

  /**
   * Admin (Finance Staff+): Reject payment.
   * Transitions: PAYMENT_SUBMITTED → PENDING_PAYMENT (back for resubmission).
   */
  async rejectPayment(campaignId: string, adminUserId: string, reason: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { payment: true },
    });

    if (!campaign) {
      throw new NotFoundException({
        code: ERROR_CODES.CAMPAIGN.NOT_FOUND,
        message: 'Campaign not found',
      });
    }

    if (campaign.status !== 'PAYMENT_SUBMITTED') {
      throw new BadRequestException({
        code: ERROR_CODES.CAMPAIGN.INVALID_STATE_TRANSITION,
        message: 'Campaign must be in PAYMENT_SUBMITTED status to reject payment',
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Reject payment
      if (campaign.payment) {
        await tx.campaignPayment.update({
          where: { id: campaign.payment.id },
          data: {
            status: 'rejected',
            rejectionReason: reason,
          },
        });
      }

      // Transition back to PENDING_PAYMENT
      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: 'PENDING_PAYMENT' },
      });

      await tx.campaignStatusHistory.create({
        data: {
          campaignId,
          fromStatus: 'PAYMENT_SUBMITTED',
          toStatus: 'PENDING_PAYMENT',
          reason: `Payment rejected: ${reason}`,
          changedBy: adminUserId,
        },
      });

      return tx.campaign.findUnique({
        where: { id: campaignId },
        include: { payment: true },
      });
    });

    this.logger.log(`Payment rejected for campaign: ${campaignId} by: ${adminUserId}`);
    return result;
  }
}
