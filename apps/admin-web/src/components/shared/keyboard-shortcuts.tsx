'use client';

import { useState } from 'react';
import { ADMIN_SHORTCUTS, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcuts([
    { key: '/', handler: () => setIsOpen((prev) => !prev) },
    { key: 'Escape', handler: () => setIsOpen(false) },
  ]);

  if (!isOpen) return null;

  const shortcuts = Object.values(ADMIN_SHORTCUTS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <kbd className="px-2 py-1 bg-gray-100 border rounded text-xs font-mono">
                {shortcut.ctrl && 'Ctrl+'}
                {shortcut.shift && 'Shift+'}
                {shortcut.key.toUpperCase()}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">Press / to toggle this panel</p>
      </div>
    </div>
  );
}
