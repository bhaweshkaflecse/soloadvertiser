'use client';

import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/entity/status-badge';
import { TimelineView } from '@/components/entity/timeline-view';
import { InternalNotes } from '@/components/entity/internal-notes';

/**
 * PG-ADM-081: Ticket Detail
 * Full ticket view with conversation history and resolution actions.
 */
export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = {
    id: params.id,
    subject: 'Sticker not received',
    status: 'open' as const,
    priority: 'high' as const,
    category: 'Delivery',
    createdBy: 'Rider #123 (John Doe)',
    assignedTo: 'Sarah K.',
    createdAt: '2024-03-14T10:00:00Z',
    description: 'I was assigned to the Summer Promo campaign 5 days ago but have not received my sticker yet. Please advise on pickup location.',
  };

  const timeline = [
    { id: '1', action: 'assigned ticket to Sarah K.', actor: 'System', timestamp: '2024-03-14T10:05:00Z' },
    { id: '2', action: 'created ticket', actor: 'Rider #123', timestamp: '2024-03-14T10:00:00Z' },
  ];

  return (
    <div>
      <PageHeader
        title={ticket.subject}
        breadcrumbs={[{ label: 'Support', href: '/support' }, { label: `Ticket #${ticket.id}` }]}
        actions={
          <div className="flex gap-2">
            <select className="px-3 py-2 text-sm border rounded-md">
              <option>Assign to...</option>
              <option>Sarah K.</option>
              <option>Mike R.</option>
              <option>Admin</option>
            </select>
            <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
              Resolve
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket info */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={ticket.status} size="md" />
              <StatusBadge status={ticket.priority} size="md" />
              <span className="text-sm text-gray-500">{ticket.category}</span>
            </div>
            <p className="text-sm text-gray-700 mb-4">{ticket.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Created by:</span> {ticket.createdBy}</div>
              <div><span className="text-gray-500">Assigned to:</span> {ticket.assignedTo}</div>
            </div>
          </div>

          {/* Reply */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-3">Reply</h3>
            <textarea className="w-full border rounded-md p-3 text-sm resize-none" rows={4} placeholder="Type your reply..." />
            <div className="flex justify-end mt-3">
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Send Reply</button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">History</h3>
            <TimelineView events={timeline} />
          </div>
        </div>

        <div>
          <InternalNotes entityId={ticket.id} notes={[]} onAdd={(c) => console.log('Note:', c)} />
        </div>
      </div>
    </div>
  );
}
