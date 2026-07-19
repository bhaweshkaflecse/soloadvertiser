// Solo Advertiser — Business Portal
// Status badge component for displaying entity status
// Maps status strings to color-coded badges

import { getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const displayText = status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {displayText}
    </span>
  );
}
