// Solo Advertiser — Business Portal
// PG-BIZ-020: Dashboard
// KPI cards (Active Campaigns, Spend, Fulfillment) + campaign cards with capacity meters

'use client';

import { useApi } from '@/hooks/use-api';
import type { DashboardKPI, Campaign } from '@/types';
import { formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/layout/page-header';
import CampaignCard from '@/components/campaign/campaign-card';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useApi<DashboardKPI>('/dashboard/kpis');
  const { data: campaigns, isLoading: campaignsLoading } = useApi<Campaign[]>('/campaigns?status=active&limit=4');

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your campaign performance"
        actions={
          <a href="/campaigns/new"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 text-sm">
            + New Campaign
          </a>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <KPICard
              label="Active Campaigns"
              value={String(kpis?.activeCampaigns ?? 0)}
              icon="campaign"
              color="blue"
            />
            <KPICard
              label="Total Spend"
              value={formatCurrency(kpis?.totalSpend ?? 0)}
              icon="money"
              color="green"
            />
            <KPICard
              label="Avg. Fulfillment"
              value={`${kpis?.averageFulfillment ?? 0}%`}
              icon="chart"
              color="amber"
            />
            <KPICard
              label="Total Riders"
              value={String(kpis?.totalRiders ?? 0)}
              icon="riders"
              color="purple"
            />
          </>
        )}
      </div>

      {/* Active Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Active Campaigns</h2>
          <a href="/campaigns" className="text-sm text-blue-600 hover:underline">View all</a>
        </div>

        {campaignsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border">
            <p className="text-gray-500">No active campaigns yet.</p>
            <a href="/campaigns/new" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Create your first campaign
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card Component ─────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function KPICard({ label, value, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    amber: 'bg-amber-50 border-amber-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
