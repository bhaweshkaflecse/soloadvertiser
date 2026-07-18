'use client';

import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { Zone } from '@/types';

/**
 * PG-ADM-110: Zone Manager
 * Define and manage geographic zones for campaign operations.
 */
export default function ZonesPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['super_admin'])) {
    return <EmptyState title="Access Denied" description="Super Admin access required." icon="🔒" />;
  }

  const zones: Zone[] = [
    { id: 'z1', name: 'Lagos Mainland', city: 'Lagos', activeRiders: 245, activeCampaigns: 12, boundaries: {} },
    { id: 'z2', name: 'Lagos Island', city: 'Lagos', activeRiders: 180, activeCampaigns: 8, boundaries: {} },
    { id: 'z3', name: 'Ikeja', city: 'Lagos', activeRiders: 120, activeCampaigns: 6, boundaries: {} },
    { id: 'z4', name: 'Victoria Island', city: 'Lagos', activeRiders: 95, activeCampaigns: 15, boundaries: {} },
    { id: 'z5', name: 'Lekki', city: 'Lagos', activeRiders: 78, activeCampaigns: 4, boundaries: {} },
  ];

  const columns = [
    { key: 'name', header: 'Zone Name', sortable: true },
    { key: 'city', header: 'City' },
    { key: 'activeRiders', header: 'Active Riders', sortable: true },
    { key: 'activeCampaigns', header: 'Active Campaigns', sortable: true },
    { key: 'actions', header: '', render: () => (
      <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Zone Manager"
        breadcrumbs={[{ label: 'Zones' }]}
        subtitle="Manage geographic zones"
        actions={<button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Zone</button>}
      />

      {/* Map placeholder */}
      <div className="bg-white rounded-lg border mb-6 h-64 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Zone map visualization (Mapbox/Google Maps integration)</p>
      </div>

      <DataTable columns={columns} data={zones} rowKey={(z) => z.id} />
    </div>
  );
}
