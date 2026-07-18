'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface ApprovalActionsProps {
  itemId: string;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, reason: string) => void;
  isLoading?: boolean;
}

export function ApprovalActions({ itemId, onApprove, onReject, isLoading }: ApprovalActionsProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [note, setNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="border-t p-4 bg-gray-50">
      {/* Note input */}
      <div className="mb-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)..."
          className="w-full px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onApprove(itemId, note || undefined)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={() => setShowRejectDialog(true)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          Reject
        </button>
      </div>

      {/* Reject confirmation */}
      <ConfirmDialog
        open={showRejectDialog}
        title="Reject Application"
        description="Please provide a reason for rejection. This will be communicated to the applicant."
        confirmLabel="Reject"
        variant="danger"
        onConfirm={() => {
          onReject(itemId, rejectReason);
          setShowRejectDialog(false);
          setRejectReason('');
        }}
        onCancel={() => {
          setShowRejectDialog(false);
          setRejectReason('');
        }}
      />
    </div>
  );
}
