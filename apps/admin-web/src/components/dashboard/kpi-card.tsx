'use client';

import type { KPIMetric } from '@/types';

interface KPICardProps extends KPIMetric {
  icon?: string;
}

export function KPICard({ label, value, change, changeLabel, trend, icon }: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {(change !== undefined || changeLabel) && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
          <span>{trendIcon}</span>
          {change !== undefined && <span>{change > 0 ? '+' : ''}{change}%</span>}
          {changeLabel && <span className="text-gray-400 ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
