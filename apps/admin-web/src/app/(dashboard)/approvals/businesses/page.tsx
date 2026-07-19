'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SplitPane } from '@/components/approval/split-pane';
import { ApprovalList } from '@/components/approval/approval-list';
import { ApprovalActions } from '@/components/approval/approval-actions';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { ApprovalItem } from '@/types';

/**
 * PG-ADM-011: Business Approvals
 * Split-pane layout for reviewing business registration applications.
 */
export default function BusinessApprovalsPage() {
  const { hasRole } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items: ApprovalItem[] = [
    { id: '1', type: 'business', entityName: 'Acme Corp', submittedAt: new Date(Date.now() - 3600000).toISOString(), status: 'pending', priority: 'high' },
    { id: '2', type: 'business', entityName: 'Fresh Foods Ltd', submittedAt: new Date(Date.now() - 7200000).toISOString(), status: 'pending', priority: 'medium' },
  ];

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Business Approvals"
        breadcrumbs={[{ label: 'Approvals' }, { label: 'Businesses' }]}
        subtitle={`${items.length} pending applications`}
      />

      <SplitPane
        list={<ApprovalList items={items} selectedId={selectedId || undefined} onSelect={setSelectedId} />}
        detail={
          selectedItem ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{selectedItem.entityName}</h2>
                  <StatusBadge status={selectedItem.status} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Industry</p><p className="text-sm">Advertising</p></div>
                  <div><p className="text-xs text-gray-500">Contact</p><p className="text-sm">contact@acme.com</p></div>
                  <div><p className="text-xs text-gray-500">Location</p><p className="text-sm">Lagos, Nigeria</p></div>
                  <div><p className="text-xs text-gray-500">Registered</p><p className="text-sm">RC-12345</p></div>
                </div>
              </div>
              <ApprovalActions
                itemId={selectedItem.id}
                onApprove={(id) => console.log('Approve business:', id)}
                onReject={(id, reason) => console.log('Reject business:', id, reason)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a business to review
            </div>
          )
        }
      />
    </div>
  );
}
