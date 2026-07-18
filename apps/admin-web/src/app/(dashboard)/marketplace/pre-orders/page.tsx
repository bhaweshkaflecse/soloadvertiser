'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { TablePagination } from '@/components/data-table/table-pagination';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

interface PreOrder {
  id: string;
  businessName: string;
  channelName: string;
  estimatedBudget: number;
  preferredCity: string;
  expectedLaunch: string;
  status: string;
  createdAt: string;
}

/**
 * PG-ADM-082: Pre-Order List
 * All business pre-orders across channels.
 */
export default function PreOrdersPage() {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  const preOrders: PreOrder[] = [
    { id: 'po1', businessName: 'Nepal Tea Co.', channelName: 'Taxi Exterior', estimatedBudget: 75000, preferredCity: 'Kathmandu', expectedLaunch: 'Q2 2025', status: 'submitted', createdAt: '2025-01-15' },
    { id: 'po2', businessName: 'Fresh Foods Pvt.', channelName: 'Influencer Marketing', estimatedBudget: 120000, preferredCity: 'Pokhara', expectedLaunch: 'Q3 2025', status: 'acknowledged', createdAt: '2025-01-18' },
    { id: 'po3', businessName: 'TechHub Nepal', channelName: 'Bus Exterior', estimatedBudget: 200000, preferredCity: 'Kathmandu', expectedLaunch: 'Q1 2025', status: 'submitted', createdAt: '2025-01-20' },
  ];

  const columns = [
    { key: 'businessName', header: 'Business', sortable: true },
    { key: 'channelName', header: 'Channel', sortable: true },
    { key: 'estimatedBudget', header: 'Budget', sortable: true, render: (r: PreOrder) => `NPR ${r.estimatedBudget.toLocaleString()}` },
    { key: 'preferredCity', header: 'City' },
    { key: 'expectedLaunch', header: 'Expected Launch' },
    { key: 'status', header: 'Status', render: (r: PreOrder) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Date', sortable: true },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Submitted', value: 'submitted' },
      { label: 'Acknowledged', value: 'acknowledged' },
      { label: 'Scheduled', value: 'scheduled' },
      { label: 'Cancelled', value: 'cancelled' },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Pre-Orders" breadcrumbs={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Pre-Orders' }]} subtitle={`${preOrders.length} pre-orders`} />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={preOrders} rowKey={(r) => r.id} />
      <TablePagination page={page} pageSize={25} total={preOrders.length} onPageChange={setPage} />
    </div>
  );
}
