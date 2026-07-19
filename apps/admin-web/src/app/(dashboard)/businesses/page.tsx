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
import type { Business } from '@/types';

/**
 * PG-ADM-030: Business List
 * Searchable, filterable table of registered businesses.
 */
export default function BusinessesPage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const businesses: Business[] = [
    { id: 'b1', name: 'Acme Corp', contactEmail: 'biz@acme.com', contactPhone: '+234801234567', status: 'active', industry: 'FMCG', totalCampaigns: 5, totalSpend: 250000, joinedAt: '2024-01-10' },
    { id: 'b2', name: 'Fresh Foods Ltd', contactEmail: 'info@freshfoods.com', contactPhone: '+234802345678', status: 'active', industry: 'Food & Beverage', totalCampaigns: 3, totalSpend: 180000, joinedAt: '2024-02-05' },
    { id: 'b3', name: 'TechStart Inc', contactEmail: 'hello@techstart.io', contactPhone: '+234803456789', status: 'pending', industry: 'Technology', totalCampaigns: 0, totalSpend: 0, joinedAt: '2024-03-12' },
  ];

  const columns = [
    { key: 'name', header: 'Business Name', sortable: true },
    { key: 'industry', header: 'Industry', sortable: true },
    { key: 'status', header: 'Status', render: (row: Business) => <StatusBadge status={row.status} /> },
    { key: 'totalCampaigns', header: 'Campaigns', sortable: true },
    { key: 'totalSpend', header: 'Total Spend', sortable: true, render: (row: Business) => `₦${row.totalSpend.toLocaleString()}` },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search businesses...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Suspended', value: 'suspended' },
    ]},
    { key: 'industry', label: 'Industry', type: 'select' as const, options: [
      { label: 'FMCG', value: 'fmcg' },
      { label: 'Technology', value: 'technology' },
      { label: 'Food & Beverage', value: 'food' },
    ]},
  ];

  return (
    <div>
      <PageHeader
        title="Businesses"
        breadcrumbs={[{ label: 'Businesses' }]}
        subtitle={`${businesses.length} registered businesses`}
      />

      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={businesses} rowKey={(b) => b.id} onRowClick={(b) => router.push(`/businesses/${b.id}`)} />
      <TablePagination page={page} pageSize={25} total={businesses.length} onPageChange={setPage} />
    </div>
  );
}
