// Solo Advertiser — Business Portal
// PG-BIZ-030: Campaign List Page
// Shows all campaigns with filter tabs (All, Active, Draft, Completed)

'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import type { Campaign, CampaignStatus } from '@/types';
import PageHeader from '@/components/layout/page-header';
import CampaignCard from '@/components/campaign/campaign-card';
import LoadingSkeleton from '@/components/shared/loading-skeleton';
import EmptyState from '@/components/shared/empty-state';

type FilterTab = 'all' | CampaignStatus;

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { data: campaigns, isLoading } = useApi<Campaign[]>('/campaigns');

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending_payment', label: 'Pending Payment' },
    { id: 'draft', label: 'Drafts' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredCampaigns = campaigns?.filter(
    (c) => activeTab === 'all' || c.status === activeTab
  );

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Manage your advertising campaigns"
        actions={
          <a href="/campaigns/new"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 text-sm">
            + New Campaign
          </a>
        }
      />

      {/* Filter tabs */}
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

      {/* Campaign grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No campaigns found"
          description={activeTab === 'all' ? 'Create your first campaign to get started.' : `No ${activeTab} campaigns.`}
          actionLabel="Create Campaign"
          actionHref="/campaigns/new"
        />
      )}
    </div>
  );
}
