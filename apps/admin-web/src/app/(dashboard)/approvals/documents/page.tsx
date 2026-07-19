'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SplitPane } from '@/components/approval/split-pane';
import { ApprovalList } from '@/components/approval/approval-list';
import { ApprovalActions } from '@/components/approval/approval-actions';
import { DocumentViewer } from '@/components/entity/document-viewer';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { ApprovalItem } from '@/types';

/**
 * PG-ADM-012: Document Approvals
 * Split-pane with document viewer for reviewing uploaded documents.
 */
export default function DocumentApprovalsPage() {
  const { hasRole } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items: ApprovalItem[] = [
    { id: '1', type: 'document', entityName: 'Rider License - John D.', submittedAt: new Date(Date.now() - 1800000).toISOString(), status: 'pending', priority: 'high' },
    { id: '2', type: 'document', entityName: 'Vehicle Reg - Jane S.', submittedAt: new Date(Date.now() - 5400000).toISOString(), status: 'pending', priority: 'medium' },
    { id: '3', type: 'document', entityName: 'Business Cert - Acme', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'pending', priority: 'low' },
  ];

  if (!hasRole(['ops', 'admin', 'super_admin'])) {
    return <EmptyState title="Access Denied" description="You do not have permission to view this page." icon="🚫" />;
  }

  const selectedItem = items.find((i) => i.id === selectedId);

  return (
    <div>
      <PageHeader
        title="Document Approvals"
        breadcrumbs={[{ label: 'Approvals' }, { label: 'Documents' }]}
        subtitle={`${items.length} documents pending review`}
      />

      <SplitPane
        list={<ApprovalList items={items} selectedId={selectedId || undefined} onSelect={setSelectedId} />}
        detail={
          selectedItem ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">{selectedItem.entityName}</h2>
                <DocumentViewer
                  documents={[
                    { id: 'd1', name: 'Document', type: 'image/jpeg', url: '', uploadedAt: '', status: 'pending' },
                  ]}
                />
              </div>
              <ApprovalActions
                itemId={selectedItem.id}
                onApprove={(id) => console.log('Approve doc:', id)}
                onReject={(id, reason) => console.log('Reject doc:', id, reason)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Select a document to review
            </div>
          )
        }
      />
    </div>
  );
}
