'use client';

import { useState } from 'react';
import { formatDateTime } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface InternalNotesProps {
  notes: Note[];
  onAdd: (content: string) => void;
  entityId: string;
}

export function InternalNotes({ notes, onAdd }: InternalNotesProps) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAdd(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b bg-gray-50">
        <h4 className="text-sm font-semibold text-gray-700">Internal Notes</h4>
      </div>

      {/* Notes list */}
      <div className="max-h-64 overflow-y-auto divide-y">
        {notes.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4">
              <p className="text-sm text-gray-900">{note.content}</p>
              <p className="text-xs text-gray-400 mt-1">
                {note.author} — {formatDateTime(note.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add note form */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newNote.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
