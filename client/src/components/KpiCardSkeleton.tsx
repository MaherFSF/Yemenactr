import { cn } from '@/lib/utils';

interface KpiCardSkeletonProps {
  className?: string;
  variant?: 'hero' | 'row';
}

export function KpiCardSkeleton({ className = '', variant = 'hero' }: KpiCardSkeletonProps) {
  if (variant === 'row') {
    return (
      <div className={cn('bg-white rounded-xl p-5 shadow-lg', className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Hero variant - floating cards
  return (
    <div className={cn('bg-white rounded-xl shadow-lg p-4 w-44', className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mb-1" />
      <div className="h-3 w-14 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-6 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

// Grid of skeleton cards for the KPI row section
export function KpiRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <KpiCardSkeleton key={i} variant="row" />
      ))}
    </div>
  );
}

// Hero section floating skeleton cards
export function HeroKpiSkeleton() {
  return (
    <>
      {/* Top Left */}
      <div className="absolute top-0 left-0">
        <KpiCardSkeleton variant="hero" />
      </div>
      {/* Top Right */}
      <div className="absolute top-0 right-0">
        <KpiCardSkeleton variant="hero" />
      </div>
      {/* Bottom Left */}
      <div className="absolute bottom-0 left-0">
        <KpiCardSkeleton variant="hero" />
      </div>
      {/* Bottom Right */}
      <div className="absolute bottom-0 right-0">
        <KpiCardSkeleton variant="hero" />
      </div>
    </>
  );
}

export default KpiCardSkeleton;
