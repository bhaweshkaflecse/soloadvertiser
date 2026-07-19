// Solo Advertiser — Business Portal
// Capacity meter component (X/Y progress bar)
// Shows rider fulfillment progress for a campaign

interface CapacityMeterProps {
  current: number;
  target: number;
  showLabel?: boolean;
}

export default function CapacityMeter({ current, target, showLabel = false }: CapacityMeterProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Capacity</span>
          <span className="font-medium">{current}/{target} riders</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
