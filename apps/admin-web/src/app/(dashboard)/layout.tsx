'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { KeyboardShortcuts } from '@/components/shared/keyboard-shortcuts';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

/**
 * Authenticated dashboard layout with sidebar + top bar.
 * Redirects to login if unauthenticated.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
      <KeyboardShortcuts />
    </div>
  );
}
