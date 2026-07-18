'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { TablePagination } from '@/components/data-table/table-pagination';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

interface Enrollment {
  id: string;
  partnerName: string;
  categoryName: string;
  channelName: string;
  locationCity: string;
  status: string;
  createdAt: string;
}

/**
 * PG-ADM-083: Partner Enrollment Queue
 * Admin view of all partner enrollments for review.
 */
export default function EnrollmentsPage() {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  const enrollments: Enrollment[] = [
    { id: 'e1', partnerName: 'Ram Sharma', categoryName: 'Taxi Driver', channelName: 'Taxi Exterior', locationCity: 'Kathmandu', status: 'submitted', createdAt: '2025-01-22' },
    { id: 'e2', partnerName: 'Priya Digital', categoryName: 'Instagram Creator', channelName: 'Influencer Marketing', locationCity: 'Pokhara', status: 'under_review', createdAt: '2025-01-21' },
    { id: 'e3', partnerName: 'Sita Transport', categoryName: 'Bus Operator', channelName: 'Bus Exterior', locationCity: 'Bharatpur', status: 'approved', createdAt: '2025-01-18' },
  ];

  const columns = [
    { key: 'partnerName', header: 'Partner', sortable: true },
    { key: 'categoryName', header: 'Category' },
    { key: 'channelName', header: 'Channel' },
    { key: 'locationCity', header: 'City' },
    { key: 'status', header: 'Status', render: (r: Enrollment) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Date', sortable: true },
    { key: 'actions', header: 'Actions', render: (r: Enrollment) => (
      r.status === 'submitted' || r.status === 'under_review' ? (
        <div className="flex gap-1">
          <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Verify</button>
          <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
        </div>
      ) : null
    )},
  ];

  const filterConfig = [
    { key: 'search', label: 'Search...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Submitted', value: 'submitted' },
      { label: 'Under Review', value: 'under_review' },
      { label: 'Approved', value: 'approved' },
      { label: 'Rejected', value: 'rejected' },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Partner Enrollments" breadcrumbs={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Enrollments' }]} subtitle={`${enrollments.length} enrollments`} />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={enrollments} rowKey={(r) => r.id} />
      <TablePagination page={page} pageSize={25} total={enrollments.length} onPageChange={setPage} />
    </div>
  );
}
