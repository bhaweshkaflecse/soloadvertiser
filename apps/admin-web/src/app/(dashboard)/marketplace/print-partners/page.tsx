'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { TablePagination } from '@/components/data-table/table-pagination';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

interface PrintPartner {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  capabilities: string[];
  maxDailyCapacity: number;
  qualityRating: number;
  status: string;
}

/**
 * PG-ADM-086: Print Partners
 * Manage print partners for physical advertising material production.
 */
export default function PrintPartnersPage() {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  const partners: PrintPartner[] = [
    { id: 'pp1', name: 'Nepal Print House', contactPerson: 'Rajesh K.', phone: '+977-1-4500123', capabilities: ['vinyl_wrap', 'sticker_printing', 'helmet_sticker'], maxDailyCapacity: 100, qualityRating: 4.5, status: 'active' },
    { id: 'pp2', name: 'Digital Graphics Pvt.', contactPerson: 'Suman T.', phone: '+977-1-4600456', capabilities: ['large_format', 'banner_printing', 'vehicle_wrap'], maxDailyCapacity: 50, qualityRating: 4.2, status: 'active' },
    { id: 'pp3', name: 'Quick Print Pokhara', contactPerson: 'Maya G.', phone: '+977-61-555789', capabilities: ['sticker_printing', 'fabric_printing'], maxDailyCapacity: 30, qualityRating: 3.8, status: 'suspended' },
  ];

  const columns = [
    { key: 'name', header: 'Partner', sortable: true },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'phone', header: 'Phone' },
    { key: 'capabilities', header: 'Capabilities', render: (r: PrintPartner) => r.capabilities.slice(0, 2).join(', ') + (r.capabilities.length > 2 ? ` +${r.capabilities.length - 2}` : '') },
    { key: 'maxDailyCapacity', header: 'Daily Cap.', sortable: true },
    { key: 'qualityRating', header: 'Rating', sortable: true, render: (r: PrintPartner) => `⭐ ${r.qualityRating.toFixed(1)}` },
    { key: 'status', header: 'Status', render: (r: PrintPartner) => <StatusBadge status={r.status} /> },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Active', value: 'active' },
      { label: 'Suspended', value: 'suspended' },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Print Partners" breadcrumbs={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Print Partners' }]} subtitle={`${partners.length} print partners`} />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={partners} rowKey={(p) => p.id} />
      <TablePagination page={page} pageSize={25} total={partners.length} onPageChange={setPage} />
    </div>
  );
}
