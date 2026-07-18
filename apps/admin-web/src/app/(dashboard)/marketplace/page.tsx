'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

interface Channel {
  id: string;
  code: string;
  name: string;
  superCategory: string;
  subCategory: string;
  maturityStage: string;
  readinessPct: number;
  preOrderCount: number;
  partnerCount: number;
  isPaused: boolean;
}

/**
 * PG-ADM-080: Marketplace Overview
 * Channel list with readiness gauges and maturity stage indicators.
 */
export default function MarketplacePage() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});

  if (!hasRole(['admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  const channels: Channel[] = [
    { id: 'ch1', code: 'helmet_advertising', name: 'Helmet Advertising', superCategory: 'physical', subCategory: 'helmet', maturityStage: 'CMM_005_LIVE', readinessPct: 100, preOrderCount: 0, partnerCount: 150, isPaused: false },
    { id: 'ch2', code: 'taxi_exterior', name: 'Taxi Exterior', superCategory: 'physical', subCategory: 'taxi_exterior', maturityStage: 'CMM_002_PRE_ORDER_OPEN', readinessPct: 35, preOrderCount: 18, partnerCount: 8, isPaused: false },
    { id: 'ch3', code: 'influencer', name: 'Influencer Marketing', superCategory: 'digital', subCategory: 'influencer', maturityStage: 'CMM_002_PRE_ORDER_OPEN', readinessPct: 52, preOrderCount: 26, partnerCount: 45, isPaused: false },
    { id: 'ch4', code: 'bus_exterior', name: 'Bus Exterior', superCategory: 'physical', subCategory: 'bus_exterior', maturityStage: 'CMM_002_PRE_ORDER_OPEN', readinessPct: 12, preOrderCount: 6, partnerCount: 2, isPaused: false },
  ];

  const stageLabel = (stage: string) => {
    const map: Record<string, string> = {
      CMM_001_MARKET_RESEARCH: 'Research',
      CMM_002_PRE_ORDER_OPEN: 'Pre-Order',
      CMM_003_PRE_ENROLLMENT_OPEN: 'Enrollment',
      CMM_004_PILOT_PROGRAM: 'Pilot',
      CMM_005_LIVE: 'Live',
      CMM_006_SCALING: 'Scaling',
      CMM_007_NATIONAL: 'National',
      CMM_008_INTERNATIONAL: 'International',
    };
    return map[stage] || stage;
  };

  const columns = [
    { key: 'name', header: 'Channel', sortable: true },
    { key: 'superCategory', header: 'Type', render: (r: Channel) => r.superCategory === 'physical' ? '🏍️ Physical' : '💻 Digital' },
    { key: 'maturityStage', header: 'Stage', render: (r: Channel) => <StatusBadge status={stageLabel(r.maturityStage)} /> },
    { key: 'readinessPct', header: 'Readiness', render: (r: Channel) => (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${r.readinessPct}%` }} />
        </div>
        <span className="text-sm text-gray-600">{r.readinessPct}%</span>
      </div>
    )},
    { key: 'preOrderCount', header: 'Pre-Orders', sortable: true },
    { key: 'partnerCount', header: 'Partners', sortable: true },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search channels...', type: 'search' as const },
    { key: 'superCategory', label: 'Type', type: 'select' as const, options: [
      { label: 'Physical', value: 'physical' },
      { label: 'Digital', value: 'digital' },
    ]},
    { key: 'maturityStage', label: 'Stage', type: 'select' as const, options: [
      { label: 'Pre-Order', value: 'CMM_002_PRE_ORDER_OPEN' },
      { label: 'Live', value: 'CMM_005_LIVE' },
      { label: 'Pilot', value: 'CMM_004_PILOT_PROGRAM' },
    ]},
  ];

  return (
    <div>
      <PageHeader
        title="Marketplace"
        breadcrumbs={[{ label: 'Marketplace' }]}
        subtitle={`${channels.length} advertising channels`}
      />
      <TableFilters
        filters={filterConfig}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClear={() => setFilters({})}
      />
      <DataTable
        columns={columns}
        data={channels}
        rowKey={(c) => c.id}
        onRowClick={(c) => router.push(`/marketplace/channels/${c.id}`)}
      />
    </div>
  );
}
