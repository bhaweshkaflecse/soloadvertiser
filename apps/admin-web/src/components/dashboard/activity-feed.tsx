'use client';

import { formatRelativeTime } from '@/lib/utils';

interface ActivityItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">No recent activity</p>;
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{item.actor}</span>{' '}
                  <span className="text-gray-600">{item.action}</span>{' '}
                  <span className="font-medium">{item.target}</span>
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
