'use client';

import { PageHeader } from '@/components/layout/page-header';
import { KPICard } from '@/components/dashboard/kpi-card';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-072: Reconciliation
 * Match incoming payments with expected amounts, flag discrepancies.
 */
export default function ReconciliationPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['finance', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const kpis = [
    { label: 'Matched', value: '₦8,200,000', icon: '✅', trend: 'up' as const, change: 5 },
    { label: 'Unmatched', value: '₦350,000', icon: '⚠️' },
    { label: 'Discrepancies', value: '7', icon: '🔍' },
    { label: 'Match Rate', value: '96%', icon: '📊' },
  ];

  const records = [
    { id: 'r1', reference: 'TRF-2024-001', business: 'Acme Corp', expected: 50000, received: 50000, status: 'matched', date: '2024-03-10' },
    { id: 'r2', reference: 'TRF-2024-002', business: 'Fresh Foods', expected: 75000, received: 74500, status: 'discrepancy', date: '2024-03-11' },
    { id: 'r3', reference: 'TRF-2024-003', business: 'TechStart', expected: 30000, received: 0, status: 'pending', date: '2024-03-12' },
  ];

  const columns = [
    { key: 'reference', header: 'Reference' },
    { key: 'business', header: 'Business', sortable: true },
    { key: 'expected', header: 'Expected', render: (row: typeof records[0]) => `₦${row.expected.toLocaleString()}` },
    { key: 'received', header: 'Received', render: (row: typeof records[0]) => `₦${row.received.toLocaleString()}` },
    { key: 'diff', header: 'Difference', render: (row: typeof records[0]) => {
      const diff = row.received - row.expected;
      return diff === 0 ? '—' : <span className="text-red-600">₦{Math.abs(diff).toLocaleString()}</span>;
    }},
    { key: 'status', header: 'Status', render: (row: typeof records[0]) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Reconciliation"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Reconciliation' }]}
        actions={<button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Run Reconciliation</button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>
      <DataTable columns={columns} data={records} rowKey={(r) => r.id} />
    </div>
  );
}
