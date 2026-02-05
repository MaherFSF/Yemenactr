/**
 * SectorAgentVisualization - DB-backed charts with confidence indicators
 * Rules:
 * - All charts must be based on DB observations
 * - Show "as-of" timestamp for every chart
 * - Confidence & DQAF panel always visible
 * - Uncertainty bands only when provided by evidence metadata (never invent)
 */

import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Clock, Database, AlertTriangle, Info } from "lucide-react";
import { ConfidenceRating } from "@/components/ConfidenceRating";
import EvidencePackButton from "@/components/EvidencePackButton";

interface DataPoint {
  date: string;
  value: number;
  confidence: 'A' | 'B' | 'C' | 'D';
  evidencePackId?: number;
  sourceName?: string;
  uncertaintyLower?: number;
  uncertaintyUpper?: number;
}

interface SectorAgentVisualizationProps {
  indicatorCode: string;
  indicatorName: string;
  indicatorNameAr?: string;
  data: DataPoint[];
  unit: string;
  asOfDate: string;
  dqafScores?: {
    integrity: 'pass' | 'needs_review' | 'unknown';
    methodology: 'pass' | 'needs_review' | 'unknown';
    accuracyReliability: 'pass' | 'needs_review' | 'unknown';
    serviceability: 'pass' | 'needs_review' | 'unknown';
    accessibility: 'pass' | 'needs_review' | 'unknown';
  };
  uncertaintyNote?: string;
}

