// Solo Advertiser — Business Portal
// Loading skeleton placeholder component
// Animated pulse effect for content loading states

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export default function LoadingSkeleton({ className = 'h-4', count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}
