/**
 * YETO Platform - Data Quality Monitor Component
 * Yemen Economic Transparency Observatory
 * 
 * Displays data quality metrics, validation results, and alerts
 * per master prompt Section 6.3 requirements
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Database,
  Clock,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================
// Types
// ============================================

interface QualityMetric {
  name: string;
  nameAr: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  details?: string;
  detailsAr?: string;
}

interface DataAlert {
  id: string;
  severity: 'info' | 'warning' | 'error';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: Date;
  source?: string;
}

// ============================================
// Sample Data (would come from API in production)
// ============================================

const QUALITY_METRICS: QualityMetric[] = [
  {
    name: 'Schema Compliance',
    nameAr: 'التوافق مع المخطط',
    score: 98,
    status: 'good',
    details: 'All required fields present',
    detailsAr: 'جميع الحقول المطلوبة موجودة',
  },
  {
    name: 'Data Freshness',
    nameAr: 'حداثة البيانات',
    score: 85,
    status: 'good',
    details: 'Last update: 2 hours ago',
    detailsAr: 'آخر تحديث: منذ ساعتين',
  },
  {
    name: 'Completeness',
    nameAr: 'الاكتمال',
    score: 72,
    status: 'warning',
    details: '28% of indicators have gaps',
    detailsAr: '28% من المؤشرات بها فجوات',
  },
  {
    name: 'Consistency',
    nameAr: 'الاتساق',
    score: 91,
    status: 'good',
    details: 'Cross-source validation passed',
    detailsAr: 'تم اجتياز التحقق من المصادر المتعددة',
  },
  {
    name: 'Provenance',
    nameAr: 'المصدر',
    score: 95,
    status: 'good',
    details: 'All data points have source attribution',
    detailsAr: 'جميع نقاط البيانات لها إسناد مصدر',
  },
  {
    name: 'Timeliness',
    nameAr: 'التوقيت',
    score: 68,
    status: 'warning',
    details: 'Some indicators are 3+ months old',
    detailsAr: 'بعض المؤشرات عمرها أكثر من 3 أشهر',
  },
];

const DATA_ALERTS: DataAlert[] = [
  {
    id: '1',
    severity: 'warning',
    title: 'Exchange Rate Discrepancy',
    titleAr: 'تباين في سعر الصرف',
    message: 'World Bank and CBY exchange rate data differ by 5.2% for Q3 2024',
    messageAr: 'بيانات سعر الصرف من البنك الدولي والبنك المركزي اليمني تختلف بنسبة 5.2% للربع الثالث 2024',
    timestamp: new Date(Date.now() - 3600000),
    source: 'World Bank vs CBY',
  },
  {
    id: '2',
    severity: 'info',
    title: 'New Data Available',
    titleAr: 'بيانات جديدة متاحة',
    message: 'WFP food price data updated for December 2024',
    messageAr: 'تم تحديث بيانات أسعار الغذاء من برنامج الغذاء العالمي لديسمبر 2024',
    timestamp: new Date(Date.now() - 7200000),
    source: 'WFP',
  },
  {
    id: '3',
    severity: 'error',
    title: 'Data Source Unavailable',
    titleAr: 'مصدر البيانات غير متاح',
    message: 'HDX API returned 503 error - humanitarian needs data may be stale',
    messageAr: 'واجهة HDX أرجعت خطأ 503 - قد تكون بيانات الاحتياجات الإنسانية قديمة',
    timestamp: new Date(Date.now() - 1800000),
    source: 'HDX HAPI',
  },
];

// ============================================
// Quality Score Card
// ============================================

function QualityScoreCard({ metric }: { metric: QualityMetric }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600';
    }
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">
          {isArabic ? metric.nameAr : metric.name}
        </span>
        <span className={`font-bold ${getStatusColor(metric.status)}`}>
          {metric.score}%
        </span>
      </div>
      <Progress 
        value={metric.score} 
        className="h-2"
        style={{ 
          '--progress-background': getProgressColor(metric.score) 
        } as React.CSSProperties}
      />
      <p className="text-xs text-muted-foreground mt-2">
        {isArabic ? metric.detailsAr : metric.details}
      </p>
    </div>
  );
}

// ============================================
// Alert Card
// ============================================

function AlertCard({ alert }: { alert: DataAlert }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getAlertBg = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getAlertBg(alert.severity)}`}>
      <div className="flex items-start gap-3">
        {getAlertIcon(alert.severity)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm">
              {isArabic ? alert.titleAr : alert.title}
            </h4>
            {alert.source && (
              <Badge variant="outline" className="text-xs shrink-0">
                {alert.source}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isArabic ? alert.messageAr : alert.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {alert.timestamp.toLocaleString(isArabic ? 'ar-YE' : 'en-US')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Overall Score
// ============================================

function OverallScore() {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  
  const avgScore = Math.round(
    QUALITY_METRICS.reduce((sum, m) => sum + m.score, 0) / QUALITY_METRICS.length
  );
  
  const getGrade = (score: number) => {
    if (score >= 90) return { letter: 'A', label: isArabic ? 'ممتاز' : 'Excellent' };
    if (score >= 80) return { letter: 'B', label: isArabic ? 'جيد جداً' : 'Very Good' };
    if (score >= 70) return { letter: 'C', label: isArabic ? 'جيد' : 'Good' };
    if (score >= 60) return { letter: 'D', label: isArabic ? 'مقبول' : 'Fair' };
    return { letter: 'F', label: isArabic ? 'ضعيف' : 'Poor' };
  };
  
  const grade = getGrade(avgScore);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {isArabic ? 'درجة جودة البيانات' : 'Data Quality Score'}
        </CardTitle>
        <CardDescription>
          {isArabic ? 'التقييم الشامل لجودة البيانات' : 'Overall data quality assessment'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${avgScore * 2.51} 251`}
                className={
                  avgScore >= 80 ? 'text-green-500' :
                  avgScore >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{avgScore}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-4xl font-bold ${
                avgScore >= 80 ? 'text-green-600' :
                avgScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {grade.letter}
              </span>
              <Badge variant="outline">{grade.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {isArabic 
                ? `${QUALITY_METRICS.length} مقاييس تم تقييمها`
                : `${QUALITY_METRICS.length} metrics evaluated`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function DataQualityMonitor() {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <OverallScore />
      
      {/* Quality Metrics Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isArabic ? 'مقاييس الجودة' : 'Quality Metrics'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'تقييم تفصيلي لكل بُعد من أبعاد جودة البيانات'
              : 'Detailed assessment of each data quality dimension'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUALITY_METRICS.map((metric) => (
              <QualityScoreCard key={metric.name} metric={metric} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {isArabic ? 'تنبيهات البيانات' : 'Data Alerts'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'مشكلات وتحديثات تتطلب الانتباه'
              : 'Issues and updates requiring attention'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DATA_ALERTS.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Data Source Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {isArabic ? 'ملخص المصادر' : 'Source Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-green-600">4</p>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'مصادر نشطة' : 'Active Sources'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-blue-600">47</p>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'مؤشرات' : 'Indicators'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-purple-600">1.2M</p>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'نقاط بيانات' : 'Data Points'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">2</p>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'تحذيرات' : 'Warnings'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataQualityMonitor;
