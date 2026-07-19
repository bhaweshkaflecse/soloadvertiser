// Solo Advertiser — Business Portal
// PG-BIZ-040: Marketplace Channel Discovery
// Browse available advertising channels with Physical + Digital tabs

'use client';

import { useState } from 'react';
import PageHeader from '@/components/layout/page-header';
import LoadingSkeleton from '@/components/shared/loading-skeleton';
import EmptyState from '@/components/shared/empty-state';

type CategoryTab = 'physical' | 'digital';

interface Channel {
  id: string;
  code: string;
  name: string;
  description: string;
  superCategory: string;
  subCategory: string;
  maturityStage: string;
  estimatedReach: number | null;
  iconEmoji: string;
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>('physical');

  const channels: Channel[] = [
    { id: 'ch1', code: 'helmet_advertising', name: 'Helmet Advertising', description: 'Brand stickers on rider helmets covering major city routes.', superCategory: 'physical', subCategory: 'helmet', maturityStage: 'CMM_005_LIVE', estimatedReach: 100000, iconEmoji: '🪖' },
    { id: 'ch2', code: 'taxi_exterior', name: 'Taxi Exterior', description: 'Full or partial vehicle wraps on taxis for maximum visibility.', superCategory: 'physical', subCategory: 'taxi_exterior', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 50000, iconEmoji: '🚕' },
    { id: 'ch3', code: 'bus_exterior', name: 'Bus Exterior', description: 'Large format ads on public and private buses.', superCategory: 'physical', subCategory: 'bus_exterior', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 200000, iconEmoji: '🚌' },
    { id: 'ch4', code: 'delivery_jacket', name: 'Delivery Jacket', description: 'Branded jackets worn by delivery riders.', superCategory: 'physical', subCategory: 'delivery_jacket', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 30000, iconEmoji: '🧥' },
    { id: 'ch5', code: 'property_hoardings', name: 'Property Hoardings', description: 'Premium billboard-style ads on buildings and rooftops.', superCategory: 'physical', subCategory: 'property_hoardings', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 150000, iconEmoji: '🏢' },
    { id: 'ch6', code: 'influencer', name: 'Influencer Marketing', description: 'Partner with local influencers for authentic brand promotion.', superCategory: 'digital', subCategory: 'influencer', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 75000, iconEmoji: '📱' },
    { id: 'ch7', code: 'youtube', name: 'YouTube Ads', description: 'Sponsored content and pre-roll ads with Nepali YouTubers.', superCategory: 'digital', subCategory: 'youtube', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 120000, iconEmoji: '▶️' },
    { id: 'ch8', code: 'instagram', name: 'Instagram Promotion', description: 'Story ads, reels, and sponsored posts on Instagram.', superCategory: 'digital', subCategory: 'instagram', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 80000, iconEmoji: '📸' },
    { id: 'ch9', code: 'tiktok', name: 'TikTok Campaigns', description: 'Short-form video ads with TikTok creators.', superCategory: 'digital', subCategory: 'tiktok', maturityStage: 'CMM_002_PRE_ORDER_OPEN', estimatedReach: 90000, iconEmoji: '🎵' },
  ];

  const filteredChannels = channels.filter((c) => c.superCategory === activeTab);

  const stageLabel = (stage: string) => {
    if (stage === 'CMM_005_LIVE') return { text: 'Live — Book Now', color: 'bg-green-100 text-green-700' };
    return { text: 'Coming Soon — Pre-Order', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div>
      <PageHeader
        title="Marketplace"
        description="Discover advertising channels and pre-order upcoming opportunities"
      />

      {/* Tab switcher */}
      <div className="flex space-x-1 border-b mb-6">
        <button
          onClick={() => setActiveTab('physical')}
          className={`px-6 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
            ${activeTab === 'physical' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          🏍️ Physical Channels
        </button>
        <button
          onClick={() => setActiveTab('digital')}
          className={`px-6 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
            ${activeTab === 'digital' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          💻 Digital Channels
        </button>
      </div>

      {/* Channel grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel) => {
          const stage = stageLabel(channel.maturityStage);
          const isLive = channel.maturityStage === 'CMM_005_LIVE';
          return (
            <div key={channel.id} className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{channel.iconEmoji}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${stage.color}`}>
                  {stage.text}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{channel.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
              {channel.estimatedReach && (
                <p className="text-xs text-gray-400 mb-4">Est. reach: {(channel.estimatedReach / 1000).toFixed(0)}K people/month</p>
              )}
              <a
                href={isLive ? '/campaigns/new' : `/marketplace/pre-order/${channel.id}`}
                className={`block text-center py-2 rounded-md text-sm font-medium transition-colors
                  ${isLive
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'}`}
              >
                {isLive ? 'Create Campaign' : 'Pre-Order'}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
