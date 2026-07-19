import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  animated?: boolean;
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export interface SkeletonCardProps {
  className?: string;
  hasImage?: boolean;
  hasFooter?: boolean;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = 'md',
  className = '',
  animated = true,
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-gray-200 ${roundedClasses[rounded]} ${animated ? 'animate-pulse' : ''} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '75%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  hasImage = false,
  hasFooter = false,
}) => {
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`} aria-hidden="true">
      {hasImage && <Skeleton height={200} width="100%" rounded="none" />}
      <div className="p-4 space-y-3">
        <Skeleton height={20} width="60%" />
        <SkeletonText lines={2} />
      </div>
      {hasFooter && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Skeleton height={32} width="30%" />
        </div>
      )}
    </div>
  );
};
