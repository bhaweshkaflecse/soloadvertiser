// Solo Advertiser — Business Portal
// Spend tracker component showing total spending over time

import { formatCurrency } from '@/lib/utils';

interface SpendTrackerProps {
  totalBudget: number;
  totalSpent: number;
  pendingPayments: number;
}

export default function SpendTracker({ totalBudget, totalSpent, pendingPayments }: SpendTrackerProps) {
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Spending Overview</h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Total Spent</span>
          <span className="font-medium">{Math.round(spentPercentage)}% of budget</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${spentPercentage}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">Total Budget</p>
          <p className="font-bold">{formatCurrency(totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="font-bold text-green-600">{formatCurrency(totalSpent)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Pending</p>
          <p className="font-bold text-amber-600">{formatCurrency(pendingPayments)}</p>
        </div>
      </div>
    </div>
  );
}
