/**
 * Review Mode Banner
 * 
 * Displays a sticky banner when the platform is in review mode.
 * Shows in both English and Arabic based on current language.
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Eye, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function ReviewModeBanner() {
  const { language } = useLanguage();
  const { data: status } = trpc.system.reviewModeStatus.useQuery(undefined, {
    staleTime: Infinity, // Only fetch once
    refetchOnWindowFocus: false,
  });
  
  // Don't show banner if not in review mode
  if (!status?.enabled) {
    return null;
  }
  
  const isRTL = language === 'ar';
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-black py-2 px-4 shadow-lg"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm font-medium">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <Eye className="h-4 w-4 flex-shrink-0" />
        <span>
          {isRTL ? status.messageAr : status.message}
        </span>
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs opacity-75">
          ({status.environment})
        </span>
      </div>
    </div>
  );
}

/**
 * Hook to check if we're in review mode
 */
export function useReviewMode() {
  const { data: status } = trpc.system.reviewModeStatus.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  
  return {
    isReviewMode: status?.enabled ?? false,
    environment: status?.environment ?? 'local',
    message: status?.message ?? null,
    messageAr: status?.messageAr ?? null
  };
}

/**
 * Component to disable buttons in review mode
 */
export function ReviewModeGuard({ 
  children, 
  action = 'button' 
}: { 
  children: React.ReactNode;
  action?: string;
}) {
  const { isReviewMode } = useReviewMode();
  const { language } = useLanguage();
  
  if (!isReviewMode) {
    return <>{children}</>;
  }
  
  const tooltip = language === 'ar' 
    ? 'معطل في وضع المراجعة'
    : 'Disabled in review mode';
  
  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-black/80 text-white text-xs px-2 py-1 rounded">
          {tooltip}
        </span>
      </div>
    </div>
  );
}
