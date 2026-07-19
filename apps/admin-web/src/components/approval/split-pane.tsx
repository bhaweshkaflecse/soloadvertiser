'use client';

interface SplitPaneProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  listWidth?: string;
}

/**
 * Split-pane layout for approval queues.
 * Left: scrollable list. Right: selected item detail.
 */
export function SplitPane({ list, detail, listWidth = 'w-1/3' }: SplitPaneProps) {
  return (
    <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-white">
      {/* List pane */}
      <div className={`${listWidth} border-r overflow-y-auto`}>
        {list}
      </div>

      {/* Detail pane */}
      <div className="flex-1 overflow-y-auto">
        {detail}
      </div>
    </div>
  );
}
