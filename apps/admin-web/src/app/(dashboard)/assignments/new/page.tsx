'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-051: Assignment Creation
 * Campaign selector + eligible riders list (sorted by score) + bulk assign.
 */
export default function NewAssignmentPage() {
  const { hasRole } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedRiders, setSelectedRiders] = useState<string[]>([]);

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const campaigns = [
    { id: 'c1', name: 'Summer Promo — Acme Corp', slotsRemaining: 5 },
    { id: 'c2', name: 'New Product Launch — Fresh Foods', slotsRemaining: 10 },
  ];

  const eligibleRiders = [
    { id: 'r1', name: 'John Doe', zone: 'Lagos Mainland', score: 92, activeCampaigns: 1 },
    { id: 'r2', name: 'Jane Smith', zone: 'Lagos Island', score: 88, activeCampaigns: 1 },
    { id: 'r3', name: 'Mike Johnson', zone: 'Lagos Mainland', score: 85, activeCampaigns: 0 },
    { id: 'r4', name: 'Sarah Williams', zone: 'Ikeja', score: 82, activeCampaigns: 2 },
    { id: 'r5', name: 'David Brown', zone: 'Lagos Mainland', score: 78, activeCampaigns: 0 },
  ];

  const toggleRider = (id: string) => {
    setSelectedRiders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    console.log('Assign riders:', selectedRiders, 'to campaign:', selectedCampaign);
  };

  const riderColumns = [
    {
      key: 'select',
      header: '',
      width: '40px',
      render: (row: typeof eligibleRiders[0]) => (
        <input
          type="checkbox"
          checked={selectedRiders.includes(row.id)}
          onChange={() => toggleRider(row.id)}
          className="rounded"
        />
      ),
    },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'zone', header: 'Zone', sortable: true },
    { key: 'score', header: 'Score', sortable: true, render: (row: typeof eligibleRiders[0]) => (
      <span className="font-medium text-blue-600">{row.score}</span>
    )},
    { key: 'activeCampaigns', header: 'Active', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Create Assignment"
        breadcrumbs={[{ label: 'Assignments', href: '/assignments' }, { label: 'New Assignment' }]}
      />

      {/* Step 1: Campaign Selection */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Select Campaign</h2>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a campaign...</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.slotsRemaining} slots)
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Rider Selection */}
      {selectedCampaign && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">2. Select Riders (sorted by score)</h2>
            <span className="text-sm text-gray-500">{selectedRiders.length} selected</span>
          </div>

          <DataTable
            columns={riderColumns}
            data={eligibleRiders}
            rowKey={(r) => r.id}
            onRowClick={(r) => toggleRider(r.id)}
          />
        </div>
      )}

      {/* Step 3: Confirm */}
      {selectedRiders.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-700">
            Assign <span className="font-bold">{selectedRiders.length}</span> riders to selected campaign
          </p>
          <button
            onClick={handleAssign}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Confirm Assignment
          </button>
        </div>
      )}
    </div>
  );
}
