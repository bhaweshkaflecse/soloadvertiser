'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-101: Feature Flags
 * Toggle feature flags for gradual rollouts.
 */
export default function FeatureFlagsPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['super_admin'])) {
    return <EmptyState title="Access Denied" description="Super Admin access required." icon="🔒" />;
  }

  const [flags, setFlags] = useState([
    { key: 'auto_assignment_v2', label: 'Auto-Assignment V2', description: 'New scoring algorithm for rider assignment', enabled: true, rollout: 100 },
    { key: 'rider_app_redesign', label: 'Rider App Redesign', description: 'New UI for rider mobile app', enabled: true, rollout: 25 },
    { key: 'instant_payouts', label: 'Instant Payouts', description: 'Real-time payout processing', enabled: false, rollout: 0 },
    { key: 'ai_verification', label: 'AI Sticker Verification', description: 'ML-based sticker photo verification', enabled: true, rollout: 50 },
    { key: 'business_self_serve', label: 'Business Self-Serve', description: 'Allow businesses to manage campaigns directly', enabled: false, rollout: 0 },
  ]);

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Feature Flags' }]}
        subtitle="Control feature rollout and availability"
      />

      <div className="bg-white rounded-lg border divide-y">
        {flags.map((flag) => (
          <div key={flag.key} className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-900">{flag.label}</p>
                {flag.enabled && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {flag.rollout}% rollout
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{flag.description}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{flag.key}</p>
            </div>
            <button
              onClick={() => toggleFlag(flag.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  flag.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
