// Solo Advertiser — Business Portal
// PG-BIZ-040: Billing Overview
// Shows total spend, outstanding balance, and invoice list

'use client';

import { useApi } from '@/hooks/use-api';
import type { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import PageHeader from '@/components/layout/page-header';
import StatusBadge from '@/components/shared/status-badge';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

export default function BillingPage() {
  const { data: invoices, isLoading } = useApi<Invoice[]>('/invoices');

  const totalPaid = invoices?.filter((i) => i.status === 'verified').reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const outstanding = invoices?.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0) ?? 0;

  return (
    <div>
      <PageHeader title="Billing" description="Manage payments and invoices" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(outstanding)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices?.length ?? 0}</p>
        </div>
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Invoices</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <LoadingSkeleton key={i} className="h-12" />)}
          </div>
        ) : (
          <div className="divide-y">
            {invoices?.map((invoice) => (
              <a key={invoice.id} href={`/billing/invoices/${invoice.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium">{invoice.campaignName}</p>
                  <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                  <StatusBadge status={invoice.status} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
