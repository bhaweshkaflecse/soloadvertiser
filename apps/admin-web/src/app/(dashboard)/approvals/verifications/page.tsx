'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SplitPane } from '@/components/approval/split-pane';
import { ApprovalList } from '@/components/approval/approval-list';
import { ApprovalActions } from '@/components/approval/approval-actions';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { ApprovalItem } from '@/types';

/**
 * PG-ADM-013: Verification Approvals
 * Split-pane for reviewing sticker application verifications (photos).
 */
export default function VerificationApprovalsPage() {
  const { hasRole } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items: ApprovalItem[] = [
    { id: '1', type: 'verification', entityName: 'Sticker Apply - Rider #123', submittedAt: new Date(Date.now() - 1800000).toISOString(), status: 'pending', priority: 'medium' },
    { id: '2', type: 'verification', entityName: 'Sticker Apply - Rider #456', submittedAt: new Date(Date.now() - 3600000).toISOString(), status: 'pending', priority: 'low' },
  ];

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Verification Approvals"
        breadcrumbs={[{ label: 'Approvals' }, { label: 'Verifications' }]}
        subtitle={`${items.length} verifications pending`}
      />

      <SplitPane
        list={<ApprovalList items={items} selectedId={selectedId || undefined} onSelect={setSelectedId} />}
        detail={
          selectedItem ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">{selectedItem.entityName}</h2>
                {/* Verification photo comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Expected Placement</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Submitted Photo</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Campaign</p><p className="text-sm">Brand X Launch</p></div>
                  <div><p className="text-xs text-gray-500">Submitted</p><p className="text-sm">2 hours ago</p></div>
                </div>
              </div>
              <ApprovalActions
                itemId={selectedItem.id}
                onApprove={(id) => console.log('Approve verification:', id)}
                onReject={(id, reason) => console.log('Reject verification:', id, reason)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a verification to review
            </div>
          )
        }
      />
    </div>
  );
}
