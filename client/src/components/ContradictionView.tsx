/**
 * YETO Platform - Contradiction View Component
 * Section 8C: Visual display of data contradictions between sources
 */

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Contradiction {
  id: number;
  indicatorCode: string;
  date: Date;
  regimeTag: string;
  value1: number;
  source1: string;
  value2: number;
  source2: string;
  discrepancyPercent: number;
  discrepancyType: 'minor' | 'significant' | 'major' | 'critical';
  plausibleReasons: string[];
  status: 'detected' | 'investigating' | 'explained' | 'resolved';
  resolvedValue?: number;
  resolvedSource?: string;
  detectedAt: Date;
  resolvedAt?: Date;
}

interface ContradictionViewProps {
  contradiction: Contradiction;
  language?: 'en' | 'ar';
  onResolve?: (id: number) => void;
  onInvestigate?: (id: number) => void;
  className?: string;
}

const DISCREPANCY_COLORS = {
  minor: { bg: '#e6f4ec', text: '#107040', border: '#107040' },
  significant: { bg: '#faf6e6', text: '#C0A030', border: '#C0A030' },
  major: { bg: '#fff3e6', text: '#d97706', border: '#d97706' },
  critical: { bg: '#fde8e8', text: '#c53030', border: '#c53030' },
};

const STATUS_CONFIG = {
  detected: { label: { en: 'Detected', ar: 'تم الكشف' }, color: '#c53030', bg: '#fde8e8' },
  investigating: { label: { en: 'Investigating', ar: 'قيد التحقيق' }, color: '#d97706', bg: '#fff3e6' },
  explained: { label: { en: 'Explained', ar: 'تم التفسير' }, color: '#1a6b9c', bg: '#e6f0f7' },
  resolved: { label: { en: 'Resolved', ar: 'تم الحل' }, color: '#107040', bg: '#e6f4ec' },
};

