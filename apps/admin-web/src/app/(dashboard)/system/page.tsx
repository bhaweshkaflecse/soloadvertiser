'use client';

import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/entity/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/hooks/use-auth';
import type { SystemHealth } from '@/types';

/**
 * PG-ADM-140: System Health
 * Monitor service status, uptime, and performance metrics.
 */
export default function SystemHealthPage() {
  const { hasRole } = useAuth();

  if (!hasRole(['super_admin'])) {
    return <EmptyState title="Access Denied" description="Super Admin access required." icon="🔒" />;
  }

  const services: SystemHealth[] = [
    { service: 'API Gateway', status: 'healthy', uptime: 99.98, lastCheck: '2024-03-14T14:30:00Z', responseTime: 45 },
    { service: 'Auth Service', status: 'healthy', uptime: 99.99, lastCheck: '2024-03-14T14:30:00Z', responseTime: 32 },
    { service: 'Payment Service', status: 'healthy', uptime: 99.95, lastCheck: '2024-03-14T14:30:00Z', responseTime: 120 },
    { service: 'Notification Service', status: 'degraded', uptime: 98.5, lastCheck: '2024-03-14T14:30:00Z', responseTime: 350 },
    { service: 'File Storage (S3)', status: 'healthy', uptime: 99.99, lastCheck: '2024-03-14T14:30:00Z', responseTime: 65 },
    { service: 'Database (Primary)', status: 'healthy', uptime: 99.99, lastCheck: '2024-03-14T14:30:00Z', responseTime: 8 },
    { service: 'Database (Replica)', status: 'healthy', uptime: 99.97, lastCheck: '2024-03-14T14:30:00Z', responseTime: 12 },
    { service: 'Redis Cache', status: 'healthy', uptime: 99.99, lastCheck: '2024-03-14T14:30:00Z', responseTime: 2 },
    { service: 'Socket.IO Server', status: 'healthy', uptime: 99.9, lastCheck: '2024-03-14T14:30:00Z', responseTime: 15 },
  ];

  const overallHealthy = services.filter((s) => s.status === 'healthy').length;

  return (
    <div>
      <PageHeader
        title="System Health"
        breadcrumbs={[{ label: 'System Health' }]}
        subtitle={`${overallHealthy}/${services.length} services healthy`}
        actions={<button className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Refresh</button>}
      />

      {/* Overall status */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${overallHealthy === services.length ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h2 className="text-lg font-semibold">
            {overallHealthy === services.length ? 'All Systems Operational' : 'Partial Degradation'}
          </h2>
        </div>
      </div>

      {/* Service list */}
      <div className="bg-white rounded-lg border divide-y">
        {services.map((service) => (
          <div key={service.service} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                service.status === 'healthy' ? 'bg-green-500' :
                service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{service.service}</p>
                <p className="text-xs text-gray-500">Uptime: {service.uptime}%</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{service.responseTime}ms</span>
              <StatusBadge status={service.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
