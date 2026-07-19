'use client';

import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-084: Readiness Dashboard
 * Visual readiness gauges for all channels, recommendations for launch.
 */
export default function ReadinessPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission." icon="🚫" />;
  }

  const channels = [
    { code: 'taxi_exterior', name: 'Taxi Exterior', composite: 35.2, recommended: false, supply: 26.7, demand: 36, coverage: 66.7 },
    { code: 'influencer', name: 'Influencer Marketing', composite: 52.1, recommended: false, supply: 60, demand: 52, coverage: 33.3 },
    { code: 'bus_exterior', name: 'Bus Exterior', composite: 12.4, recommended: false, supply: 6.7, demand: 12, coverage: 33.3 },
    { code: 'delivery_jacket', name: 'Delivery Jacket', composite: 8.5, recommended: false, supply: 3.3, demand: 8, coverage: 33.3 },
    { code: 'youtube', name: 'YouTube Ads', composite: 45.0, recommended: false, supply: 55, demand: 40, coverage: 100 },
  ];

  return (
    <div>
      <PageHeader
        title="Readiness Dashboard"
        breadcrumbs={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Readiness' }]}
        subtitle="Channel launch readiness scores and recommendations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch) => (
          <div key={ch.code} className="bg-white p-5 rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-sm">{ch.name}</h3>
              {ch.recommended && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Recommended</span>
              )}
            </div>

            {/* Circular gauge representation */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke={ch.composite >= 80 ? '#10b981' : ch.composite >= 50 ? '#f59e0b' : '#3b82f6'}
                    strokeWidth="3" strokeDasharray={`${ch.composite}, 100`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{ch.composite.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between"><span>Supply</span><span>{ch.supply.toFixed(0)}%</span></div>
              <div className="flex justify-between"><span>Demand</span><span>{ch.demand.toFixed(0)}%</span></div>
              <div className="flex justify-between"><span>Coverage</span><span>{ch.coverage.toFixed(0)}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
