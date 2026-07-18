'use client';

import { useState, useRef, useEffect } from 'react';

interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  icon?: string;
}

interface TableActionsProps {
  actions: ActionItem[];
}

export function TableActions({ actions }: TableActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 rounded"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded-md shadow-lg py-1 z-20">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                action.variant === 'danger' ? 'text-red-600' : 'text-gray-700'
              }`}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
