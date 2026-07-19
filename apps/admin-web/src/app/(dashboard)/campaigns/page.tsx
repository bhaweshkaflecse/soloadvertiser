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
import type { Campaign } from '@/types';

/**
 * PG-ADM-040: Campaign List
 * All campaigns with status, budget, and assignment progress.
 */
export default function CampaignsPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const campaigns: Campaign[] = [
    { id: 'c1', businessId: 'b1', businessName: 'Acme Corp', name: 'Summer Promo', status: 'active', budget: 100000, startDate: '2024-03-01', endDate: '2024-06-30', ridersAssigned: 15, ridersRequired: 20, zones: ['Lagos Mainland'] },
    { id: 'c2', businessId: 'b2', businessName: 'Fresh Foods', name: 'New Product Launch', status: 'pending', budget: 75000, startDate: '2024-04-01', endDate: '2024-05-31', ridersAssigned: 0, ridersRequired: 10, zones: ['Lagos Island', 'VI'] },
    { id: 'c3', businessId: 'b1', businessName: 'Acme Corp', name: 'Q1 Brand Awareness', status: 'completed', budget: 150000, startDate: '2024-01-01', endDate: '2024-03-31', ridersAssigned: 25, ridersRequired: 25, zones: ['Ikeja'] },
  ];

  const columns = [
    { key: 'name', header: 'Campaign', sortable: true },
    { key: 'businessName', header: 'Business', sortable: true },
    { key: 'status', header: 'Status', render: (row: Campaign) => <StatusBadge status={row.status} /> },
    { key: 'budget', header: 'Budget', sortable: true, render: (row: Campaign) => `₦${row.budget.toLocaleString()}` },
    { key: 'progress', header: 'Riders', render: (row: Campaign) => `${row.ridersAssigned}/${row.ridersRequired}` },
    { key: 'endDate', header: 'End Date', sortable: true },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search campaigns...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Completed', value: 'completed' },
      { label: 'Draft', value: 'draft' },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Campaigns" breadcrumbs={[{ label: 'Campaigns' }]} subtitle={`${campaigns.length} campaigns`} />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={campaigns} rowKey={(c) => c.id} onRowClick={(c) => router.push(`/campaigns/${c.id}`)} />
      <TablePagination page={page} pageSize={25} total={campaigns.length} onPageChange={setPage} />
    </div>
  );
}
