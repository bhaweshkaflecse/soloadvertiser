'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/entity/status-badge';
import { useAuth } from '@/hooks/use-auth';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * PG-ADM-081: Channel Detail + Configure
 * Shows channel maturity, readiness breakdown, threshold config, and lifecycle actions.
 */
export default function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'thresholds' | 'config'>('overview');

  if (!hasRole(['admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  // Mock data for channel detail
  const channel = {
    id,
    code: 'taxi_exterior',
    name: 'Taxi Exterior Advertising',
    superCategory: 'physical',
    subCategory: 'taxi_exterior',
    maturityStage: 'CMM_002_PRE_ORDER_OPEN',
    isPaused: false,
    isRetired: false,
    estimatedReach: 50000,
    readiness: {
      supply: { count: 8, pct: 26.7 },
      demand: { count: 18, pct: 36 },
      coverage: { cities: 2, pct: 66.7 },
      operational: { pct: 50 },
      infrastructure: { pct: 0 },
      composite: 35.2,
    },
    threshold: {
      minBusinessInterest: 50,
      minPartnerEnrollment: 30,
      minCitiesCovered: 3,
      minTotalBudget: 500000,
    },
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'thresholds' as const, label: 'Thresholds' },
    { id: 'config' as const, label: 'Configuration' },
  ];

  return (
    <div>
      <PageHeader
        title={channel.name}
        breadcrumbs={[
          { label: 'Marketplace', href: '/marketplace' },
          { label: channel.name },
        ]}
        subtitle={`${channel.superCategory} — ${channel.subCategory}`}
      />

      {/* Maturity Stage + Actions */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-4">
          <StatusBadge status={channel.maturityStage} />
          {channel.isPaused && <span className="text-yellow-600 text-sm font-medium">⏸️ Paused</span>}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Pause</button>
          <button className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Advance Stage</button>
          <button className="px-3 py-1.5 text-sm bg-red-50 border-red-200 border text-red-700 rounded hover:bg-red-100">Retire</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Readiness Breakdown */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Readiness Score</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">{channel.readiness.composite.toFixed(1)}%</div>
            <div className="space-y-3">
              {[
                { label: 'Supply (Partners)', pct: channel.readiness.supply.pct, weight: '30%' },
                { label: 'Demand (Pre-orders)', pct: channel.readiness.demand.pct, weight: '25%' },
                { label: 'Coverage (Cities)', pct: channel.readiness.coverage.pct, weight: '20%' },
                { label: 'Operational', pct: channel.readiness.operational.pct, weight: '15%' },
                { label: 'Infrastructure', pct: channel.readiness.infrastructure.pct, weight: '10%' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="text-gray-500">{item.pct.toFixed(1)}% (×{item.weight})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(item.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-sm text-gray-600">Pre-Orders</div>
                <div className="text-2xl font-bold">{channel.readiness.demand.count}</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-sm text-gray-600">Partners</div>
                <div className="text-2xl font-bold">{channel.readiness.supply.count}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="text-sm text-gray-600">Cities</div>
                <div className="text-2xl font-bold">{channel.readiness.coverage.cities}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <div className="text-sm text-gray-600">Est. Reach</div>
                <div className="text-2xl font-bold">{(channel.estimatedReach / 1000).toFixed(0)}K</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds Tab */}
      {activeTab === 'thresholds' && (
        <div className="bg-white p-6 rounded-lg border max-w-lg">
          <h3 className="font-semibold mb-4">Launch Thresholds</h3>
          <div className="space-y-4">
            {[
              { label: 'Min Business Interest', value: channel.threshold.minBusinessInterest },
              { label: 'Min Partner Enrollment', value: channel.threshold.minPartnerEnrollment },
              { label: 'Min Cities Covered', value: channel.threshold.minCitiesCovered },
              { label: 'Min Total Budget (NPR)', value: channel.threshold.minTotalBudget.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Channel Configuration</h3>
          <p className="text-gray-500 text-sm">Channel-specific plugin configuration (JSON editor placeholder).</p>
          <div className="mt-4 p-4 bg-gray-50 rounded font-mono text-sm">
            {JSON.stringify({ partnerCategory: 'PC-002', assetSpecs: { width: 60, height: 40, unit: 'cm' } }, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
