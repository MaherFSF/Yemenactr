/**
 * YETO Platform - Confidence Rating Component
 * Section 8B: Visual display of A-D confidence ratings
 */

import { cn } from '@/lib/utils';

interface ConfidenceRatingProps {
  rating: 'A' | 'B' | 'C' | 'D';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDescription?: boolean;
  language?: 'en' | 'ar';
  className?: string;
}

const RATING_CONFIG = {
  A: {
    label: { en: 'Highly Reliable', ar: 'موثوق للغاية' },
    description: { 
      en: 'Official/audited data with consistent methodology',
      ar: 'بيانات رسمية/مدققة بمنهجية متسقة'
    },
    color: '#2e8b6e',
    bgColor: '#e6f4ec',
    borderColor: '#2e8b6e',
  },
  B: {
    label: { en: 'Reliable', ar: 'موثوق' },
    description: {
      en: 'Credible source but may have partial coverage or lag',
      ar: 'مصدر موثوق لكن قد يكون جزئي التغطية أو متأخر'
    },
    color: '#1a6b9c',
    bgColor: '#e6f0f7',
    borderColor: '#1a6b9c',
  },
  C: {
    label: { en: 'Moderate', ar: 'متوسط' },
    description: {
      en: 'Proxy/modelled data with some uncertainty',
      ar: 'بيانات تقريبية/نموذجية مع بعض عدم اليقين'
    },
    color: '#C0A030',
    bgColor: '#faf6e6',
    borderColor: '#C0A030',
  },
  D: {
    label: { en: 'Low Reliability', ar: 'موثوقية منخفضة' },
    description: {
      en: 'Disputed or low reliability - use with caution',
      ar: 'متنازع عليها أو منخفضة الموثوقية - استخدم بحذر'
    },
    color: '#c53030',
    bgColor: '#fde8e8',
    borderColor: '#c53030',
  },
};

const SIZE_CONFIG = {
  sm: {
    badge: 'w-5 h-5 text-xs',
    label: 'text-xs',
    description: 'text-xs',
  },
  md: {
    badge: 'w-7 h-7 text-sm',
    label: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    badge: 'w-10 h-10 text-lg',
    label: 'text-base font-medium',
    description: 'text-sm',
  },
};

export function ConfidenceRating({
  rating,
  size = 'md',
  showLabel = false,
  showDescription = false,
  language = 'en',
  className,
}: ConfidenceRatingProps) {
  const config = RATING_CONFIG[rating];
  const sizeConfig = SIZE_CONFIG[size];
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Rating Badge */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeConfig.badge
        )}
        style={{
          backgroundColor: config.bgColor,
          color: config.color,
          border: `2px solid ${config.borderColor}`,
        }}
        title={config.label[language]}
      >
        {rating}
      </div>
      
      {/* Label and Description */}
      {(showLabel || showDescription) && (
        <div className="flex flex-col">
          {showLabel && (
            <span
              className={cn(sizeConfig.label)}
              style={{ color: config.color }}
            >
              {config.label[language]}
            </span>
          )}
          {showDescription && (
            <span className={cn(sizeConfig.description, 'text-gray-500')}>
              {config.description[language]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Warning banner for D-rated data
interface DataWarningBannerProps {
  language?: 'en' | 'ar';
  className?: string;
}

export function DataWarningBanner({ language = 'en', className }: DataWarningBannerProps) {
  const message = language === 'ar'
    ? 'تحذير: هذه البيانات ذات موثوقية منخفضة. استخدمها بحذر وتحقق من مصادر بديلة.'
    : 'Warning: This data has low reliability. Use with caution and verify with alternative sources.';
  
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        className
      )}
      style={{
        backgroundColor: '#fde8e8',
        borderColor: '#c53030',
      }}
    >
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="#c53030"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm" style={{ color: '#c53030' }}>
        {message}
      </span>
    </div>
  );
}

// Rating legend component
interface RatingLegendProps {
  language?: 'en' | 'ar';
  compact?: boolean;
  className?: string;
}

export function RatingLegend({ language = 'en', compact = false, className }: RatingLegendProps) {
  const ratings: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {ratings.map(r => (
          <ConfidenceRating key={r} rating={r} size="sm" language={language} />
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-gray-700">
        {language === 'ar' ? 'مفتاح تصنيف الموثوقية' : 'Confidence Rating Key'}
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {ratings.map(r => (
          <ConfidenceRating
            key={r}
            rating={r}
            size="sm"
            showLabel
            language={language}
          />
        ))}
      </div>
    </div>
  );
}

// Score breakdown component
interface ScoreBreakdownProps {
  scores: {
    sourceCredibility: number;
    dataCompleteness: number;
    timeliness: number;
    consistency: number;
    methodology: number;
    overall: number;
  };
  language?: 'en' | 'ar';
  className?: string;
}

export function ScoreBreakdown({ scores, language = 'en', className }: ScoreBreakdownProps) {
  const labels = {
    sourceCredibility: { en: 'Source Credibility', ar: 'مصداقية المصدر' },
    dataCompleteness: { en: 'Data Completeness', ar: 'اكتمال البيانات' },
    timeliness: { en: 'Timeliness', ar: 'التوقيت' },
    consistency: { en: 'Consistency', ar: 'الاتساق' },
    methodology: { en: 'Methodology', ar: 'المنهجية' },
    overall: { en: 'Overall Score', ar: 'الدرجة الإجمالية' },
  };
  
  const getBarColor = (score: number) => {
    if (score >= 85) return '#2e8b6e';
    if (score >= 70) return '#1a6b9c';
    if (score >= 50) return '#C0A030';
    return '#c53030';
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      {Object.entries(scores).map(([key, value]) => (
        <div key={key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">
              {labels[key as keyof typeof labels][language]}
            </span>
            <span className="font-medium">{value}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${value}%`,
                backgroundColor: getBarColor(value),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ConfidenceRating;
