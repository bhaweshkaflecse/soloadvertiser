'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { TablePagination } from '@/components/data-table/table-pagination';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

interface Center {
  id: string;
  name: string;
  type: string;
  address: string;
  supportedChannels: string[];
  capacityPerHour: number;
  status: string;
}

/**
 * PG-ADM-085: Distribution Centers
 * Manage collection points, installation centers, and coordination hubs.
 */
export default function DistributionPage() {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  const centers: Center[] = [
    { id: 'dc1', name: 'Kathmandu Main Hub', type: 'coordination_hub', address: 'Thamel, Kathmandu', supportedChannels: ['helmet_advertising', 'taxi_exterior'], capacityPerHour: 20, status: 'active' },
    { id: 'dc2', name: 'Pokhara Collection Point', type: 'collection_point', address: 'Lakeside, Pokhara', supportedChannels: ['helmet_advertising'], capacityPerHour: 10, status: 'active' },
    { id: 'dc3', name: 'Bharatpur Install Center', type: 'installation_center', address: 'Narayanghat, Bharatpur', supportedChannels: ['bus_exterior', 'taxi_exterior'], capacityPerHour: 5, status: 'temporarily_closed' },
  ];

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { collection_point: 'Collection', installation_center: 'Installation', coordination_hub: 'Hub' };
    return map[t] || t;
  };

  const columns = [
    { key: 'name', header: 'Center Name', sortable: true },
    { key: 'type', header: 'Type', render: (r: Center) => typeLabel(r.type) },
    { key: 'address', header: 'Location' },
    { key: 'supportedChannels', header: 'Channels', render: (r: Center) => r.supportedChannels.length.toString() },
    { key: 'capacityPerHour', header: 'Capacity/hr', sortable: true },
    { key: 'status', header: 'Status', render: (r: Center) => <StatusBadge status={r.status} /> },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search...', type: 'search' as const },
    { key: 'type', label: 'Type', type: 'select' as const, options: [
      { label: 'Collection Point', value: 'collection_point' },
      { label: 'Installation Center', value: 'installation_center' },
      { label: 'Coordination Hub', value: 'coordination_hub' },
    ]},
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Active', value: 'active' },
      { label: 'Temporarily Closed', value: 'temporarily_closed' },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Distribution Centers" breadcrumbs={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Distribution' }]} subtitle={`${centers.length} centers`} />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={centers} rowKey={(c) => c.id} />
      <TablePagination page={page} pageSize={25} total={centers.length} onPageChange={setPage} />
    </div>
  );
}
