/**
 * VerdictBadge Component
 * 
 * Displays tribunal verdict status with appropriate styling:
 * - PASS: Green verified badge
 * - PASS_WARN: Yellow/amber with warnings
 * - FAIL: Red failed badge
 * - DATA_GAP: Gray with data gap indicator
 * - CONTESTED: Orange with conflict indicator
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  AlertOctagon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldQuestion,
} from 'lucide-react';

export type VerdictType = 'PASS' | 'PASS_WARN' | 'FAIL' | 'DATA_GAP' | 'CONTESTED' | 'PENDING';

interface VerdictBadgeProps {
  verdict: VerdictType;
  citationCoverage?: number;
  contradictionScore?: number;
  warnings?: string[];
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const verdictConfig: Record<VerdictType, {
  label: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
  shieldIcon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  descriptionAr: string;
}> = {
  PASS: {
    label: 'Verified',
    labelAr: 'موثق',
    icon: CheckCircle,
    shieldIcon: ShieldCheck,
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
    description: 'This data has been verified by the Evidence Tribunal with ≥95% citation coverage',
    descriptionAr: 'تم التحقق من هذه البيانات بواسطة محكمة الأدلة بتغطية استشهادية ≥95%'
  },
  PASS_WARN: {
    label: 'Verified with Warnings',
    labelAr: 'موثق مع تحذيرات',
    icon: AlertTriangle,
    shieldIcon: ShieldAlert,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
    description: 'Data verified but has minor issues or conflicting sources',
    descriptionAr: 'تم التحقق من البيانات ولكن بها مشاكل بسيطة أو مصادر متعارضة'
  },
  FAIL: {
    label: 'Unverified',
    labelAr: 'غير موثق',
    icon: XCircle,
    shieldIcon: ShieldX,
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/30',
    description: 'This data failed verification - insufficient evidence or high contradiction',
    descriptionAr: 'فشلت هذه البيانات في التحقق - أدلة غير كافية أو تناقض عالي'
  },
  DATA_GAP: {
    label: 'Data Gap',
    labelAr: 'فجوة بيانات',
    icon: HelpCircle,
    shieldIcon: ShieldQuestion,
    bgColor: 'bg-slate-500/10',
    textColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-500/30',
    description: 'No data available for this period or metric',
    descriptionAr: 'لا توجد بيانات متاحة لهذه الفترة أو المقياس'
  },
  CONTESTED: {
    label: 'Contested',
    labelAr: 'متنازع عليه',
    icon: AlertOctagon,
    shieldIcon: Shield,
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/30',
    description: 'Multiple sources disagree - showing all values with provenance',
    descriptionAr: 'مصادر متعددة غير متفقة - عرض جميع القيم مع المصدر'
  },
  PENDING: {
    label: 'Pending Review',
    labelAr: 'قيد المراجعة',
    icon: HelpCircle,
    shieldIcon: Shield,
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/30',
    description: 'This data is awaiting tribunal verification',
    descriptionAr: 'هذه البيانات في انتظار التحقق من المحكمة'
  }
};

const sizeConfig = {
  sm: {
    badge: 'text-xs px-1.5 py-0.5',
    icon: 'h-3 w-3',
    shield: 'h-4 w-4'
  },
  md: {
    badge: 'text-sm px-2 py-1',
    icon: 'h-4 w-4',
    shield: 'h-5 w-5'
  },
  lg: {
    badge: 'text-base px-3 py-1.5',
    icon: 'h-5 w-5',
    shield: 'h-6 w-6'
  }
};

export function VerdictBadge({
  verdict,
  citationCoverage,
  contradictionScore,
  warnings = [],
  showDetails = true,
  size = 'md',
  className,
  onClick
}: VerdictBadgeProps) {
  const config = verdictConfig[verdict];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  const ShieldIcon = config.shieldIcon;
  
  const badge = (
    <Badge
      variant="outline"
      className={cn(
        sizeStyles.badge,
        config.bgColor,
        config.textColor,
        config.borderColor,
        'inline-flex items-center gap-1 font-medium cursor-pointer transition-all hover:opacity-80',
        className
      )}
      onClick={onClick}
    >
      <Icon className={sizeStyles.icon} />
      <span>{config.label}</span>
    </Badge>
  );
  
  if (!showDetails) {
    return badge;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <ShieldIcon className={cn(sizeStyles.shield, config.textColor)} />
            <span className="font-semibold">{config.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
          {citationCoverage !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground">Citation Coverage: </span>
              <span className={cn(
                'font-medium',
                citationCoverage >= 95 ? 'text-emerald-600' :
                citationCoverage >= 80 ? 'text-amber-600' : 'text-red-600'
              )}>
                {citationCoverage.toFixed(1)}%
              </span>
            </div>
          )}
          {contradictionScore !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground">Contradiction Score: </span>
              <span className={cn(
                'font-medium',
                contradictionScore <= 10 ? 'text-emerald-600' :
                contradictionScore <= 30 ? 'text-amber-600' : 'text-red-600'
              )}>
                {contradictionScore.toFixed(0)}
              </span>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="text-sm space-y-1">
              <span className="text-muted-foreground">Warnings:</span>
              <ul className="list-disc list-inside text-amber-600 dark:text-amber-400">
                {warnings.slice(0, 3).map((warning, i) => (
                  <li key={i} className="text-xs">{warning}</li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-xs">+{warnings.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Inline verdict indicator for use in tables/lists
 */
