'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { TableFilters } from '@/components/data-table/table-filters';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-102: Dictionary Manager
 * Manage lookup values (industries, zones, categories, etc.).
 */
export default function DictionaryPage() {
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState('industries');

  if (!hasRole(['super_admin'])) {
    return <EmptyState title="Access Denied" description="Super Admin access required." icon="🔒" />;
  }

  const categories = [
    { id: 'industries', label: 'Industries', count: 12 },
    { id: 'vehicle_types', label: 'Vehicle Types', count: 5 },
    { id: 'ticket_categories', label: 'Ticket Categories', count: 8 },
    { id: 'rejection_reasons', label: 'Rejection Reasons', count: 10 },
  ];

  const entries = [
    { id: '1', key: 'fmcg', label: 'FMCG', active: true, sortOrder: 1 },
    { id: '2', key: 'technology', label: 'Technology', active: true, sortOrder: 2 },
    { id: '3', key: 'food_beverage', label: 'Food & Beverage', active: true, sortOrder: 3 },
    { id: '4', key: 'healthcare', label: 'Healthcare', active: false, sortOrder: 4 },
  ];

  const columns = [
    { key: 'label', header: 'Label', sortable: true },
    { key: 'key', header: 'Key', render: (row: typeof entries[0]) => <code className="text-xs bg-gray-100 px-1 rounded">{row.key}</code> },
    { key: 'active', header: 'Active', render: (row: typeof entries[0]) => row.active ? '✓' : '✗' },
    { key: 'sortOrder', header: 'Order', sortable: true },
    { key: 'actions', header: '', render: () => <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button> },
  ];

  return (
    <div>
      <PageHeader
        title="Dictionary Manager"
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Dictionary' }]}
        actions={<button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Entry</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category list */}
        <div className="bg-white rounded-lg border">
          <div className="p-3 border-b"><h3 className="text-sm font-semibold">Categories</h3></div>
          <ul className="divide-y">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left p-3 text-sm hover:bg-gray-50 ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  {cat.label} <span className="text-gray-400">({cat.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Entries */}
        <div className="lg:col-span-3">
          <DataTable columns={columns} data={entries} rowKey={(e) => e.id} />
        </div>
      </div>
    </div>
  );
}