export function SectorAgentVisualization({
  indicatorCode,
  indicatorName,
  indicatorNameAr,
  data,
  unit,
  asOfDate,
  dqafScores,
  uncertaintyNote
}: SectorAgentVisualizationProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  // Format data for chart
  const chartData = useMemo(() => {
    return data.map(point => ({
      date: new Date(point.date).toLocaleDateString(isArabic ? 'ar' : 'en', { 
        year: 'numeric', 
        month: 'short' 
      }),
      value: point.value,
      confidence: point.confidence,
      evidencePackId: point.evidencePackId,
      sourceName: point.sourceName,
      uncertaintyLower: point.uncertaintyLower,
      uncertaintyUpper: point.uncertaintyUpper,
      fullDate: point.date
    }));
  }, [data, isArabic]);

  // Check if any data points have uncertainty bands
  const hasUncertaintyBands = data.some(d => d.uncertaintyLower !== undefined && d.uncertaintyUpper !== undefined);

  // Calculate overall confidence (minimum of all points)
  const overallConfidence = useMemo(() => {
    const grades = ['A', 'B', 'C', 'D'];
    const minGradeIndex = Math.max(...data.map(d => grades.indexOf(d.confidence)));
    return grades[minGradeIndex] as 'A' | 'B' | 'C' | 'D';
  }, [data]);

  // Get latest data point
  const latestPoint = data[0];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold">{point.date}</p>
          <p className="text-lg font-bold text-primary">
            {point.value.toFixed(2)} {unit}
          </p>
          {point.uncertaintyLower !== undefined && point.uncertaintyUpper !== undefined && (
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'نطاق عدم اليقين:' : 'Uncertainty range:'} {point.uncertaintyLower.toFixed(2)} - {point.uncertaintyUpper.toFixed(2)}
            </p>
          )}
          <div className="mt-2">
            <ConfidenceRating grade={point.confidence} size="sm" />
          </div>
          {point.sourceName && (
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? 'المصدر:' : 'Source:'} {point.sourceName}
            </p>
          )}
          {point.evidencePackId && (
            <div className="mt-2">
              <EvidencePackButton evidencePackId={point.evidencePackId}>
                <span className="text-xs underline cursor-pointer text-primary">
                  {isArabic ? 'عرض الأدلة' : 'View Evidence'}
                </span>
              </EvidencePackButton>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {isArabic && indicatorNameAr ? indicatorNameAr : indicatorName}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {indicatorCode} • {data.length} {isArabic ? 'نقاط بيانات' : 'data points'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ConfidenceRating grade={overallConfidence} size="sm" />
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {isArabic ? 'كما في:' : 'As of:'} {new Date(asOfDate).toLocaleDateString(isArabic ? 'ar' : 'en')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Value Display */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'القيمة الحالية' : 'Current Value'}
            </p>
            <p className="text-3xl font-bold">
              {latestPoint.value.toFixed(2)} <span className="text-lg text-muted-foreground">{unit}</span>
            </p>
          </div>
          {latestPoint.evidencePackId && (
            <EvidencePackButton evidencePackId={latestPoint.evidencePackId}>
              <Badge variant="secondary" className="cursor-pointer">
                <Database className="h-3 w-3 mr-1" />
                {isArabic ? 'الأدلة' : 'Evidence'}
              </Badge>
            </EvidencePackButton>
          )}
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {hasUncertaintyBands ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  style={{ fontSize: '12px' }}
                />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="uncertaintyUpper"
                  stroke="none"
                  fill="#3b82f680"
                  name={isArabic ? 'الحد الأعلى' : 'Upper Bound'}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  strokeWidth={2}
                  name={unit}
                />
                <Area
                  type="monotone"
                  dataKey="uncertaintyLower"
                  stroke="none"
                  fill="#ffffff"
                  name={isArabic ? 'الحد الأدنى' : 'Lower Bound'}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  style={{ fontSize: '12px' }}
                />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={unit}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Uncertainty Note */}
        {uncertaintyNote && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {uncertaintyNote}
            </AlertDescription>
          </Alert>
        )}

        {!hasUncertaintyBands && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {isArabic
                ? 'لا تتوفر نطاقات عدم اليقين لهذا المؤشر. القيم المعروضة هي تقديرات نقطية من المصادر.'
                : 'Uncertainty bands are not available for this indicator. Values shown are point estimates from sources.'}
            </AlertDescription>
          </Alert>
        )}

        {/* DQAF Panel */}
        {dqafScores && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              {isArabic ? 'إطار تقييم جودة البيانات (DQAF)' : 'Data Quality Assessment Framework (DQAF)'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <DQAFBadge 
                label={isArabic ? 'النزاهة' : 'Integrity'} 
                status={dqafScores.integrity} 
              />
              <DQAFBadge 
                label={isArabic ? 'المنهجية' : 'Methodology'} 
                status={dqafScores.methodology} 
              />
              <DQAFBadge 
                label={isArabic ? 'الدقة' : 'Accuracy'} 
                status={dqafScores.accuracyReliability} 
              />
              <DQAFBadge 
                label={isArabic ? 'الخدمة' : 'Serviceability'} 
                status={dqafScores.serviceability} 
              />
              <DQAFBadge 
                label={isArabic ? 'الوصول' : 'Accessibility'} 
                status={dqafScores.accessibility} 
              />
            </div>
          </div>
        )}

        {/* Data Provenance */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-3 w-3" />
          {isArabic
            ? `جميع البيانات من قاعدة بيانات YETO. آخر تحديث: ${new Date(asOfDate).toLocaleDateString('ar')}`
            : `All data from YETO database. Last updated: ${new Date(asOfDate).toLocaleDateString('en')}`}
        </div>
      </CardContent>
    </Card>
  );
}

function DQAFBadge({ label, status }: { label: string; status: 'pass' | 'needs_review' | 'unknown' }) {
  const variants: Record<typeof status, { color: string; text: string }> = {
    pass: { color: 'bg-green-500', text: '✓' },
    needs_review: { color: 'bg-yellow-500', text: '!' },
    unknown: { color: 'bg-gray-500', text: '?' }
  };

  const variant = variants[status];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-6 w-6 rounded-full ${variant.color} flex items-center justify-center text-white text-xs font-bold`}>
        {variant.text}
      </div>
      <span className="text-xs text-center">{label}</span>
    </div>
  );
}

export default SectorAgentVisualization;
