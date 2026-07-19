import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { EscrowService } from './escrow.service';
import { InvoiceService } from './invoice.service';
import { ReconciliationService } from './reconciliation.service';
import { FinanceQueryDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@soloadvertiser/types';

/**
 * Finance Controller — Admin financial operations.
 *
 * All endpoints require FINANCE_STAFF or higher role.
 * Provides ledger queries, escrow views, invoices, and reconciliation.
 */
@Controller('api/v1/finance')
@Roles(Role.FINANCE_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
export class FinanceController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly escrowService: EscrowService,
    private readonly invoiceService: InvoiceService,
    private readonly reconciliationService: ReconciliationService,
  ) {}

  // === LEDGER ENDPOINTS ===

  /**
   * GET /api/v1/finance/ledger
   * Query ledger entries with filters (account, reference, date range).
   */
  @Get('ledger')
  async queryLedger(@Query() query: FinanceQueryDto) {
    return this.ledgerService.queryEntries(query);
  }

  // === ESCROW ENDPOINTS ===

  /**
   * GET /api/v1/finance/escrows
   * List all escrows (active and historical).
   */
  @Get('escrows')
  async listEscrows() {
    const escrows = await this.escrowService.listEscrows();
    return { data: escrows };
  }

  /**
   * GET /api/v1/finance/escrows/:id
   * Get escrow detail with releases.
   */
  @Get('escrows/:id')
  async getEscrow(@Param('id', ParseUUIDPipe) id: string) {
    const escrow = await this.escrowService.getEscrow(id);
    return { data: escrow };
  }

  // === INVOICE ENDPOINTS ===

  /**
   * GET /api/v1/finance/invoices
   * List all invoices.
   */
  @Get('invoices')
  async listInvoices(
    @Query('businessId') businessId?: string,
    @Query('status') status?: string,
  ) {
    const invoices = await this.invoiceService.listInvoices({ businessId, status });
    return { data: invoices };
  }

  /**
   * GET /api/v1/finance/invoices/:id
   * Get invoice detail.
   */
  @Get('invoices/:id')
  async getInvoice(@Param('id', ParseUUIDPipe) id: string) {
    const invoice = await this.invoiceService.getInvoice(id);
    return { data: invoice };
  }

  // === RECONCILIATION ENDPOINTS ===

  /**
   * GET /api/v1/finance/reconciliation
   * Run reconciliation and return report.
   */
  @Get('reconciliation')
  async getReconciliation() {
    const report = await this.reconciliationService.getReconciliationReport();
    return { data: report };
  }
}
