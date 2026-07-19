'use client';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-061: Print Orders
 * Track sticker print orders and their fulfillment status.
 */
export default function PrintOrdersPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const orders = [
    { id: 'po1', campaign: 'Summer Promo', quantity: 100, vendor: 'PrintCo', status: 'completed', orderedAt: '2024-02-20', completedAt: '2024-02-25' },
    { id: 'po2', campaign: 'New Product Launch', quantity: 80, vendor: 'PrintCo', status: 'processing', orderedAt: '2024-03-10', completedAt: null },
    { id: 'po3', campaign: 'Summer Promo', quantity: 100, vendor: 'QuickPrint', status: 'pending', orderedAt: '2024-03-12', completedAt: null },
  ];

  const columns = [
    { key: 'campaign', header: 'Campaign', sortable: true },
    { key: 'quantity', header: 'Quantity', sortable: true },
    { key: 'vendor', header: 'Vendor' },
    { key: 'status', header: 'Status', render: (row: typeof orders[0]) => <StatusBadge status={row.status} /> },
    { key: 'orderedAt', header: 'Ordered', sortable: true },
    { key: 'completedAt', header: 'Completed', render: (row: typeof orders[0]) => row.completedAt || '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Print Orders"
        breadcrumbs={[{ label: 'Stickers', href: '/stickers' }, { label: 'Print Orders' }]}
        actions={<button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">New Order</button>}
      />
      <DataTable columns={columns} data={orders} rowKey={(o) => o.id} />
    </div>
  );
}
