'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { StatusBadge } from '@/components/entity/status-badge';
import { formatRelativeTime } from '@/lib/utils';
import type { SupportTicket } from '@/types';

/**
 * PG-ADM-080: Support Ticket Queue
 * List of all support tickets with priority-based ordering.
 */
export default function SupportPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const tickets: SupportTicket[] = [
    { id: 't1', subject: 'Sticker not received', status: 'open', priority: 'high', category: 'Delivery', createdBy: 'Rider #123', assignedTo: 'Sarah K.', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 't2', subject: 'Payment not reflected', status: 'in_progress', priority: 'urgent', category: 'Payment', createdBy: 'Acme Corp', assignedTo: 'Mike R.', createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 't3', subject: 'App login issue', status: 'waiting', priority: 'medium', category: 'Technical', createdBy: 'Rider #456', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 't4', subject: 'Campaign query', status: 'resolved', priority: 'low', category: 'General', createdBy: 'Fresh Foods', assignedTo: 'Admin', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const columns = [
    { key: 'priority', header: 'Priority', render: (row: SupportTicket) => <StatusBadge status={row.priority} /> },
    { key: 'subject', header: 'Subject', sortable: true },
    { key: 'createdBy', header: 'Created By' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status', render: (row: SupportTicket) => <StatusBadge status={row.status} /> },
    { key: 'assignedTo', header: 'Assigned', render: (row: SupportTicket) => row.assignedTo || '—' },
    { key: 'updatedAt', header: 'Updated', render: (row: SupportTicket) => formatRelativeTime(row.updatedAt) },
  ];

  const filterConfig = [
    { key: 'search', label: 'Search tickets...', type: 'search' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: [
      { label: 'Open', value: 'open' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Waiting', value: 'waiting' },
      { label: 'Resolved', value: 'resolved' },
    ]},
    { key: 'priority', label: 'Priority', type: 'select' as const, options: [
      { label: 'Urgent', value: 'urgent' },
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ]},
  ];

  return (
    <div>
      <PageHeader title="Support Tickets" breadcrumbs={[{ label: 'Support' }]} subtitle={`${tickets.filter((t) => t.status !== 'resolved').length} open tickets`} />
      <TableFilters filters={filterConfig} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable columns={columns} data={tickets} rowKey={(t) => t.id} onRowClick={(t) => router.push(`/support/${t.id}`)} />
    </div>
  );
}
