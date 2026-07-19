// Solo Advertiser — Business Portal
// Budget calculator component (riders x days x rate)
// Real-time calculation display for campaign creation

'use client';

import { formatCurrency } from '@/lib/utils';

interface BudgetCalculatorProps {
  riders: number;
  days: number;
  dailyRate: number;
  onRateChange?: (rate: number) => void;
}

export default function BudgetCalculator({ riders, days, dailyRate, onRateChange }: BudgetCalculatorProps) {
  const totalBudget = riders * days * dailyRate;
  const platformFee = totalBudget * 0.15; // 15% platform fee
  const grandTotal = totalBudget + platformFee;

  return (
    <div className="space-y-4">
      {/* Rate adjustment */}
      {onRateChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Daily Rate per Rider</label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-gray-500">₹</span>
            <input
              type="number"
              min={100}
              max={2000}
              value={dailyRate}
              onChange={(e) => onRateChange(parseInt(e.target.value) || 100)}
              className="block w-32 px-3 py-2 border border-gray-300 rounded-md"
            />
            <span className="text-sm text-gray-500">/rider/day</span>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Budget Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Riders</span>
            <span>{riders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration</span>
            <span>{days} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Daily Rate</span>
            <span>{formatCurrency(dailyRate)}/rider</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Campaign Cost</span>
            <span className="font-medium">{formatCurrency(totalBudget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee (15%)</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        * Calculation: {riders} riders × {days} days × {formatCurrency(dailyRate)} = {formatCurrency(totalBudget)}
      </p>
    </div>
  );
}
