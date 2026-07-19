'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/entity/status-badge';
import { KPICard } from '@/components/dashboard/kpi-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { PayoutBatch } from '@/types';

/**
 * PG-ADM-071: Payout Management
 * Batch list + generate batch + approve + CSV export.
 */
export default function PayoutsPage() {
  const { hasRole } = useAuth();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  if (!hasRole(['finance', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const kpis = [
    { label: 'Pending Payouts', value: '₦1,250,000', icon: '⏳' },
    { label: 'This Month Paid', value: '₦3,400,000', icon: '✅' },
    { label: 'Riders in Queue', value: '89', icon: '👥' },
    { label: 'Failed Transfers', value: '3', icon: '❌' },
  ];

  const batches: PayoutBatch[] = [
    { id: 'pb1', period: 'March 2024 - Week 2', totalAmount: 450000, riderCount: 32, status: 'pending_approval', createdAt: '2024-03-14', approvedBy: undefined },
    { id: 'pb2', period: 'March 2024 - Week 1', totalAmount: 380000, riderCount: 28, status: 'completed', createdAt: '2024-03-07', approvedBy: 'Admin' },
    { id: 'pb3', period: 'February 2024 - Week 4', totalAmount: 520000, riderCount: 41, status: 'completed', createdAt: '2024-02-28', approvedBy: 'Admin' },
  ];

  const columns = [
    { key: 'period', header: 'Period', sortable: true },
    { key: 'riderCount', header: 'Riders', sortable: true },
    { key: 'totalAmount', header: 'Total Amount', sortable: true, render: (row: PayoutBatch) => `₦${row.totalAmount.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (row: PayoutBatch) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created', sortable: true },
    { key: 'actions', header: '', render: (row: PayoutBatch) => (
      <div className="flex gap-2">
        {row.status === 'pending_approval' && (
          <button className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
            Approve
          </button>
        )}
        <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          Export CSV
        </button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Payout Management"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Payouts' }]}
        actions={
          <button
            onClick={() => setShowGenerateDialog(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate New Batch
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      <DataTable columns={columns} data={batches} rowKey={(b) => b.id} />

      <ConfirmDialog
        open={showGenerateDialog}
        title="Generate Payout Batch"
        description="This will calculate payouts for all eligible riders in the current period. Continue?"
        confirmLabel="Generate"
        onConfirm={() => {
          console.log('Generate batch');
          setShowGenerateDialog(false);
        }}
        onCancel={() => setShowGenerateDialog(false)}
      />
    </div>
  );
}
