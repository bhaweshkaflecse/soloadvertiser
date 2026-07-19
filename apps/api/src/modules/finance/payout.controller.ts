import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
  ParseUUIDPipe,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { PayoutService } from './payout.service';
import { GeneratePayoutDto, ApprovePayoutDto, CompletePayoutItemDto } from './dto';
import { FailPayoutItemDto } from './dto/finance-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@soloadvertiser/types';

/**
 * Payout Controller — Payout batch management for Finance Staff.
 *
 * Handles batch generation, approval, individual item completion/failure,
 * and CSV export for manual bank processing.
 */
@Controller('api/v1/finance/payouts')
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  // === ADMIN ENDPOINTS (Finance Staff+) ===

  /**
   * POST /api/v1/finance/payouts/generate
   * Generate a payout batch for eligible riders.
   */
  @Post('generate')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async generateBatch(
    @CurrentUser('sub') userId: string,
    @Body() dto: GeneratePayoutDto,
  ) {
    const cycleDate = dto.cycleDate ? new Date(dto.cycleDate) : undefined;
    const batch = await this.payoutService.generateBatch(userId, cycleDate);
    return { data: batch };
  }

  /**
   * GET /api/v1/finance/payouts/batches
   * List all payout batches.
   */
  @Get('batches')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async listBatches() {
    const batches = await this.payoutService.listBatches();
    return { data: batches };
  }

  /**
   * GET /api/v1/finance/payouts/batches/:id
   * Get batch detail with items.
   */
  @Get('batches/:id')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async getBatch(@Param('id', ParseUUIDPipe) id: string) {
    const batch = await this.payoutService.getBatch(id);
    return { data: batch };
  }

  /**
   * PATCH /api/v1/finance/payouts/batches/:id/approve
   * Approve a generated payout batch.
   */
  @Patch('batches/:id/approve')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async approveBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ApprovePayoutDto,
  ) {
    const batch = await this.payoutService.approveBatch(id, userId);
    return { data: batch };
  }

  /**
   * PATCH /api/v1/finance/payouts/items/:id/complete
   * Mark individual payout item as completed (with proof).
   */
  @Patch('items/:id/complete')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async completeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompletePayoutItemDto,
  ) {
    const item = await this.payoutService.completeItem(
      id,
      dto.proofMediaId,
      dto.referenceId,
    );
    return { data: item };
  }

  /**
   * PATCH /api/v1/finance/payouts/items/:id/fail
   * Mark payout item as failed (with reason).
   */
  @Patch('items/:id/fail')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async failItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FailPayoutItemDto,
  ) {
    const item = await this.payoutService.failItem(id, dto.reason);
    return { data: item };
  }

  /**
   * GET /api/v1/finance/payouts/batches/:id/csv
   * Export batch as CSV for manual processing.
   */
  @Get('batches/:id/csv')
  @Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
  async exportCsv(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const csv = await this.payoutService.exportBatchCsv(id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payout-batch-${id}.csv`);
    res.send(csv);
  }

  // === RIDER SELF-SERVICE ===

  /**
   * GET /api/v1/finance/payouts/me
   * Get own payout history (rider).
   */
  @Get('me')
  @Roles(Role.RIDER)
  async getMyPayouts(@CurrentUser('sub') userId: string) {
    // Note: In production, resolve riderId from userId via rider service
    // For now, use userId as a lookup key
    const payouts = await this.payoutService.getRiderPayouts(userId);
    return { data: payouts };
  }
}
