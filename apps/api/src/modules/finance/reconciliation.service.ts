import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from './ledger.service';
import {
  LedgerAccountType,
  EscrowStatus,
  ReconciliationReport,
  EscrowDiscrepancy,
  WalletDiscrepancy,
} from './interfaces/finance.interface';

/**
 * Reconciliation Service — balance verification and discrepancy detection.
 *
 * Checks:
 * 1. Global ledger balance (debits == credits)
 * 2. Escrow released amounts match release records
 * 3. Wallet balances match transaction sums
 */
@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Run full reconciliation check.
   */
  async runReconciliation(): Promise<ReconciliationReport> {
    this.logger.log('Running reconciliation...');

    // 1. Check global ledger balance
    const { isBalanced, totalDebits, totalCredits } =
      await this.ledgerService.verifyBalance();

    // 2. Get account balances
    const accountBalances: Record<string, number> = {};
    for (const accountType of Object.values(LedgerAccountType)) {
      accountBalances[accountType] = await this.ledgerService.getBalance(accountType);
    }

    // 3. Check escrow discrepancies
    const escrowDiscrepancies = await this.checkEscrowDiscrepancies();

    // 4. Check wallet discrepancies
    const walletDiscrepancies = await this.checkWalletDiscrepancies();

    const report: ReconciliationReport = {
      totalDebits,
      totalCredits,
      isBalanced,
      accountBalances,
      escrowDiscrepancies,
      walletDiscrepancies,
      generatedAt: new Date(),
    };

    if (!isBalanced || escrowDiscrepancies.length > 0 || walletDiscrepancies.length > 0) {
      this.logger.warn('Reconciliation found discrepancies!');
    } else {
      this.logger.log('Reconciliation passed — all balances OK');
    }

    return report;
  }

  /**
   * Check escrow released amounts match sum of release records.
   */
  private async checkEscrowDiscrepancies(): Promise<EscrowDiscrepancy[]> {
    const escrows = await this.prisma.escrow.findMany({
      include: { releases: true },
    });

    const discrepancies: EscrowDiscrepancy[] = [];

    for (const escrow of escrows) {
      const actualReleased = escrow.releases.reduce((sum, r) => sum + r.amount, 0);

      if (actualReleased !== escrow.releasedAmount) {
        discrepancies.push({
          escrowId: escrow.id,
          campaignId: escrow.campaignId,
          expectedReleased: escrow.releasedAmount,
          actualReleased,
          difference: escrow.releasedAmount - actualReleased,
        });
      }
    }

    return discrepancies;
  }

  /**
   * Check wallet balances match sum of transactions.
   */
  private async checkWalletDiscrepancies(): Promise<WalletDiscrepancy[]> {
    const wallets = await this.prisma.riderWallet.findMany({
      include: { transactions: true },
    });

    const discrepancies: WalletDiscrepancy[] = [];

    for (const wallet of wallets) {
      let computedBalance = 0;
      for (const tx of wallet.transactions) {
        if (tx.type === 'credit') {
          computedBalance += tx.amount;
        } else {
          computedBalance -= tx.amount;
        }
      }

      if (computedBalance !== wallet.balance) {
        discrepancies.push({
          walletId: wallet.id,
          riderId: wallet.riderId,
          storedBalance: wallet.balance,
          computedBalance,
          difference: wallet.balance - computedBalance,
        });
      }
    }

    return discrepancies;
  }

  /**
   * Get the latest reconciliation report (re-runs on demand).
   */
  async getReconciliationReport(): Promise<ReconciliationReport> {
    return this.runReconciliation();
  }
}
