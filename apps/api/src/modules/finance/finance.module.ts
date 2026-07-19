import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../prisma/prisma.module';

// Controllers
import { FinanceController } from './finance.controller';
import { PayoutController } from './payout.controller';
import { WalletController } from './wallet.controller';

// Services
import { LedgerService } from './ledger.service';
import { EscrowService } from './escrow.service';
import { WalletService } from './wallet.service';
import { PayoutService } from './payout.service';
import { InvoiceService } from './invoice.service';
import { ReconciliationService } from './reconciliation.service';

/**
 * Finance Module — ledger-based accounting system handling all money flows.
 *
 * Sprint 5 (CTX-007): Financial Platform
 *
 * Components:
 * - Ledger: Immutable double-entry bookkeeping
 * - Escrow: Campaign fund management with daily releases
 * - Wallet: Rider earnings tracking
 * - Payout: Batch generation and manual processing
 * - Invoice: Auto-generation for campaign payments
 * - Reconciliation: Balance verification and discrepancy detection
 */
@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [
    FinanceController,
    PayoutController,
    WalletController,
  ],
  providers: [
    LedgerService,
    EscrowService,
    WalletService,
    PayoutService,
    InvoiceService,
    ReconciliationService,
  ],
  exports: [
    LedgerService,
    EscrowService,
    WalletService,
    PayoutService,
    InvoiceService,
    ReconciliationService,
  ],
})
export class FinanceModule {}
