// Solo Advertiser — Business Portal
// Authenticated portal layout with sidebar navigation
// Redirects to login if not authenticated

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import TopBar from '@/components/layout/top-bar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Auth guard — redirect if no token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Collapsible sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
