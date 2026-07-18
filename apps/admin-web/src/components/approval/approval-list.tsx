'use client';

import { formatRelativeTime } from '@/lib/utils';
import type { ApprovalItem } from '@/types';

interface ApprovalListProps {
  items: ApprovalItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ApprovalList({ items, selectedId, onSelect }: ApprovalListProps) {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        No pending approvals
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => onSelect(item.id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              selectedId === item.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{item.entityName}</span>
              <PriorityBadge priority={item.priority} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 capitalize">{item.type}</span>
              <span className="text-xs text-gray-400">{formatRelativeTime(item.submittedAt)}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function PriorityBadge({ priority }: { priority: ApprovalItem['priority'] }) {
  const colors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
}
