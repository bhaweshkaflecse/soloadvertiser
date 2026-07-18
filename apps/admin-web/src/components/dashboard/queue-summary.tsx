'use client';

import Link from 'next/link';

interface QueueItem {
  label: string;
  count: number;
  href: string;
  urgent?: number;
}

interface QueueSummaryProps {
  queues: QueueItem[];
}

export function QueueSummary({ queues }: QueueSummaryProps) {
  const totalPending = queues.reduce((sum, q) => sum + q.count, 0);

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Pending Queues</h3>
        <span className="text-sm text-gray-500">{totalPending} total</span>
      </div>
      <ul className="divide-y">
        {queues.map((queue) => (
          <li key={queue.label}>
            <Link
              href={queue.href}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{queue.label}</span>
              <div className="flex items-center gap-2">
                {queue.urgent && queue.urgent > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {queue.urgent} urgent
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {queue.count}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
