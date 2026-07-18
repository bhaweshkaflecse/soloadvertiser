'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { TablePagination } from '@/components/data-table/table-pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/utils';
import type { AuditLogEntry } from '@/types';

/**
 * PG-ADM-130: Audit Log Viewer
 * Searchable log of all administrative actions.
 */
export default function AuditPage() {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="Admin access required." icon="🔒" />;
  }

  const logs: AuditLogEntry[] = [
    { id: '1', action: 'rider.approved', actor: 'Sarah K.', actorRole: 'admin', target: 'Rider #123', targetType: 'rider', timestamp: '2024-03-14T14:30:00Z' },
    { id: '2', action: 'payment.verified', actor: 'Lisa M.', actorRole: 'finance', target: 'Payment TRF-001', targetType: 'payment', timestamp: '2024-03-14T14:15:00Z' },
    { id: '3', action: 'campaign.created', actor: 'Mike R.', actorRole: 'ops', target: 'Campaign "Summer Promo"', targetType: 'campaign', timestamp: '2024-03-14T13:00:00Z' },
    { id: '4', action: 'settings.updated', actor: 'Admin', actorRole: 'super_admin', target: 'min_payout: 5000 → 4000', targetType: 'settings', timestamp: '2024-03-14T12:00:00Z' },
    { id: '5', action: 'staff.deactivated', actor: 'Admin', actorRole: 'super_admin', target: 'Ex Staff', targetType: 'staff', timestamp: '2024-03-13T16:00:00Z' },
  ];

  const columns = [
    { key: 'timestamp', header: 'Time', sortable: true, render: (row: AuditLogEntry) => formatDateTime(row.timestamp) },
    { key: 'action', header: 'Action', sortable: true, render: (row: AuditLogEntry) => (
      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{row.action}</code>
    )},
    { key: 'actor', header: 'Actor', sortable: true },
    { key: 'actorRole', header: 'Role', render: (row: AuditLogEntry) => (
      <span className="text-xs capitalize">{row.actorRole.replace('_', ' ')}</span>
    )},
    { key: 'target', header: 'Target' },
    { key: 'targetType', header: 'Type', render: (row: AuditLogEntry) => (
      <span className="text-xs text-gray-500 capitalize">{row.targetType}</span>
    )},
  ];

  const filterConfig = [
    { key: 'search', label: 'Search logs...', type: 'search' as const },
    { key: 'action', label: 'Action Type', type: 'select' as const, options: [
      { label: 'Rider Actions', value: 'rider' },
      { label: 'Payment Actions', value: 'payment' },
      { label: 'Campaign Actions', value: 'campaign' },
      { label: 'Settings Changes', value: 'settings' },
    ]},
    { key: 'dateFrom', label: 'From', type: 'date' as const },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        breadcrumbs={[{ label: 'Audit Logs' }]}
        subtitle="Complete record of all administrative actions"
        actions={<button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Export</button>}
      />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={logs} rowKey={(l) => l.id} />
      <TablePagination page={page} pageSize={50} total={logs.length} onPageChange={setPage} />
    </div>
  );
}
