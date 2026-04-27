import React from 'react';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg ${className}`} />
);

export default function LoadingSkeletons() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Main Content Skeletons */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64 w-full rounded-[24px]" />
        <Skeleton className="h-48 w-full rounded-[24px]" />
      </div>
    </div>
  );
}
