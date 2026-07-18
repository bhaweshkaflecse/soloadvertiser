import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CampaignPaymentService } from './campaign-payment.service';
import { SubmitPaymentDto, RejectPaymentDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload, Role } from '@solo-advertiser/types';

/**
 * Campaign payment controller — handles payment submission and admin verification.
 * Base path: /api/v1/campaigns
 */
@Controller('campaigns')
export class CampaignPaymentController {
  constructor(private readonly campaignPaymentService: CampaignPaymentService) {}

  // === BUSINESS PAYMENT ===

  /** POST /api/v1/campaigns/:id/payment — Submit payment proof */
  @Post(':id/payment')
  @Roles(Role.BUSINESS)
  async submitPayment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitPaymentDto,
  ) {
    const payment = await this.campaignPaymentService.submitPayment(id, user.sub, dto);
    return { success: true, data: payment, timestamp: new Date().toISOString() };
  }

  // === ADMIN VERIFICATION ===

  /** PATCH /api/v1/campaigns/:id/verify-payment — Verify payment (Finance Staff+) */
  @Patch(':id/verify-payment')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async verifyPayment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.campaignPaymentService.verifyPayment(id, user.sub);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }

  /** PATCH /api/v1/campaigns/:id/reject-payment — Reject payment (Finance Staff+) */
  @Patch(':id/reject-payment')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async rejectPayment(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectPaymentDto,
  ) {
    const result = await this.campaignPaymentService.rejectPayment(id, user.sub, dto.reason);
    return { success: true, data: result, timestamp: new Date().toISOString() };
  }
}
