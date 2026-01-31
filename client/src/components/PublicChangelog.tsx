/**
 * YETO Platform - Public Changelog Component
 * Section 8E: Visual display of public data updates and corrections
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChangelogEntry {
  id: number;
  changeType: string;
  affectedDatasetIds: number[];
  affectedIndicatorCodes: string[];
  affectedDocumentIds: number[];
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedDateRange?: { start: string; end: string };
  isPublic: boolean;
  publishedAt: Date;
  publishedByName?: string;
}

interface PublicChangelogProps {
  entries: ChangelogEntry[];
  language?: 'en' | 'ar';
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

const CHANGE_TYPE_CONFIG: Record<string, {
  label: { en: string; ar: string };
  icon: string;
  color: string;
  bgColor: string;
}> = {
  dataset_added: {
    label: { en: 'New Dataset', ar: 'مجموعة بيانات جديدة' },
    icon: '📊',
    color: '#2e8b6e',
    bgColor: '#e6f4ec',
  },
  dataset_updated: {
    label: { en: 'Dataset Updated', ar: 'تحديث البيانات' },
    icon: '🔄',
    color: '#1a6b9c',
    bgColor: '#e6f0f7',
  },
  document_added: {
    label: { en: 'New Document', ar: 'وثيقة جديدة' },
    icon: '📄',
    color: '#7c3aed',
    bgColor: '#f3e8ff',
  },
  methodology_change: {
    label: { en: 'Methodology Change', ar: 'تغيير المنهجية' },
    icon: '📐',
    color: '#d97706',
    bgColor: '#fff3e6',
  },
  correction: {
    label: { en: 'Correction', ar: 'تصحيح' },
    icon: '✏️',
    color: '#c53030',
    bgColor: '#fde8e8',
  },
  source_added: {
    label: { en: 'New Source', ar: 'مصدر جديد' },
    icon: '🔗',
    color: '#0891b2',
    bgColor: '#e0f7fa',
  },
  indicator_added: {
    label: { en: 'New Indicator', ar: 'مؤشر جديد' },
    icon: '📈',
    color: '#059669',
    bgColor: '#d1fae5',
  },
};

const IMPACT_CONFIG = {
  low: {
    label: { en: 'Minor', ar: 'طفيف' },
    color: '#2e8b6e',
    bgColor: '#e6f4ec',
  },
  medium: {
    label: { en: 'Moderate', ar: 'متوسط' },
    color: '#d97706',
    bgColor: '#fff3e6',
  },
  high: {
    label: { en: 'Significant', ar: 'كبير' },
    color: '#c53030',
    bgColor: '#fde8e8',
  },
};

export function PublicChangelog({
  entries,
  language = 'en',
  onLoadMore,
  hasMore = false,
  loading = false,
  className,
}: PublicChangelogProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return language === 'ar' ? 'اليوم' : 'Today';
    if (diffDays === 1) return language === 'ar' ? 'أمس' : 'Yesterday';
    if (diffDays < 7) return language === 'ar' ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
    
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-12 text-gray-500', className)}>
        <p className="text-4xl mb-4">📋</p>
        <p className="text-lg font-medium mb-2">
          {language === 'ar' ? 'لا توجد تحديثات حتى الآن' : 'No updates yet'}
        </p>
        <p className="text-sm">
          {language === 'ar' 
            ? 'ستظهر التحديثات هنا عند إضافة بيانات جديدة'
            : 'Updates will appear here when new data is added'}
        </p>
      </div>
    );
  }
  
  // Group entries by date
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.publishedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, ChangelogEntry[]>);
  
  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(groupedEntries).map(([dateStr, dayEntries]) => (
        <div key={dateStr}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm font-medium text-gray-500">
              {formatDate(new Date(dateStr))}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          
          {/* Day's entries */}
          <div className="space-y-3">
            {dayEntries.map((entry) => {
              const typeConfig = CHANGE_TYPE_CONFIG[entry.changeType] || {
                label: { en: entry.changeType, ar: entry.changeType },
                icon: '📋',
                color: '#6b7280',
                bgColor: '#f3f4f6',
              };
              const impactConfig = IMPACT_CONFIG[entry.impactLevel];
              const isExpanded = expandedId === entry.id;
              
              return (
                <Card
                  key={entry.id}
                  className={cn(
                    'transition-all cursor-pointer hover:shadow-md',
                    isExpanded && 'ring-2 ring-blue-200'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: typeConfig.bgColor }}
                      >
                        {typeConfig.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: typeConfig.bgColor,
                              color: typeConfig.color,
                              borderColor: typeConfig.color,
                            }}
                          >
                            {typeConfig.label[language]}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              backgroundColor: impactConfig.bgColor,
                              color: impactConfig.color,
                              borderColor: impactConfig.color,
                            }}
                          >
                            {impactConfig.label[language]}
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-1">
                          {language === 'ar' ? entry.titleAr : entry.titleEn}
                        </h3>
                        
                        <p className={cn(
                          'text-sm text-gray-600',
                          !isExpanded && 'line-clamp-2'
                        )}>
                          {language === 'ar' ? entry.descriptionAr : entry.descriptionEn}
                        </p>
                        
                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            {/* Affected items */}
                            {entry.affectedIndicatorCodes.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  {language === 'ar' ? 'المؤشرات المتأثرة:' : 'Affected Indicators:'}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {entry.affectedIndicatorCodes.map((code) => (
                                    <Badge key={code} variant="secondary" className="text-xs">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Date range */}
                            {entry.affectedDateRange && (
                              <p className="text-xs text-gray-500">
                                {language === 'ar' ? 'الفترة المتأثرة: ' : 'Affected Period: '}
                                {entry.affectedDateRange.start} - {entry.affectedDateRange.end}
                              </p>
                            )}
                            
                            {/* Publisher */}
                            {entry.publishedByName && (
                              <p className="text-xs text-gray-400">
                                {language === 'ar' ? 'نشر بواسطة: ' : 'Published by: '}
                                {entry.publishedByName}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Time */}
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(entry.publishedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Load more button */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading 
              ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
              : (language === 'ar' ? 'تحميل المزيد' : 'Load More')}
          </Button>
        </div>
      )}
    </div>
  );
}

// Changelog stats summary
interface ChangelogStatsProps {
  stats: {
    total: number;
    byType: Record<string, number>;
    byImpact: Record<string, number>;
    recentCount: number;
    thisMonth: number;
  };
  language?: 'en' | 'ar';
  className?: string;
}

export function ChangelogStats({
  stats,
  language = 'en',
  className,
}: ChangelogStatsProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {language === 'ar' ? 'إحصائيات التحديثات' : 'Update Statistics'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label={language === 'ar' ? 'إجمالي التحديثات' : 'Total Updates'}
            value={stats.total}
            color="#6b7280"
          />
          <StatCard
            label={language === 'ar' ? 'هذا الشهر' : 'This Month'}
            value={stats.thisMonth}
            color="#1a6b9c"
          />
          <StatCard
            label={language === 'ar' ? 'آخر 7 أيام' : 'Last 7 Days'}
            value={stats.recentCount}
            color="#2e8b6e"
          />
          <StatCard
            label={language === 'ar' ? 'تغييرات كبيرة' : 'High Impact'}
            value={stats.byImpact.high || 0}
            color="#c53030"
          />
        </div>
        
        {/* By type breakdown */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">
            {language === 'ar' ? 'حسب النوع' : 'By Type'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats.byType).map(([type, count]) => {
              const config = CHANGE_TYPE_CONFIG[type];
              if (!config || count === 0) return null;
              
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 p-2 rounded-lg"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <span>{config.icon}</span>
                  <span className="text-sm flex-1" style={{ color: config.color }}>
                    {config.label[language]}
                  </span>
                  <span className="font-medium" style={{ color: config.color }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// RSS feed link component
interface RSSLinkProps {
  feedUrl: string;
  language?: 'en' | 'ar';
  className?: string;
}

export function RSSLink({ feedUrl, language = 'en', className }: RSSLinkProps) {
  return (
    <a
      href={feedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-sm',
        className
      )}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
      </svg>
      {language === 'ar' ? 'اشترك في RSS' : 'Subscribe to RSS'}
    </a>
  );
}

export default PublicChangelog;
