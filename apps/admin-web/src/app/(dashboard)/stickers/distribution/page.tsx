'use client';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-062: Distribution Tracking
 * Track sticker distribution to riders and pickup points.
 */
export default function DistributionPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const distributions = [
    { id: 'd1', riderName: 'John Doe', campaign: 'Summer Promo', quantity: 1, status: 'completed', distributedAt: '2024-03-05', appliedAt: '2024-03-06' },
    { id: 'd2', riderName: 'Jane Smith', campaign: 'Summer Promo', quantity: 1, status: 'pending', distributedAt: '2024-03-10', appliedAt: null },
    { id: 'd3', riderName: 'Mike Johnson', campaign: 'Q1 Awareness', quantity: 1, status: 'completed', distributedAt: '2024-01-20', appliedAt: '2024-01-22' },
  ];

  const columns = [
    { key: 'riderName', header: 'Rider', sortable: true },
    { key: 'campaign', header: 'Campaign', sortable: true },
    { key: 'status', header: 'Status', render: (row: typeof distributions[0]) => <StatusBadge status={row.status} /> },
    { key: 'distributedAt', header: 'Distributed', sortable: true },
    { key: 'appliedAt', header: 'Applied', render: (row: typeof distributions[0]) => row.appliedAt || '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Distribution Tracking"
        breadcrumbs={[{ label: 'Stickers', href: '/stickers' }, { label: 'Distribution' }]}
      />
      <DataTable columns={columns} data={distributions} rowKey={(d) => d.id} />
    </div>
  );
}