export function ContradictionView({
  contradiction,
  language = 'en',
  onResolve,
  onInvestigate,
  className,
}: ContradictionViewProps) {
  const discrepancyColor = DISCREPANCY_COLORS[contradiction.discrepancyType];
  const statusConfig = STATUS_CONFIG[contradiction.status];
  
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-amber-500">⚠</span>
            {language === 'ar' ? 'تناقض في البيانات' : 'Data Contradiction'}
          </CardTitle>
          <Badge
            style={{
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              borderColor: statusConfig.color,
            }}
            variant="outline"
          >
            {statusConfig.label[language]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Indicator Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {language === 'ar' ? 'المؤشر:' : 'Indicator:'}
          </span>
          <span className="font-medium">{contradiction.indicatorCode}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {language === 'ar' ? 'التاريخ:' : 'Date:'}
          </span>
          <span className="font-medium">
            {new Date(contradiction.date).toLocaleDateString()}
          </span>
        </div>
        
        {/* Discrepancy Visual */}
        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: discrepancyColor.bg,
            borderColor: discrepancyColor.border,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-medium capitalize"
              style={{ color: discrepancyColor.text }}
            >
              {contradiction.discrepancyType} {language === 'ar' ? 'تناقض' : 'Discrepancy'}
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: discrepancyColor.text }}
            >
              {contradiction.discrepancyPercent.toFixed(1)}%
            </span>
          </div>
          
          {/* Value Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{contradiction.source1}</p>
              <p className="text-xl font-bold text-gray-900">
                {formatValue(contradiction.value1)}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{contradiction.source2}</p>
              <p className="text-xl font-bold text-gray-900">
                {formatValue(contradiction.value2)}
              </p>
            </div>
          </div>
          
          {/* Difference Arrow */}
          <div className="flex items-center justify-center my-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: discrepancyColor.text }}>
              <span>Δ = {formatValue(Math.abs(contradiction.value1 - contradiction.value2))}</span>
            </div>
          </div>
        </div>
        
        {/* Plausible Reasons */}
        {contradiction.plausibleReasons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {language === 'ar' ? 'الأسباب المحتملة:' : 'Plausible Reasons:'}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {contradiction.plausibleReasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Resolved Value */}
        {contradiction.status === 'resolved' && contradiction.resolvedValue !== undefined && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <span className="font-medium">
                {language === 'ar' ? 'القيمة المعتمدة:' : 'Resolved Value:'}
              </span>{' '}
              {formatValue(contradiction.resolvedValue)}
              {contradiction.resolvedSource && (
                <span className="text-green-600"> ({contradiction.resolvedSource})</span>
              )}
            </p>
          </div>
        )}
        
        {/* Actions */}
        {contradiction.status !== 'resolved' && (onResolve || onInvestigate) && (
          <div className="flex gap-2 pt-2">
            {onInvestigate && contradiction.status === 'detected' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInvestigate(contradiction.id)}
                className="flex-1"
              >
                {language === 'ar' ? 'بدء التحقيق' : 'Investigate'}
              </Button>
            )}
            {onResolve && (
              <Button
                size="sm"
                onClick={() => onResolve(contradiction.id)}
                className="flex-1"
              >
                {language === 'ar' ? 'حل التناقض' : 'Resolve'}
              </Button>
            )}
          </div>
        )}
        
        {/* Metadata */}
        <div className="pt-3 border-t text-xs text-gray-400">
          <p>
            {language === 'ar' ? 'تم الكشف:' : 'Detected:'}{' '}
            {new Date(contradiction.detectedAt).toLocaleString()}
          </p>
          {contradiction.resolvedAt && (
            <p>
              {language === 'ar' ? 'تم الحل:' : 'Resolved:'}{' '}
              {new Date(contradiction.resolvedAt).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact list view for multiple contradictions
interface ContradictionListProps {
  contradictions: Contradiction[];
  language?: 'en' | 'ar';
  onSelect?: (id: number) => void;
  className?: string;
}

export function ContradictionList({
  contradictions,
  language = 'en',
  onSelect,
  className,
}: ContradictionListProps) {
  if (contradictions.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <p className="text-lg mb-2">✓</p>
        <p className="text-sm">
          {language === 'ar' 
            ? 'لم يتم العثور على تناقضات' 
            : 'No contradictions found'}
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      {contradictions.map((c) => {
        const discrepancyColor = DISCREPANCY_COLORS[c.discrepancyType];
        const statusConfig = STATUS_CONFIG[c.status];
        
        return (
          <div
            key={c.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors',
              onSelect && 'cursor-pointer'
            )}
            onClick={() => onSelect?.(c.id)}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: discrepancyColor.text }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.indicatorCode}</p>
              <p className="text-xs text-gray-500">
                {c.source1} vs {c.source2}
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-sm font-bold"
                style={{ color: discrepancyColor.text }}
              >
                {c.discrepancyPercent.toFixed(1)}%
              </p>
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  borderColor: statusConfig.color,
                }}
              >
                {statusConfig.label[language]}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Summary statistics component
interface ContradictionStatsProps {
  stats: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentDetections: number;
  };
  language?: 'en' | 'ar';
  className?: string;
}

export function ContradictionStats({
  stats,
  language = 'en',
  className,
}: ContradictionStatsProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <StatCard
        label={language === 'ar' ? 'إجمالي التناقضات' : 'Total Contradictions'}
        value={stats.total}
        color="#6b7280"
      />
      <StatCard
        label={language === 'ar' ? 'قيد التحقيق' : 'Under Investigation'}
        value={stats.byStatus.investigating || 0}
        color="#d97706"
      />
      <StatCard
        label={language === 'ar' ? 'تم الحل' : 'Resolved'}
        value={stats.byStatus.resolved || 0}
        color="#107040"
      />
      <StatCard
        label={language === 'ar' ? 'اكتشافات حديثة' : 'Recent Detections'}
        value={stats.recentDetections}
        color="#c53030"
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default ContradictionView;
