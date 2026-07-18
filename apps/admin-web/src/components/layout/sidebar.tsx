'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { StaffRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles: StaffRole[] | 'all';
  badge?: string;
}

const navigation: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊', roles: 'all' },
  { label: 'Approval Queues', path: '/approvals/riders', icon: '✅', roles: ['ops', 'admin', 'super_admin'] },
  { label: 'Riders', path: '/riders', icon: '🏍️', roles: ['ops', 'admin', 'super_admin'] },
  { label: 'Businesses', path: '/businesses', icon: '🏢', roles: ['ops', 'admin', 'super_admin'] },
  { label: 'Campaigns', path: '/campaigns', icon: '📣', roles: ['ops', 'admin', 'super_admin'] },
  { label: 'Assignments', path: '/assignments', icon: '👤', roles: ['ops', 'admin', 'super_admin'] },
  { label: 'Sticker Inventory', path: '/stickers', icon: '📦', roles: ['ops', 'admin', 'super_admin'] },
  { label: 'Payments', path: '/finance/payments', icon: '💳', roles: ['finance', 'admin', 'super_admin'] },
  { label: 'Payouts', path: '/finance/payouts', icon: '💰', roles: ['finance', 'admin', 'super_admin'] },
  { label: 'Reconciliation', path: '/finance/reconciliation', icon: '🧮', roles: ['finance', 'admin', 'super_admin'] },
  { label: 'Support', path: '/support', icon: '🎧', roles: 'all' },
  { label: 'Reports', path: '/reports', icon: '📈', roles: 'all' },
  { label: 'Configuration', path: '/config/settings', icon: '⚙️', roles: ['super_admin'] },
  { label: 'Zones', path: '/zones', icon: '🗺️', roles: ['super_admin'] },
  { label: 'Staff', path: '/staff', icon: '👥', roles: ['super_admin'] },
  { label: 'Audit Logs', path: '/audit', icon: '🔍', roles: ['admin', 'super_admin'] },
  { label: 'System Health', path: '/system', icon: '💓', roles: ['super_admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasRole, user } = useAuth();

  const visibleItems = navigation.filter((item) => hasRole(item.roles as StaffRole[] | 'all'));

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold">SoloAdvertiser</h1>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleItems.map((item) => {
            const isActive = pathname?.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
