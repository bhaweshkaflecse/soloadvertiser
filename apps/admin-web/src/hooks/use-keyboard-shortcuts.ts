'use client';

import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

/**
 * Register keyboard shortcuts with modifier key support.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          shortcut.handler();
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Pre-defined admin shortcuts
export const ADMIN_SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, description: 'Open search' },
  DASHBOARD: { key: 'd', ctrl: true, shift: true, description: 'Go to dashboard' },
  APPROVALS: { key: 'a', ctrl: true, shift: true, description: 'Go to approvals' },
  SHORTCUTS_HELP: { key: '/', description: 'Show shortcuts' },
} as const;
