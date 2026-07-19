/**
 * Finance module interfaces — ledger accounts, transaction types, and business rules.
 * CTX-007: Financial Platform
 */

/**
 * Ledger account types — the five fundamental accounts in the platform.
 */
export enum LedgerAccountType {
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  CAMPAIGN_ESCROW = 'CAMPAIGN_ESCROW',
  PLATFORM_REVENUE = 'PLATFORM_REVENUE',
  RIDER_LIABILITY = 'RIDER_LIABILITY',
  RIDER_PAYOUT = 'RIDER_PAYOUT',
}

/**
 * Ledger entry types — double-entry bookkeeping.
 */
export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

/**
 * Escrow statuses.
 */
export enum EscrowStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

/**
 * Wallet transaction types.
 */
export enum WalletTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

/**
 * Payout batch statuses.
 */
export enum PayoutBatchStatus {
  GENERATED = 'generated',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Payout item statuses.
 */
export enum PayoutItemStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Supported payout methods (RULE-PAY-003).
 */
export const SUPPORTED_PAYOUT_METHODS = [
  'esewa',
  'khalti',
  'bank_transfer',
  'ime_pay',
] as const;

export type PayoutMethod = (typeof SUPPORTED_PAYOUT_METHODS)[number];

/**
 * Financial business rules — centralized constants.
 */
export const FINANCE_RULES = {
  /** RULE-FIN-001: Business daily rate in paisa (NPR 120 × 100) */
  BUSINESS_DAILY_RATE: 12000,
  /** RULE-FIN-002: Rider daily rate in paisa (NPR 100 × 100) */
  RIDER_DAILY_RATE: 10000,
  /** RULE-FIN-003: Platform commission per day in paisa (NPR 20 × 100) */
  PLATFORM_COMMISSION: 2000,
  /** RULE-PAY-001: Payout cycle interval in days */
  PAYOUT_CYCLE_DAYS: 15,
  /** RULE-PAY-002: Minimum payout amount in paisa (NPR 500 × 100) */
  MINIMUM_PAYOUT: 50000,
  /** Currency code */
  CURRENCY: 'NPR',
} as const;

/**
 * Invoice number prefix format.
 */
export const INVOICE_PREFIX = 'SA-INV';

/**
 * Reference types for ledger entries.
 */
export enum LedgerReferenceType {
  CAMPAIGN = 'campaign',
  ASSIGNMENT = 'assignment',
  PAYOUT = 'payout',
  PAYOUT_BATCH = 'payout_batch',
}

/**
 * Reconciliation report shape.
 */
export interface ReconciliationReport {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  accountBalances: Record<string, number>;
  escrowDiscrepancies: EscrowDiscrepancy[];
  walletDiscrepancies: WalletDiscrepancy[];
  generatedAt: Date;
}

export interface EscrowDiscrepancy {
  escrowId: string;
  campaignId: string;
  expectedReleased: number;
  actualReleased: number;
  difference: number;
}

export interface WalletDiscrepancy {
  walletId: string;
  riderId: string;
  storedBalance: number;
  computedBalance: number;
  difference: number;
}
