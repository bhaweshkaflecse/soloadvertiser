'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SplitPane } from '@/components/approval/split-pane';
import { ApprovalList } from '@/components/approval/approval-list';
import { ApprovalActions } from '@/components/approval/approval-actions';
import { StatusBadge } from '@/components/entity/status-badge';
import { DocumentViewer } from '@/components/entity/document-viewer';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { ApprovalItem } from '@/types';

/**
 * PG-ADM-010: Rider Approvals
 * Split-pane: queue list + detail pane + approve/reject actions.
 */
export default function RiderApprovalsPage() {
  const { hasRole } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Placeholder data
  const items: ApprovalItem[] = [
    { id: '1', type: 'rider', entityName: 'John Doe', submittedAt: new Date(Date.now() - 3600000).toISOString(), status: 'pending', priority: 'high' },
    { id: '2', type: 'rider', entityName: 'Jane Smith', submittedAt: new Date(Date.now() - 7200000).toISOString(), status: 'pending', priority: 'medium' },
    { id: '3', type: 'rider', entityName: 'Bob Wilson', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'pending', priority: 'low' },
  ];

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const selectedItem = items.find((i) => i.id === selectedId);

  const handleApprove = (id: string, note?: string) => {
    console.log('Approve:', id, note);
  };

  const handleReject = (id: string, reason: string) => {
    console.log('Reject:', id, reason);
  };

  return (
    <div>
      <PageHeader
        title="Rider Approvals"
        breadcrumbs={[{ label: 'Approvals' }, { label: 'Riders' }]}
        subtitle={`${items.length} pending applications`}
      />

      <SplitPane
        list={
          <ApprovalList
            items={items}
            selectedId={selectedId || undefined}
            onSelect={setSelectedId}
          />
        }
        detail={
          selectedItem ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{selectedItem.entityName}</h2>
                  <StatusBadge status={selectedItem.status} />
                </div>

                {/* Rider details placeholder */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm">rider@example.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm">+234 801 234 5678</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Zone</p>
                    <p className="text-sm">Lagos Mainland</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vehicle Type</p>
                    <p className="text-sm">Motorcycle</p>
                  </div>
                </div>

                {/* Documents */}
                <DocumentViewer
                  documents={[
                    { id: 'd1', name: 'ID Card', type: 'image/jpeg', url: '', uploadedAt: '', status: 'pending' },
                    { id: 'd2', name: 'Vehicle Reg', type: 'image/jpeg', url: '', uploadedAt: '', status: 'pending' },
                  ]}
                />
              </div>

              <ApprovalActions
                itemId={selectedItem.id}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select an application to review
            </div>
          )
        }
      />
    </div>
  );
}
