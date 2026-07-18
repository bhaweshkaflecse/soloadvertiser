'use client';

import { PageHeader } from '@/components/layout/page-header';
import { KPICard } from '@/components/dashboard/kpi-card';
import { QueueSummary } from '@/components/dashboard/queue-summary';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useAuth } from '@/hooks/use-auth';

/**
 * PG-ADM-001: Dashboard
 * KPI cards + today's queue + activity feed
 */
export default function DashboardPage() {
  const { user } = useAuth();

  // Placeholder data — will be replaced with TanStack Query
  const kpis = [
    { label: 'Active Riders', value: '1,247', change: 12, trend: 'up' as const, icon: '🏍️' },
    { label: 'Active Campaigns', value: '89', change: 5, trend: 'up' as const, icon: '📣' },
    { label: 'Pending Approvals', value: '34', change: -8, trend: 'down' as const, icon: '✅' },
    { label: "Today's Revenue", value: '$12,450', change: 18, trend: 'up' as const, icon: '💰' },
  ];

  const queues = [
    { label: 'Rider Applications', count: 12, href: '/approvals/riders', urgent: 3 },
    { label: 'Business Verifications', count: 8, href: '/approvals/businesses', urgent: 1 },
    { label: 'Document Reviews', count: 9, href: '/approvals/documents' },
    { label: 'Payment Verifications', count: 5, href: '/finance/payments', urgent: 2 },
  ];

  const activities = [
    { id: '1', actor: 'Sarah K.', action: 'approved rider application for', target: 'John Doe', timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: '2', actor: 'Mike R.', action: 'rejected document from', target: 'ABC Corp', timestamp: new Date(Date.now() - 900000).toISOString() },
    { id: '3', actor: 'System', action: 'auto-assigned campaign to', target: '15 riders', timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: '4', actor: 'Admin', action: 'generated payout batch for', target: 'March 2024', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '5', actor: 'Lisa M.', action: 'resolved support ticket from', target: 'Rider #452', timestamp: new Date(Date.now() - 7200000).toISOString() },
  ];

  if (!user) return <LoadingSkeleton variant="card" />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name}`}
        subtitle="Here's what's happening today"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Queue + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QueueSummary queues={queues} />
        <ActivityFeed items={activities} />
      </div>
    </div>
  );
}
