/**
 * ProvenanceBadge Component
 * 
 * Displays a confidence grade badge (A-D) with color coding and tooltip.
 * Used throughout YETO to indicate data quality and reliability.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, AlertCircle, AlertTriangle, HelpCircle, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

export type ConfidenceGrade = 'A' | 'B' | 'C' | 'D';

export interface ProvenanceBadgeProps {
  /** Confidence grade A-D */
  grade: ConfidenceGrade;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the grade label */
  showLabel?: boolean;
  /** Whether to show the full description */
  showDescription?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether the badge is interactive (clickable) */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// Grade configurations
const gradeConfig: Record<ConfidenceGrade, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  label: { en: string; ar: string };
  description: { en: string; ar: string };
  criteria: { en: string[]; ar: string[] };
}> = {
  A: {
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: ShieldCheck,
    label: { en: 'High Confidence', ar: 'ثقة عالية' },
    description: {
      en: 'Primary source, recent data, clear methodology, corroborated',
      ar: 'مصدر أولي، بيانات حديثة، منهجية واضحة، مؤكدة'
    },
    criteria: {
      en: [
        'Official primary source (CBY, Ministry, UN agency)',
        'Data less than 6 months old',
        'Methodology documented and transparent',
        'Corroborated by at least one other source'
      ],
      ar: [
        'مصدر أولي رسمي (البنك المركزي، وزارة، وكالة أممية)',
        'بيانات أقل من 6 أشهر',
        'منهجية موثقة وشفافة',
        'مؤكدة من مصدر آخر على الأقل'
      ]
    }
  },
  B: {
    color: 'text-[#2e8b6e] dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: CheckCircle,
    label: { en: 'Good Confidence', ar: 'ثقة جيدة' },
    description: {
      en: 'Reliable source, reasonably recent, methodology available',
      ar: 'مصدر موثوق، حديث نسبياً، منهجية متاحة'
    },
    criteria: {
      en: [
        'Established institutional source',
        'Data 6-12 months old',
        'Methodology partially documented',
        'Single authoritative source'
      ],
      ar: [
        'مصدر مؤسسي معتمد',
        'بيانات عمرها 6-12 شهر',
        'منهجية موثقة جزئياً',
        'مصدر موثوق واحد'
      ]
    }
  },
  C: {
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
    label: { en: 'Moderate Confidence', ar: 'ثقة متوسطة' },
    description: {
      en: 'Secondary source, older data, or limited methodology info',
      ar: 'مصدر ثانوي، بيانات قديمة، أو معلومات منهجية محدودة'
    },
    criteria: {
      en: [
        'Secondary or derived source',
        'Data 1-2 years old',
        'Limited methodology documentation',
        'Partial corroboration or expert estimate'
      ],
      ar: [
        'مصدر ثانوي أو مشتق',
        'بيانات عمرها 1-2 سنة',
        'توثيق منهجية محدود',
        'تأكيد جزئي أو تقدير خبير'
      ]
    }
  },
  D: {
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: ShieldQuestion,
    label: { en: 'Low Confidence', ar: 'ثقة منخفضة' },
    description: {
      en: 'Unverified source, outdated, or methodology unclear',
      ar: 'مصدر غير موثق، قديم، أو منهجية غير واضحة'
    },
    criteria: {
      en: [
        'Unverified or informal source',
        'Data more than 2 years old',
        'No methodology documentation',
        'Uncorroborated or conflicting reports'
      ],
      ar: [
        'مصدر غير موثق أو غير رسمي',
        'بيانات أقدم من سنتين',
        'لا يوجد توثيق للمنهجية',
        'تقارير غير مؤكدة أو متعارضة'
      ]
    }
  }
};

export function ProvenanceBadge({
  grade,
  size = 'md',
  showLabel = true,
  showDescription = false,
  className,
  interactive = false,
  onClick,
}: ProvenanceBadgeProps) {
  const { language } = useLanguage();
  const config = gradeConfig[grade];
  const Icon = config.icon;

  // Size classes
  const sizeClasses = {
    sm: {
      badge: 'px-1 py-0 text-xs h-4',
      icon: 'h-3 w-3',
      label: 'text-xs',
    },
    md: {
      badge: 'px-1.5 py-0.5 text-sm h-5',
      icon: 'h-3.5 w-3.5',
      label: 'text-sm',
    },
    lg: {
      badge: 'px-2 py-1 text-base h-7',
      icon: 'h-4 w-4',
      label: 'text-base',
    },
  };

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1 font-medium border',
        config.color,
        config.bgColor,
        config.borderColor,
        sizeClasses[size].badge,
        interactive && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={interactive ? onClick : undefined}
    >
      <Icon className={sizeClasses[size].icon} />
      {showLabel && (
        <span className={sizeClasses[size].label}>
          {grade}
        </span>
      )}
    </Badge>
  );

  if (showDescription) {
    return (
      <div className="flex flex-col gap-1">
        {badgeContent}
        <span className={cn('text-muted-foreground', sizeClasses[size].label)}>
          {config.description[language]}
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>
                {language === 'ar' ? `الدرجة ${grade}: ` : `Grade ${grade}: `}
                {config.label[language]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description[language]}
            </p>
            <div className="text-xs space-y-1">
              <div className="font-medium">
                {language === 'ar' ? 'المعايير:' : 'Criteria:'}
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {config.criteria[language].map((criterion, i) => (
                  <li key={i}>{criterion}</li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Export a legend component for reference
export function ProvenanceLegend({ className }: { className?: string }) {
  const { language } = useLanguage();
  
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {(['A', 'B', 'C', 'D'] as ConfidenceGrade[]).map((grade) => (
        <div key={grade} className="flex items-center gap-2">
          <ProvenanceBadge grade={grade} size="sm" />
          <span className="text-sm text-muted-foreground">
            {gradeConfig[grade].label[language]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ProvenanceBadge;
