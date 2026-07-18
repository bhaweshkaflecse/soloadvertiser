'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { TablePagination } from '@/components/data-table/table-pagination';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { Rider } from '@/types';

/**
 * PG-ADM-020: Rider List
 * Data table with filters (status, zone, score) + search + pagination.
 */
export default function RidersPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  // Placeholder data
  const riders: Rider[] = [
    { id: 'r1', name: 'John Doe', email: 'john@example.com', phone: '+234801234567', status: 'active', zone: 'Lagos Mainland', score: 92, joinedAt: '2024-01-15', totalEarnings: 45000, activeCampaigns: 2 },
    { id: 'r2', name: 'Jane Smith', email: 'jane@example.com', phone: '+234802345678', status: 'active', zone: 'Lagos Island', score: 88, joinedAt: '2024-02-01', totalEarnings: 38000, activeCampaigns: 1 },
    { id: 'r3', name: 'Bob Wilson', email: 'bob@example.com', phone: '+234803456789', status: 'pending', zone: 'Ikeja', score: 0, joinedAt: '2024-03-10', totalEarnings: 0, activeCampaigns: 0 },
    { id: 'r4', name: 'Alice Brown', email: 'alice@example.com', phone: '+234804567890', status: 'suspended', zone: 'VI', score: 65, joinedAt: '2023-11-20', totalEarnings: 28000, activeCampaigns: 0 },
  ];

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'zone', header: 'Zone', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (row: Rider) => <StatusBadge status={row.status} /> },
    { key: 'score', header: 'Score', sortable: true, render: (row: Rider) => <span className="font-medium">{row.score}</span> },
    { key: 'activeCampaigns', header: 'Campaigns', sortable: true },
    { key: 'totalEarnings', header: 'Earnings', sortable: true, render: (row: Rider) => `₦${row.totalEarnings.toLocaleString()}` },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search riders...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Suspended', value: 'suspended' },
      { label: 'Deactivated', value: 'deactivated' },
    ]},
    { key: 'zone', label: 'Zone', type: 'select' as const, options: [
      { label: 'Lagos Mainland', value: 'lagos-mainland' },
      { label: 'Lagos Island', value: 'lagos-island' },
      { label: 'Ikeja', value: 'ikeja' },
      { label: 'VI', value: 'vi' },
    ]},
  ];

  return (
    <div>
      <PageHeader
        title="Riders"
        breadcrumbs={[{ label: 'Riders' }]}
        subtitle={`${riders.length} total riders`}
        actions={
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export CSV
          </button>
        }
      />

      <TableFilters
        filters={filterConfig}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={() => setFilters({})}
      />

      <DataTable
        columns={columns}
        data={riders}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/riders/${r.id}`)}
      />

      <TablePagination
        page={page}
        pageSize={25}
        total={riders.length}
        onPageChange={setPage}
      />
    </div>
  );
}
