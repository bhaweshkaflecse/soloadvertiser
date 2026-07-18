// Solo Advertiser — Business Portal
// Invoice card component for billing list view

import type { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/shared/status-badge';

interface InvoiceCardProps {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <a href={`/billing/invoices/${invoice.id}`}
      className="block bg-white rounded-lg shadow border p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-900">{invoice.campaignName}</p>
          <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-lg font-bold">{formatCurrency(invoice.amount)}</span>
        {invoice.status === 'pending' && (
          <span className="text-xs text-red-600">Payment required</span>
        )}
      </div>
    </a>
  );
}
