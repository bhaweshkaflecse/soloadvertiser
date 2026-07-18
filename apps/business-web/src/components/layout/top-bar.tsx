// Solo Advertiser — Business Portal
// Top bar component with user menu and notifications
// Displays breadcrumbs and quick actions

'use client';

import { useState } from 'react';

export default function TopBar() {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: breadcrumb / search */}
      <div className="flex items-center">
        <span className="text-sm text-gray-500">Business Portal</span>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">AC</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Acme Corp</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border z-50">
              <a href="/settings/company" className="block px-4 py-2 text-sm hover:bg-gray-50">
                Company Settings
              </a>
              <a href="/settings/billing" className="block px-4 py-2 text-sm hover:bg-gray-50">
                Billing
              </a>
              <hr />
              <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
