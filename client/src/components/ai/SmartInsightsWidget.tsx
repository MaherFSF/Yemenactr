/**
 * Smart Insights Widget
 * AI-powered insights that appear on the Dashboard
 * Uses One Brain to generate contextual insights from current data
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  confidence: number;
  sector?: string;
  indicator?: string;
  action?: {
    label: string;
    labelAr: string;
    href: string;
  };
}

// Mock insights - in production these would come from One Brain
const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'trend',
    title: 'Exchange Rate Stabilization',
    titleAr: 'استقرار سعر الصرف',
    description: 'The Aden parallel rate has stabilized around 1,890-1,950 YER/USD over the past 2 weeks, suggesting reduced market volatility.',
    descriptionAr: 'استقر سعر الصرف الموازي في عدن حول 1,890-1,950 ريال/دولار خلال الأسبوعين الماضيين، مما يشير إلى انخفاض تقلبات السوق.',
    confidence: 0.85,
    sector: 'currency',
    indicator: 'exchange_rate',
    action: {
      label: 'View Currency Sector',
      labelAr: 'عرض قطاع العملة',
      href: '/sectors/currency'
    }
  },
  {
    id: '2',
    type: 'anomaly',
    title: 'Unusual Aid Flow Pattern',
    titleAr: 'نمط غير عادي لتدفقات المساعدات',
    description: 'Q4 2025 humanitarian funding is 23% below the 5-year average for this period. This may indicate donor fatigue or shifting priorities.',
    descriptionAr: 'تمويل الربع الرابع 2025 الإنساني أقل بنسبة 23% من متوسط الخمس سنوات لهذه الفترة. قد يشير هذا إلى إرهاق المانحين أو تغير الأولويات.',
    confidence: 0.78,
    sector: 'aid-flows',
    action: {
      label: 'Explore Aid Data',
      labelAr: 'استكشف بيانات المساعدات',
      href: '/sectors/aid-flows'
    }
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Inflation Forecast',
    titleAr: 'توقعات التضخم',
    description: 'Based on current trends, inflation is projected to remain between 14-16% through Q1 2026, with food prices being the primary driver.',
    descriptionAr: 'بناءً على الاتجاهات الحالية، من المتوقع أن يظل التضخم بين 14-16% خلال الربع الأول 2026، مع كون أسعار الغذاء المحرك الرئيسي.',
    confidence: 0.72,
    sector: 'prices',
    action: {
      label: 'View Price Analysis',
      labelAr: 'عرض تحليل الأسعار',
      href: '/sectors/prices'
    }
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Data Gap Identified',
    titleAr: 'تم تحديد فجوة بيانات',
    description: 'Trade data from Aden port has not been updated since October 2025. Consider checking alternative sources or contacting port authorities.',
    descriptionAr: 'لم يتم تحديث بيانات التجارة من ميناء عدن منذ أكتوبر 2025. يُنصح بالتحقق من مصادر بديلة أو الاتصال بسلطات الميناء.',
    confidence: 0.95,
    sector: 'trade',
    action: {
      label: 'View Trade Sector',
      labelAr: 'عرض قطاع التجارة',
      href: '/sectors/trade'
    }
  }
];

const typeIcons = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  prediction: Lightbulb,
  recommendation: Sparkles
};

const typeColors = {
  trend: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  anomaly: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  prediction: 'bg-[#DADED8] text-[#2e8b6e] dark:bg-blue-900/30 dark:text-blue-400',
  recommendation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
};

const typeLabels = {
  trend: { en: 'Trend', ar: 'اتجاه' },
  anomaly: { en: 'Anomaly', ar: 'شذوذ' },
  prediction: { en: 'Prediction', ar: 'توقع' },
  recommendation: { en: 'Recommendation', ar: 'توصية' }
};

export function SmartInsightsWidget() {
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>(mockInsights.slice(0, 3));
  const isRTL = language === 'ar';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in production this would call One Brain
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Shuffle insights to show different ones
    const shuffled = [...mockInsights].sort(() => Math.random() - 0.5);
    setInsights(shuffled.slice(0, 3));
    setIsRefreshing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">
            {isRTL ? 'رؤى ذكية' : 'Smart Insights'}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            AI
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, index) => {
            const Icon = typeIcons[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded ${typeColors[insight.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {isRTL ? insight.titleAr : insight.title}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {isRTL ? insight.descriptionAr : insight.description}
                    </p>
                    {insight.action && (
                      <Link href={insight.action.href}>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs">
                          {isRTL ? insight.action.labelAr : insight.action.label}
                          <ChevronRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <Link href="/ai-assistant">
          <Button variant="outline" className="w-full mt-2" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            {isRTL ? 'اسأل المساعد الذكي' : 'Ask AI Assistant'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default SmartInsightsWidget;
