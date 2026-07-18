'use client';

import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/entity/status-badge';
import { TimelineView } from '@/components/entity/timeline-view';
import { InternalNotes } from '@/components/entity/internal-notes';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-031: Business Detail
 * Full business profile with campaigns, payments, and activity.
 */
export default function BusinessDetailPage({ params }: { params: { id: string } }) {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const business = {
    id: params.id,
    name: 'Acme Corp',
    contactEmail: 'biz@acme.com',
    contactPhone: '+234 801 234 5678',
    status: 'active' as const,
    industry: 'FMCG',
    totalCampaigns: 5,
    totalSpend: 250000,
    joinedAt: '2024-01-10',
    address: '123 Business Ave, Lagos',
    rcNumber: 'RC-123456',
  };

  const timeline = [
    { id: '1', action: 'launched campaign "Summer Promo"', actor: 'Acme Corp', timestamp: '2024-03-01T10:00:00Z' },
    { id: '2', action: 'payment verified ₦50,000', actor: 'Finance Team', timestamp: '2024-02-28T14:00:00Z' },
    { id: '3', action: 'registered on platform', actor: 'System', timestamp: '2024-01-10T09:00:00Z' },
  ];

  return (
    <div>
      <PageHeader
        title={business.name}
        breadcrumbs={[{ label: 'Businesses', href: '/businesses' }, { label: business.name }]}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Suspend</button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Edit</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Business Profile</h2>
              <StatusBadge status={business.status} size="md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm">{business.contactEmail}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm">{business.contactPhone}</p></div>
              <div><p className="text-xs text-gray-500">Industry</p><p className="text-sm">{business.industry}</p></div>
              <div><p className="text-xs text-gray-500">RC Number</p><p className="text-sm">{business.rcNumber}</p></div>
              <div><p className="text-xs text-gray-500">Address</p><p className="text-sm">{business.address}</p></div>
              <div><p className="text-xs text-gray-500">Total Spend</p><p className="text-sm font-medium">₦{business.totalSpend.toLocaleString()}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <TimelineView events={timeline} />
          </div>
        </div>

        <div>
          <InternalNotes entityId={business.id} notes={[]} onAdd={(c) => console.log('Add note:', c)} />
        </div>
      </div>
    </div>
  );
}
