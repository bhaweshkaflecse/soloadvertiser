'use client';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  verified: 'bg-green-100 text-green-700',
  healthy: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-700',
  suspended: 'bg-orange-100 text-orange-700',
  paused: 'bg-orange-100 text-orange-700',
  degraded: 'bg-orange-100 text-orange-700',
  waiting: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  deactivated: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  down: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-600',
  resolved: 'bg-gray-100 text-gray-600',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium capitalize ${colorClass} ${sizeClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
