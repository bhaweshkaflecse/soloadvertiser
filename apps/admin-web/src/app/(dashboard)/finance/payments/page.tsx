'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SplitPane } from '@/components/approval/split-pane';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { Payment } from '@/types';

/**
 * PG-ADM-070: Payment Verification
 * Split-pane with payment list + proof viewer + verify/reject actions.
 */
export default function PaymentsPage() {
  const { hasRole } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!hasRole(['finance', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const payments: Payment[] = [
    { id: 'p1', businessId: 'b1', businessName: 'Acme Corp', amount: 50000, status: 'pending', method: 'Bank Transfer', reference: 'TRF-2024-001', submittedAt: new Date(Date.now() - 3600000).toISOString(), proofUrl: '/proof/p1.jpg' },
    { id: 'p2', businessId: 'b2', businessName: 'Fresh Foods', amount: 75000, status: 'pending', method: 'Bank Transfer', reference: 'TRF-2024-002', submittedAt: new Date(Date.now() - 7200000).toISOString(), proofUrl: '/proof/p2.jpg' },
    { id: 'p3', businessId: 'b1', businessName: 'Acme Corp', amount: 25000, status: 'verified', method: 'Card', reference: 'CRD-2024-001', submittedAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const selected = payments.find((p) => p.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Payment Verification"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payments' }]}
        subtitle={`${pendingPayments.length} payments pending verification`}
      />

      <SplitPane
        list={
          <ul className="divide-y">
            {payments.map((payment) => (
              <li key={payment.id}>
                <button
                  onClick={() => setSelectedId(payment.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedId === payment.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{payment.businessName}</span>
                    <StatusBadge status={payment.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-700">₦{payment.amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(payment.submittedAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        }
        detail={
          selected ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">{selected.businessName}</h2>
                  <StatusBadge status={selected.status} size="md" />
                </div>

                {/* Payment details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><p className="text-xs text-gray-500">Amount</p><p className="text-lg font-bold text-green-700">₦{selected.amount.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500">Method</p><p className="text-sm">{selected.method}</p></div>
                  <div><p className="text-xs text-gray-500">Reference</p><p className="text-sm font-mono">{selected.reference}</p></div>
                  <div><p className="text-xs text-gray-500">Submitted</p><p className="text-sm">{formatRelativeTime(selected.submittedAt)}</p></div>
                </div>

                {/* Payment proof */}
                {selected.proofUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Proof</h3>
                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border">
                      <p className="text-sm text-gray-500">Payment proof image: {selected.proofUrl}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selected.status === 'pending' && (
                <div className="border-t p-4 bg-gray-50 flex gap-3">
                  <button
                    onClick={() => console.log('Verify:', selected.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Verify Payment
                  </button>
                  <button
                    onClick={() => console.log('Reject:', selected.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a payment to verify
            </div>
          )
        }
      />
    </div>
  );
}
