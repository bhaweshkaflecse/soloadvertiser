import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { INVOICE_PREFIX } from './interfaces/finance.interface';

/**
 * Invoice Service — auto-generation of invoices for campaigns.
 *
 * REQ-PRD-081: Invoice generated on payment verification.
 * Format: SA-INV-YYYYMM-XXXX (sequential).
 */
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate invoice for a campaign payment.
   */
  async generateInvoice(params: {
    businessId: string;
    campaignId: string;
    amount: number;
    taxAmount?: number;
    lineItems?: Array<{ description: string; qty: number; rate: number; amount: number }>;
  }) {
    const { businessId, campaignId, amount, taxAmount = 0, lineItems } = params;
    const totalAmount = amount + taxAmount;
    const invoiceNumber = await this.getNextInvoiceNumber();

    const defaultLineItems = lineItems || [
      {
        description: 'Campaign advertising service',
        qty: 1,
        rate: amount,
        amount,
      },
    ];

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        businessId,
        campaignId,
        amount,
        taxAmount,
        totalAmount,
        status: 'issued',
        lineItems: defaultLineItems as any,
      },
    });

    this.logger.log(`Invoice ${invoiceNumber} generated for campaign ${campaignId}`);

    return invoice;
  }

  /**
   * Get next sequential invoice number.
   * Format: SA-INV-YYYYMM-XXXX
   */
  async getNextInvoiceNumber(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `${INVOICE_PREFIX}-${yearMonth}-`;

    // Find the last invoice in this month
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let nextSeq = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10);
      nextSeq = lastSeq + 1;
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * Mark invoice as paid.
   */
  async markPaid(invoiceId: string) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });
  }

  /**
   * Get invoice by ID.
   */
  async getInvoice(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * List all invoices (admin).
   */
  async listInvoices(params?: { businessId?: string; status?: string }) {
    const where: any = {};
    if (params?.businessId) where.businessId = params.businessId;
    if (params?.status) where.status = params.status;

    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
