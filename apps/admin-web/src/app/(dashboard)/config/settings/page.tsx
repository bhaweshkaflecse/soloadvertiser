'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-100: Settings Manager
 * Grouped settings with inline edit (Super Admin only).
 */
export default function SettingsPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['super_admin'])) {
    return <EmptyState title="Access Denied" description="Super Admin access required." icon="🔒" />;
  }

  const settingGroups = [
    {
      title: 'Platform Settings',
      settings: [
        { key: 'platform_name', label: 'Platform Name', value: 'SoloAdvertiser', type: 'text' },
        { key: 'support_email', label: 'Support Email', value: 'support@soloadvertiser.com', type: 'text' },
        { key: 'max_campaigns_per_rider', label: 'Max Campaigns per Rider', value: '3', type: 'number' },
        { key: 'auto_assignment', label: 'Auto-Assignment Enabled', value: 'true', type: 'toggle' },
      ],
    },
    {
      title: 'Financial Settings',
      settings: [
        { key: 'min_payout', label: 'Minimum Payout Amount', value: '5000', type: 'number' },
        { key: 'payout_frequency', label: 'Payout Frequency', value: 'weekly', type: 'select' },
        { key: 'payment_grace_period', label: 'Payment Grace Period (days)', value: '7', type: 'number' },
      ],
    },
    {
      title: 'Rider Settings',
      settings: [
        { key: 'min_rider_score', label: 'Min Score for Assignment', value: '60', type: 'number' },
        { key: 'score_decay_rate', label: 'Score Decay Rate (%/week)', value: '2', type: 'number' },
        { key: 'verification_frequency', label: 'Verification Frequency (days)', value: '14', type: 'number' },
      ],
    },
  ];

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    console.log('Save setting:', editingKey, editValue);
    setEditingKey(null);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Settings' }]}
        subtitle="Platform-wide configuration (Super Admin only)"
      />

      <div className="space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">{group.title}</h2>
            </div>
            <div className="divide-y">
              {group.settings.map((setting) => (
                <div key={setting.key} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.key}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingKey === setting.key ? (
                      <>
                        <input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-1 text-sm border rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="text-sm text-blue-600 hover:text-blue-700">Save</button>
                        <button onClick={() => setEditingKey(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                          {setting.value}
                        </span>
                        <button
                          onClick={() => startEdit(setting.key, setting.value)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
