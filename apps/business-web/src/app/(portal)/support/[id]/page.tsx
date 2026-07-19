// Solo Advertiser — Business Portal
// PG-BIZ-052: Ticket Conversation Page
// Chat-style thread for communicating with support team

'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import type { SupportTicket } from '@/types';
import StatusBadge from '@/components/shared/status-badge';
import LoadingSkeleton from '@/components/shared/loading-skeleton';

interface TicketDetailProps {
  params: { id: string };
}

export default function TicketConversationPage({ params }: TicketDetailProps) {
  const { data: ticket, isLoading } = useApi<SupportTicket>(`/support/tickets/${params.id}`);
  const [newMessage, setNewMessage] = useState('');

  if (isLoading) return <LoadingSkeleton className="h-96" />;
  if (!ticket) return <div>Ticket not found</div>;

  const handleSend = () => {
    if (!newMessage.trim()) return;
    // TODO: Send message via API
    console.log('Send:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Ticket header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-gray-500">{ticket.category} &middot; {ticket.priority} priority</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {ticket.messages?.map((msg) => (
            <div key={msg.id} className={`px-6 py-4 ${msg.senderType === 'support' ? 'bg-blue-50' : ''}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">
                  {msg.senderName}
                  {msg.senderType === 'support' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Support</span>
                  )}
                </span>
                <span className="text-xs text-gray-500">{msg.createdAt}</span>
              </div>
              <p className="text-gray-700">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message input */}
      {ticket.status !== 'closed' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}
            className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
