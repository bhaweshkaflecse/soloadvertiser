'use client';

import { PageHeader } from '@/components/layout/page-header';
import { KPICard } from '@/components/dashboard/kpi-card';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { StickerInventory } from '@/types';

/**
 * PG-ADM-060: Sticker Inventory Overview
 * Summary of sticker stock levels by campaign.
 */
export default function StickersPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const kpis = [
    { label: 'Total Ordered', value: '5,200', icon: '📋' },
    { label: 'Total Printed', value: '4,800', icon: '🖨️' },
    { label: 'Distributed', value: '3,500', icon: '📦' },
    { label: 'Applied', value: '3,200', icon: '✅' },
  ];

  const inventory: StickerInventory[] = [
    { id: 's1', campaignId: 'c1', campaignName: 'Summer Promo', totalOrdered: 200, totalPrinted: 200, totalDistributed: 150, totalApplied: 140 },
    { id: 's2', campaignId: 'c2', campaignName: 'New Product Launch', totalOrdered: 100, totalPrinted: 80, totalDistributed: 0, totalApplied: 0 },
    { id: 's3', campaignId: 'c3', campaignName: 'Q1 Awareness', totalOrdered: 250, totalPrinted: 250, totalDistributed: 250, totalApplied: 248 },
  ];

  const columns = [
    { key: 'campaignName', header: 'Campaign', sortable: true },
    { key: 'totalOrdered', header: 'Ordered', sortable: true },
    { key: 'totalPrinted', header: 'Printed', sortable: true },
    { key: 'totalDistributed', header: 'Distributed', sortable: true },
    { key: 'totalApplied', header: 'Applied', sortable: true },
    { key: 'utilization', header: 'Utilization', render: (row: StickerInventory) => (
      <span className="font-medium">{Math.round((row.totalApplied / row.totalOrdered) * 100)}%</span>
    )},
  ];

  return (
    <div>
      <PageHeader title="Sticker Inventory" breadcrumbs={[{ label: 'Stickers' }]} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>
      <DataTable columns={columns} data={inventory} rowKey={(s) => s.id} />
    </div>
  );
}