export function VerdictIndicator({
  verdict,
  size = 'sm'
}: {
  verdict: VerdictType;
  size?: 'sm' | 'md';
}) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex', config.textColor)}>
            <Icon className={iconSize} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Full verdict card with all details
 */
export function VerdictCard({
  verdict,
  citationCoverage,
  contradictionScore,
  evidenceStrength,
  warnings = [],
  publishableText,
  className
}: {
  verdict: VerdictType;
  citationCoverage?: number;
  contradictionScore?: number;
  evidenceStrength?: number;
  warnings?: string[];
  publishableText?: string;
  className?: string;
}) {
  const config = verdictConfig[verdict];
  const ShieldIcon = config.shieldIcon;
  
  return (
    <div className={cn(
      'rounded-lg border p-4 space-y-3',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldIcon className={cn('h-6 w-6', config.textColor)} />
          <div>
            <h4 className={cn('font-semibold', config.textColor)}>
              {config.label}
            </h4>
            <p className="text-xs text-muted-foreground">
              {config.labelAr}
            </p>
          </div>
        </div>
        <VerdictBadge verdict={verdict} showDetails={false} />
      </div>
      
      <p className="text-sm text-muted-foreground">
        {config.description}
      </p>
      
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {citationCoverage !== undefined && (
          <div className="rounded bg-background/50 p-2">
            <div className={cn(
              'text-lg font-bold',
              citationCoverage >= 95 ? 'text-emerald-600' :
              citationCoverage >= 80 ? 'text-amber-600' : 'text-red-600'
            )}>
              {citationCoverage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Citations</div>
          </div>
        )}
        {contradictionScore !== undefined && (
          <div className="rounded bg-background/50 p-2">
            <div className={cn(
              'text-lg font-bold',
              contradictionScore <= 10 ? 'text-emerald-600' :
              contradictionScore <= 30 ? 'text-amber-600' : 'text-red-600'
            )}>
              {contradictionScore.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Conflicts</div>
          </div>
        )}
        {evidenceStrength !== undefined && (
          <div className="rounded bg-background/50 p-2">
            <div className={cn(
              'text-lg font-bold',
              evidenceStrength >= 80 ? 'text-emerald-600' :
              evidenceStrength >= 60 ? 'text-amber-600' : 'text-red-600'
            )}>
              {evidenceStrength.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Strength</div>
          </div>
        )}
      </div>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          <h5 className="text-xs font-medium text-muted-foreground">Warnings</h5>
          <ul className="space-y-1">
            {warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Publishable Text */}
      {publishableText && (
        <div className="rounded bg-background/50 p-2">
          <h5 className="text-xs font-medium text-muted-foreground mb-1">
            Verified Statement
          </h5>
          <p className="text-sm">{publishableText}</p>
        </div>
      )}
    </div>
  );
}

export default VerdictBadge;
