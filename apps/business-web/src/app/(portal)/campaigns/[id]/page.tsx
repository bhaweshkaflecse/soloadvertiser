// Solo Advertiser — Business Portal
// PG-BIZ-032: Campaign Detail Page
// Status card + capacity meter + financial summary + timeline tab

'use client';

import { useApi } from '@/hooks/use-api';
import type { Campaign } from '@/types';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import CapacityMeter from '@/components/campaign/capacity-meter';
import StatusBadge from '@/components/shared/status-badge';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

interface CampaignDetailProps {
  params: { id: string };
}

export default function CampaignDetailPage({ params }: CampaignDetailProps) {
  const { data: campaign, isLoading } = useApi<Campaign>(`/campaigns/${params.id}`);

  if (isLoading) return <LoadingSkeleton className="h-96" />;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-gray-600 mt-1">{campaign.description}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Campaign info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Capacity Meter */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Rider Capacity</h3>
            <CapacityMeter current={campaign.assignedRiders} target={campaign.targetRiders} />
            <p className="text-sm text-gray-500 mt-2">
              {campaign.assignedRiders} of {campaign.targetRiders} riders assigned
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Timeline</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date</span>
                <span className="font-medium">{formatDate(campaign.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date</span>
                <span className="font-medium">{formatDate(campaign.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{campaign.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wrap Type</span>
                <span className="font-medium capitalize">{campaign.wrapType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Financial summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate</span>
                <span className="font-medium">{formatCurrency(campaign.dailyRatePerRider)}/rider</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-medium">{formatCurrency(campaign.totalBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(campaign.amountPaid)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-600 font-semibold">Outstanding</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(campaign.totalBudget - campaign.amountPaid)}
                </span>
              </div>
            </div>
            {campaign.status === 'pending_payment' && (
              <a href={`/billing/pay/${campaign.id}`}
                className="mt-4 block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Make Payment
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <a href={`/campaigns/${params.id}/renew`}
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Renew Campaign
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
