// Solo Advertiser — Business Portal
// PG-BIZ-050: Support Ticket List
// Shows existing support tickets with status filter

'use client';

import { useApi } from '@/hooks/use-api';
import type { SupportTicket } from '@/types';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/layout/page-header';
import StatusBadge from '@/components/shared/status-badge';
import LoadingSkeleton from '@/components/shared/loading-skeleton';
import EmptyState from '@/components/shared/empty-state';

export default function SupportPage() {
  const { data: tickets, isLoading } = useApi<SupportTicket[]>('/support/tickets');

  return (
    <div>
      <PageHeader
        title="Support"
        description="Manage your support tickets"
        actions={
          <a href="/support/new"
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 text-sm">
            + New Ticket
          </a>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-16" />)}
        </div>
      ) : tickets && tickets.length > 0 ? (
        <div className="bg-white rounded-lg shadow divide-y">
          {tickets.map((ticket) => (
            <a key={ticket.id} href={`/support/${ticket.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div>
                <p className="font-medium">{ticket.subject}</p>
                <p className="text-sm text-gray-500">
                  {ticket.category} &middot; {formatDate(ticket.createdAt)}
                </p>
              </div>
              <StatusBadge status={ticket.status} />
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No support tickets"
          description="Need help? Create a new ticket to reach our support team."
          actionLabel="Create Ticket"
          actionHref="/support/new"
        />
      )}
    </div>
  );
}
