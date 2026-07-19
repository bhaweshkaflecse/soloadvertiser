'use client';

import { PageHeader } from '@/components/layout/page-header';
import { KPICard } from '@/components/dashboard/kpi-card';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import type { Assignment } from '@/types';

/**
 * PG-ADM-050: Assignment Dashboard
 * Overview of all campaign-rider assignments with metrics.
 */
export default function AssignmentsDashboardPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const kpis = [
    { label: 'Active Assignments', value: '156', trend: 'up' as const, change: 8 },
    { label: 'Pending Sticker Apply', value: '23', trend: 'neutral' as const },
    { label: 'Completed This Month', value: '42', trend: 'up' as const, change: 15 },
    { label: 'Unassigned Slots', value: '31', trend: 'down' as const, change: -12 },
  ];

  const assignments: Assignment[] = [
    { id: 'a1', campaignId: 'c1', riderId: 'r1', riderName: 'John Doe', campaignName: 'Summer Promo', status: 'active', assignedAt: '2024-03-01', stickerAppliedAt: '2024-03-05' },
    { id: 'a2', campaignId: 'c1', riderId: 'r2', riderName: 'Jane Smith', campaignName: 'Summer Promo', status: 'pending', assignedAt: '2024-03-10' },
    { id: 'a3', campaignId: 'c3', riderId: 'r1', riderName: 'John Doe', campaignName: 'Q1 Awareness', status: 'completed', assignedAt: '2024-01-15', stickerAppliedAt: '2024-01-18' },
  ];

  const columns = [
    { key: 'riderName', header: 'Rider', sortable: true },
    { key: 'campaignName', header: 'Campaign', sortable: true },
    { key: 'status', header: 'Status', render: (row: Assignment) => <StatusBadge status={row.status} /> },
    { key: 'assignedAt', header: 'Assigned', sortable: true },
    { key: 'stickerAppliedAt', header: 'Sticker Applied', render: (row: Assignment) => row.stickerAppliedAt || '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Assignments"
        breadcrumbs={[{ label: 'Assignments' }]}
        actions={
          <Link href="/assignments/new" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            New Assignment
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      <DataTable columns={columns} data={assignments} rowKey={(a) => a.id} />
    </div>
  );
}
