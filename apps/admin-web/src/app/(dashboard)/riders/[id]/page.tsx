'use client';

import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/entity/status-badge';
import { TimelineView } from '@/components/entity/timeline-view';
import { InternalNotes } from '@/components/entity/internal-notes';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useAuth } from '@/hooks/use-auth';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * PG-ADM-021: Rider Detail
 * Full rider profile with documents, timeline, campaigns, and notes.
 */
export default function RiderDetailPage({ params }: { params: { id: string } }) {
  const { hasRole } = useAuth();

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  // Placeholder rider data
  const rider = {
    id: params.id,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+234 801 234 5678',
    status: 'active' as const,
    zone: 'Lagos Mainland',
    score: 92,
    joinedAt: '2024-01-15',
    totalEarnings: 45000,
    activeCampaigns: 2,
    vehicleType: 'Motorcycle',
    licensePlate: 'LAG-123-XY',
  };

  const timeline = [
    { id: '1', action: 'completed campaign "Brand X"', actor: 'System', timestamp: '2024-03-10T14:30:00Z' },
    { id: '2', action: 'approved sticker application', actor: 'Sarah K.', timestamp: '2024-02-20T09:15:00Z' },
    { id: '3', action: 'assigned to campaign "Brand X"', actor: 'Mike R.', timestamp: '2024-02-15T11:00:00Z' },
    { id: '4', action: 'approved rider application', actor: 'Admin', timestamp: '2024-01-15T16:45:00Z' },
  ];

  const notes = [
    { id: '1', content: 'Excellent rider, always on time with verifications.', author: 'Sarah K.', createdAt: '2024-03-05T10:00:00Z' },
  ];

  if (!rider) return <LoadingSkeleton variant="detail" />;

  return (
    <div>
      <PageHeader
        title={rider.name}
        breadcrumbs={[{ label: 'Riders', href: '/riders' }, { label: rider.name }]}
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
              Suspend
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Profile</h2>
              <StatusBadge status={rider.status} size="md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm">{rider.email}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm">{rider.phone}</p></div>
              <div><p className="text-xs text-gray-500">Zone</p><p className="text-sm">{rider.zone}</p></div>
              <div><p className="text-xs text-gray-500">Score</p><p className="text-sm font-medium">{rider.score}/100</p></div>
              <div><p className="text-xs text-gray-500">Vehicle</p><p className="text-sm">{rider.vehicleType}</p></div>
              <div><p className="text-xs text-gray-500">License Plate</p><p className="text-sm">{rider.licensePlate}</p></div>
              <div><p className="text-xs text-gray-500">Joined</p><p className="text-sm">{rider.joinedAt}</p></div>
              <div><p className="text-xs text-gray-500">Total Earnings</p><p className="text-sm font-medium">₦{rider.totalEarnings.toLocaleString()}</p></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
            <TimelineView events={timeline} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InternalNotes
            entityId={rider.id}
            notes={notes}
            onAdd={(content) => console.log('Add note:', content)}
          />
        </div>
      </div>
    </div>
  );
}
