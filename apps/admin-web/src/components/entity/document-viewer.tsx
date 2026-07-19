'use client';

import { useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DocumentViewerProps {
  documents: Document[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function DocumentViewer({ documents, onApprove, onReject }: DocumentViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(documents[0] || null);

  if (documents.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No documents uploaded</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Document tabs */}
      <div className="flex border-b overflow-x-auto">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              selectedDoc?.id === doc.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {doc.name}
          </button>
        ))}
      </div>

      {/* Document preview */}
      {selectedDoc && (
        <div className="p-4">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
            <p className="text-sm text-gray-500">
              Preview: {selectedDoc.name} ({selectedDoc.type})
            </p>
          </div>

          {/* Document actions */}
          {(onApprove || onReject) && selectedDoc.status === 'pending' && (
            <div className="flex gap-3">
              {onApprove && (
                <button
                  onClick={() => onApprove(selectedDoc.id)}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve Document
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => onReject(selectedDoc.id)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject Document
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
