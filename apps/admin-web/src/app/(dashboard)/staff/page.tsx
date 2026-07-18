'use client';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import { formatDateTime } from '@/lib/utils';

/**
 * PG-ADM-120: Staff Management
 * Manage admin staff accounts and role assignments.
 */
export default function StaffPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['super_admin'])) {
    return <EmptyState title="Access Denied" description="Super Admin access required." icon="🔒" />;
  }

  const staff = [
    { id: 's1', name: 'Sarah Kim', email: 'sarah@soloadvertiser.com', role: 'admin', status: 'active', lastLogin: '2024-03-14T10:00:00Z' },
    { id: 's2', name: 'Mike Ross', email: 'mike@soloadvertiser.com', role: 'ops', status: 'active', lastLogin: '2024-03-14T09:30:00Z' },
    { id: 's3', name: 'Lisa Morgan', email: 'lisa@soloadvertiser.com', role: 'finance', status: 'active', lastLogin: '2024-03-13T16:00:00Z' },
    { id: 's4', name: 'Tom Davies', email: 'tom@soloadvertiser.com', role: 'ops', status: 'active', lastLogin: '2024-03-12T11:00:00Z' },
    { id: 's5', name: 'Ex Staff', email: 'ex@soloadvertiser.com', role: 'ops', status: 'deactivated', lastLogin: '2024-01-01T10:00:00Z' },
  ];

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', sortable: true, render: (row: typeof staff[0]) => (
      <span className="capitalize text-sm px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{row.role.replace('_', ' ')}</span>
    )},
    { key: 'status', header: 'Status', render: (row: typeof staff[0]) => <StatusBadge status={row.status} /> },
    { key: 'lastLogin', header: 'Last Login', render: (row: typeof staff[0]) => formatDateTime(row.lastLogin) },
    { key: 'actions', header: '', render: () => <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button> },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Management"
        breadcrumbs={[{ label: 'Staff' }]}
        subtitle={`${staff.filter((s) => s.status === 'active').length} active staff members`}
        actions={<button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Invite Staff</button>}
      />
      <DataTable columns={columns} data={staff} rowKey={(s) => s.id} />
    </div>
  );
}
