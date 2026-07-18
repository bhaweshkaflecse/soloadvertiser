// Solo Advertiser — Business Portal
// Collapsible sidebar navigation component
// Shows navigation items with icons and optional badges

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

const navigation: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Campaigns', path: '/campaigns', icon: 'Megaphone', badge: 'activeCampaigns' },
  { label: 'Billing', path: '/billing', icon: 'Receipt' },
  { label: 'Support', path: '/support', icon: 'HelpCircle', badge: 'openTickets' },
  { label: 'Settings', path: '/settings/company', icon: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  return (
    <aside className={cn(
      'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b">
        {!collapsed && <h1 className="text-lg font-bold text-blue-900">Solo Advertiser</h1>}
        {collapsed && <span className="text-xl font-bold text-blue-900 mx-auto">SA</span>}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4">
        {navigation.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium transition-colors',
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <NavIcon name={item.icon} />
            {!collapsed && (
              <>
                <span className="ml-3">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </>
            )}
          </a>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full p-2 text-gray-400 hover:text-gray-600 text-center"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </aside>
  );
}

function NavIcon({ name }: { name: string }) {
  // Simplified icon rendering — in production use lucide-react icons
  const icons: Record<string, string> = {
    LayoutDashboard: '□',
    Megaphone: '📢',
    Receipt: '📄',
    HelpCircle: '❓',
    Settings: '⚙',
  };
  return <span className="w-5 h-5 flex items-center justify-center text-sm">{icons[name] || '•'}</span>;
}
