// Solo Advertiser — Business Portal
// Campaign card component with capacity meter
// Shows campaign summary in grid/list views

import type { Campaign } from '@/types';
import { formatCurrency } from '@/lib/utils';
import CapacityMeter from './capacity-meter';
import StatusBadge from '@/components/shared/status-badge';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const fulfillment = campaign.targetRiders > 0
    ? Math.round((campaign.assignedRiders / campaign.targetRiders) * 100)
    : 0;

  return (
    <a href={`/campaigns/${campaign.id}`} className="block">
      <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
          <StatusBadge status={campaign.status} />
        </div>

        {/* Capacity meter */}
        <div className="mb-3">
          <CapacityMeter current={campaign.assignedRiders} target={campaign.targetRiders} />
          <p className="text-xs text-gray-500 mt-1">
            {campaign.assignedRiders}/{campaign.targetRiders} riders ({fulfillment}%)
          </p>
        </div>

        {/* Details */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>{campaign.durationDays} days</span>
          <span className="font-medium">{formatCurrency(campaign.totalBudget)}</span>
        </div>
      </div>
    </a>
  );
}
