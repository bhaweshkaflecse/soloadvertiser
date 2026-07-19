'use client';

import { formatDateTime } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No history available</p>;
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mt-1.5" />
            {index < events.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
          </div>

          {/* Content */}
          <div className="pb-6">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{event.actor}</span>{' '}
              {event.action}
            </p>
            {event.details && (
              <p className="text-xs text-gray-500 mt-0.5">{event.details}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{formatDateTime(event.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
