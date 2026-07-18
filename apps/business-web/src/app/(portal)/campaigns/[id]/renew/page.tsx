// Solo Advertiser — Business Portal
// PG-BIZ-033: Campaign Renewal Page
// Extend an existing campaign with new duration and budget

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import type { Campaign } from '@/types';
import { formatCurrency } from '@/lib/utils';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

interface RenewPageProps {
  params: { id: string };
}

export default function CampaignRenewPage({ params }: RenewPageProps) {
  const router = useRouter();
  const { data: campaign, isLoading } = useApi<Campaign>(`/campaigns/${params.id}`);
  const [additionalDays, setAdditionalDays] = useState(30);

  if (isLoading) return <LoadingSkeleton className="h-64" />;
  if (!campaign) return <div>Campaign not found</div>;

  const renewalCost = campaign.targetRiders * additionalDays * campaign.dailyRatePerRider;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Renew Campaign</h1>
      <p className="text-gray-600 mb-6">Extend &quot;{campaign.name}&quot; with additional days.</p>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Renewal Details</h3>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Duration</p>
            <p className="font-medium">{campaign.durationDays} days</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Days</label>
            <input
              type="number"
              min={7}
              max={365}
              value={additionalDays}
              onChange={(e) => setAdditionalDays(parseInt(e.target.value) || 7)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between">
              <span>Riders</span>
              <span>{campaign.targetRiders}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Daily rate</span>
              <span>{formatCurrency(campaign.dailyRatePerRider)}/rider</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Additional days</span>
              <span>{additionalDays}</span>
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-blue-200">
              <span className="font-semibold">Renewal Cost</span>
              <span className="font-bold text-blue-800">{formatCurrency(renewalCost)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-md">Cancel</button>
          <button onClick={() => router.push(`/campaigns/${params.id}`)}
            className="px-6 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
            Confirm Renewal
          </button>
        </div>
      </div>
    </div>
  );
}
