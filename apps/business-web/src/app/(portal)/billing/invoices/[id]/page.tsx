// Solo Advertiser — Business Portal
// PG-BIZ-042: Invoice Detail Page
// Shows invoice details with payment status and proof

'use client';

import { useApi } from '@/hooks/use-api';
import type { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/shared/status-badge';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

interface InvoiceDetailProps {
  params: { id: string };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailProps) {
  const { data: invoice, isLoading } = useApi<Invoice>(`/invoices/${params.id}`);

  if (isLoading) return <LoadingSkeleton className="h-64" />;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Invoice #{invoice.id.slice(0, 8)}</h1>
          <p className="text-gray-600">Campaign: {invoice.campaignName}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Amount</span>
            <span className="text-xl font-bold">{formatCurrency(invoice.amount)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Due Date</span>
            <span className="font-medium">{formatDate(invoice.dueDate)}</span>
          </div>
          {invoice.paidDate && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Paid Date</span>
              <span className="font-medium">{formatDate(invoice.paidDate)}</span>
            </div>
          )}
          {invoice.reference && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Payment Reference</span>
              <span className="font-mono text-sm">{invoice.reference}</span>
            </div>
          )}
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Created</span>
            <span className="font-medium">{formatDate(invoice.createdAt)}</span>
          </div>
        </div>

        {invoice.status === 'pending' && (
          <a href={`/billing/pay/${invoice.campaignId}`}
            className="mt-6 block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Submit Payment
          </a>
        )}

        {invoice.status === 'rejected' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Payment was rejected</p>
            <p className="text-red-600 text-sm mt-1">Please re-submit with valid proof of payment.</p>
            <a href={`/billing/pay/${invoice.campaignId}`}
              className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
              Re-submit Payment
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
