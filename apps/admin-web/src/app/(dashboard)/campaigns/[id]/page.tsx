'use client';

import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/entity/status-badge';
import { TimelineView } from '@/components/entity/timeline-view';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-041: Campaign Detail
 * Campaign overview with assigned riders, progress, and financials.
 */
export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const campaign = {
    id: params.id,
    name: 'Summer Promo',
    businessName: 'Acme Corp',
    status: 'active' as const,
    budget: 100000,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    ridersAssigned: 15,
    ridersRequired: 20,
    zones: ['Lagos Mainland', 'Ikeja'],
    stickerDesign: 'summer-promo-v2.png',
    dailyBudget: 2500,
  };

  const timeline = [
    { id: '1', action: 'rider #15 assigned', actor: 'Mike R.', timestamp: '2024-03-15T10:00:00Z' },
    { id: '2', action: 'stickers printed (batch #3)', actor: 'System', timestamp: '2024-03-10T14:00:00Z' },
    { id: '3', action: 'campaign activated', actor: 'Admin', timestamp: '2024-03-01T09:00:00Z' },
  ];

  return (
    <div>
      <PageHeader
        title={campaign.name}
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: campaign.name }]}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Pause</button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Assign Riders</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign overview */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Overview</h2>
              <StatusBadge status={campaign.status} size="md" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-xs text-gray-500">Business</p><p className="text-sm">{campaign.businessName}</p></div>
              <div><p className="text-xs text-gray-500">Budget</p><p className="text-sm font-medium">₦{campaign.budget.toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500">Daily Budget</p><p className="text-sm">₦{campaign.dailyBudget.toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-500">Start Date</p><p className="text-sm">{campaign.startDate}</p></div>
              <div><p className="text-xs text-gray-500">End Date</p><p className="text-sm">{campaign.endDate}</p></div>
              <div><p className="text-xs text-gray-500">Zones</p><p className="text-sm">{campaign.zones.join(', ')}</p></div>
            </div>
          </div>

          {/* Rider progress */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Rider Assignments</h2>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold">{campaign.ridersAssigned}/{campaign.ridersRequired}</span>
              <span className="text-sm text-gray-500">riders assigned</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${(campaign.ridersAssigned / campaign.ridersRequired) * 100}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <TimelineView events={timeline} />
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 mb-1">Completion</p>
            <p className="text-2xl font-bold">75%</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 mb-1">Impressions (est.)</p>
            <p className="text-2xl font-bold">45,200</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 mb-1">Days Remaining</p>
            <p className="text-2xl font-bold">87</p>
          </div>
        </div>
      </div>
    </div>
  );
}
