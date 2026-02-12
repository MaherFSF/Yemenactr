import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EvidenceDrawer, EvidencePack } from "./EvidenceDrawer";
import { DQAFPanel } from "./DQAFPanel";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  Scale,
  Eye,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  Shield,
} from "lucide-react";

// @placeholder — replace with tRPC evidence pack endpoint when available
const createMockEvidencePack = (id: number, subject: string): EvidencePack => ({
  id,
  subjectType: "indicator",
  subjectId: `ind_${id}`,
  subjectLabel: subject,
  citations: [
    {
      sourceId: 1,
      title: "World Bank Economic Indicators",
      publisher: "World Bank",
      url: "https://data.worldbank.org",
      retrievalDate: new Date().toISOString(),
      licenseFlag: "CC-BY-4.0",
    },
    {
      sourceId: 2,
      title: "IMF World Economic Outlook",
      publisher: "International Monetary Fund",
      url: "https://www.imf.org/weo",
      retrievalDate: new Date().toISOString(),
      licenseFlag: "Open Data",
    },
  ],
  transforms: [
    {
      formula: "GDP_growth = (GDP_t - GDP_t-1) / GDP_t-1 * 100",
      description: "Year-over-year percentage change calculation",
      assumptions: ["Base year 2015", "Constant prices"],
    },
  ],
  regimeTags: ["IRG", "DFA"],
  geoScope: "Yemen",
  timeCoverageStart: "2020-01-01",
  timeCoverageEnd: new Date().toISOString(),
  hasContradictions: false,
  dqafIntegrity: "pass",
  dqafMethodology: "pass",
  dqafAccuracyReliability: "needs_review",
  dqafServiceability: "pass",
  dqafAccessibility: "pass",
  confidenceGrade: "B",
  confidenceExplanation: "Data sourced from multiple international organizations with cross-validation",
});

// Types for VIP Cockpit data
export interface Signal {
  id: string;
  indicator: string;
  indicatorAr: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  status: "normal" | "warning" | "critical";
  evidencePack?: EvidencePack;
  lastUpdated: string;
}

export interface Change {
  id: string;
  indicator: string;
  indicatorAr: string;
  previousValue: number;
  currentValue: number;
  delta: number;
  deltaPercent: number;
  period: string;
  significance: "high" | "medium" | "low";
  evidencePack?: EvidencePack;
}

export interface Driver {
  id: string;
  factor: string;
  factorAr: string;
  impact: "positive" | "negative" | "mixed";
  confidence: "high" | "medium" | "low";
  explanation: string;
  explanationAr: string;
  evidencePack?: EvidencePack;
  citations: string[];
}

export interface Option {
  id: string;
  title: string;
  titleAr: string;
  mechanism: string;
  mechanismAr: string;
  preconditions: string[];
  preconditionsAr: string[];
  risks: string[];
  risksAr: string[];
  timeframe: string;
  confidence: "high" | "medium" | "low";
  evidencePack?: EvidencePack;
}

export interface WatchlistItem {
  id: string;
  entity: string;
  entityAr: string;
  type: "indicator" | "entity" | "event";
  status: "normal" | "warning" | "critical";
  value?: number;
  change7d?: number;
  change30d?: number;
  change90d?: number;
  evidencePack?: EvidencePack;
}

export interface CockpitData {
  roleId: string;
  roleName: string;
  roleNameAr: string;
  lastUpdated: string;
  signals: Signal[];
  changes: Change[];
  drivers: Driver[];
  options: Option[];
  watchlist: WatchlistItem[];
  confidence: {
    overallCoverage: number;
    dataFreshness: number;
    contradictionCount: number;
    gapCount: number;
  };
}

interface VIPCockpitProps {
  roleId: string;
  customTitle?: string;
  customTitleAr?: string;
}

// Today in 60 Seconds Component
function TodayIn60Seconds({ signals, isArabic }: { signals: Signal[]; isArabic: boolean }) {
  const topSignals = signals.slice(0, 5);
  
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-primary" />
          {isArabic ? "اليوم في 60 ثانية" : "Today in 60 Seconds"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "أهم 5 إشارات تحتاج انتباهك" : "Top 5 signals requiring your attention"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSignals.map((signal, index) => (
            <div key={signal.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                <div>
                  <p className="font-medium text-sm">{isArabic ? signal.indicatorAr : signal.indicator}</p>
                  <p className="text-xs text-muted-foreground">
                    {signal.value.toLocaleString()} {signal.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={signal.status === "critical" ? "destructive" : signal.status === "warning" ? "secondary" : "outline"}>
                  {signal.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : signal.trend === "down" ? <TrendingDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                  {signal.changePercent > 0 ? "+" : ""}{signal.changePercent.toFixed(1)}%
                </Badge>
                {signal.evidencePack && (
                  <EvidenceDrawer evidence={signal.evidencePack} language={isArabic ? "ar" : "en"} trigger={<Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>} />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// What Changed Component
function WhatChanged({ changes, isArabic }: { changes: Change[]; isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          {isArabic ? "ما الذي تغير" : "What Changed"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "التغييرات الرئيسية منذ آخر تحديث" : "Key changes since last update"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {changes.map((change) => (
            <div key={change.id} className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{isArabic ? change.indicatorAr : change.indicator}</span>
                <Badge variant={change.significance === "high" ? "destructive" : change.significance === "medium" ? "secondary" : "outline"}>
                  {change.significance === "high" ? (isArabic ? "عالي" : "High") : change.significance === "medium" ? (isArabic ? "متوسط" : "Medium") : (isArabic ? "منخفض" : "Low")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{isArabic ? "السابق:" : "Previous:"}</span>
                  <span>{change.previousValue.toLocaleString()}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">{isArabic ? "الحالي:" : "Current:"}</span>
                  <span className="font-medium">{change.currentValue.toLocaleString()}</span>
                </div>
                <div className={`flex items-center gap-1 ${change.delta > 0 ? "text-red-500" : change.delta < 0 ? "text-green-500" : "text-muted-foreground"}`}>
                  {change.delta > 0 ? <ArrowUpRight className="h-4 w-4" /> : change.delta < 0 ? <ArrowDownRight className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  <span>{change.delta > 0 ? "+" : ""}{change.deltaPercent.toFixed(1)}%</span>
                </div>
              </div>
              {change.evidencePack && (
                <div className="mt-2">
                  <EvidenceDrawer evidence={change.evidencePack} language={isArabic ? "ar" : "en"} trigger={<Button variant="link" size="sm" className="h-auto p-0 text-xs">{isArabic ? "عرض الأدلة" : "View Evidence"}</Button>} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Why It Changed Component
function WhyItChanged({ drivers, isArabic }: { drivers: Driver[]; isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {isArabic ? "لماذا تغير" : "Why It Changed"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "العوامل المحركة مع الأدلة" : "Drivers with evidence"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {driver.impact === "positive" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : driver.impact === "negative" ? <XCircle className="h-4 w-4 text-red-500" /> : <Info className="h-4 w-4 text-yellow-500" />}
                  <span className="font-medium">{isArabic ? driver.factorAr : driver.factor}</span>
                </div>
                <Badge variant="outline" className={driver.confidence === "high" ? "border-green-500 text-green-500" : driver.confidence === "medium" ? "border-yellow-500 text-yellow-500" : "border-gray-500 text-gray-500"}>
                  {driver.confidence === "high" ? (isArabic ? "ثقة عالية" : "High Confidence") : driver.confidence === "medium" ? (isArabic ? "ثقة متوسطة" : "Medium Confidence") : (isArabic ? "ثقة منخفضة" : "Low Confidence")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{isArabic ? driver.explanationAr : driver.explanation}</p>
              {driver.citations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {driver.citations.map((citation, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{citation}</Badge>
                  ))}
                </div>
              )}
              {driver.evidencePack && (
                <div className="mt-2">
                  <EvidenceDrawer evidence={driver.evidencePack} language={isArabic ? "ar" : "en"} trigger={<Button variant="link" size="sm" className="h-auto p-0 text-xs">{isArabic ? "عرض الأدلة" : "View Evidence"}</Button>} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Options and Tradeoffs Component
function OptionsAndTradeoffs({ options, isArabic }: { options: Option[]; isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5 text-purple-500" />
          {isArabic ? "الخيارات والمقايضات" : "Options & Tradeoffs"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "البدائل الممكنة مع المخاطر والمتطلبات" : "Possible alternatives with risks and requirements"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {options.map((option) => (
            <div key={option.id} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{isArabic ? option.titleAr : option.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {option.timeframe}
                  </Badge>
                  <Badge variant={option.confidence === "high" ? "default" : option.confidence === "medium" ? "secondary" : "outline"}>
                    {option.confidence === "high" ? (isArabic ? "ثقة عالية" : "High") : option.confidence === "medium" ? (isArabic ? "متوسط" : "Medium") : (isArabic ? "منخفض" : "Low")}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{isArabic ? option.mechanismAr : option.mechanism}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">{isArabic ? "المتطلبات المسبقة" : "Preconditions"}</h5>
                  <ul className="text-sm space-y-1">
                    {(isArabic ? option.preconditionsAr : option.preconditions).map((pre, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                        <span>{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">{isArabic ? "المخاطر" : "Risks"}</h5>
                  <ul className="text-sm space-y-1">
                    {(isArabic ? option.risksAr : option.risks).map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 mt-1 text-yellow-500 shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {option.evidencePack && (
                <div className="mt-3 pt-3 border-t">
                  <EvidenceDrawer evidence={option.evidencePack} language={isArabic ? "ar" : "en"} trigger={<Button variant="outline" size="sm">{isArabic ? "عرض الأدلة الداعمة" : "View Supporting Evidence"}</Button>} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Confidence & Gaps Component
function ConfidenceAndGaps({ confidence, isArabic }: { confidence: CockpitData["confidence"]; isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-green-500" />
          {isArabic ? "الثقة والفجوات" : "Confidence & Gaps"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "جودة البيانات وتغطية الأدلة" : "Data quality and evidence coverage"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{isArabic ? "التغطية الكلية" : "Overall Coverage"}</p>
            <p className="text-2xl font-bold">{confidence.overallCoverage}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${confidence.overallCoverage}%` }} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{isArabic ? "حداثة البيانات" : "Data Freshness"}</p>
            <p className="text-2xl font-bold">{confidence.dataFreshness}%</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${confidence.dataFreshness}%` }} />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{isArabic ? "التناقضات" : "Contradictions"}</p>
            <p className="text-2xl font-bold">{confidence.contradictionCount}</p>
            <p className="text-xs text-muted-foreground">{isArabic ? "تحتاج مراجعة" : "Need review"}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">{isArabic ? "الفجوات" : "Gaps"}</p>
            <p className="text-2xl font-bold">{confidence.gapCount}</p>
            <p className="text-xs text-muted-foreground">{isArabic ? "بيانات مفقودة" : "Missing data"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Watchlist Component
function Watchlist({ items, isArabic }: { items: WatchlistItem[]; isArabic: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-orange-500" />
          {isArabic ? "قائمة المراقبة" : "Watchlist"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "المؤشرات والكيانات قيد المتابعة" : "Indicators and entities under monitoring"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {items.map((item) => {
              const change = item.change7d ?? item.change30d ?? item.change90d;
              return (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === "critical" ? "destructive" : item.status === "warning" ? "secondary" : "outline"} className="h-2 w-2 p-0 rounded-full" />
                    <span className="font-medium text-sm">{isArabic ? item.entityAr : item.entity}</span>
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value !== undefined && <span className="text-sm text-muted-foreground">{item.value.toLocaleString()}</span>}
                    {change !== undefined && (
                      <Badge variant={change > 5 ? "destructive" : change < -5 ? "default" : "secondary"} className="text-xs">
                        {change > 0 ? "+" : ""}{change.toFixed(1)}%
                      </Badge>
                    )}
                    {item.evidencePack && (
                      <EvidenceDrawer evidence={item.evidencePack} language={isArabic ? "ar" : "en"} trigger={<Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Eye className="h-3 w-3" /></Button>} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Main VIP Cockpit Component
export function VIPCockpit({ roleId, customTitle, customTitleAr }: VIPCockpitProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  
  // @placeholder — replace with trpc.vip.getCockpitData.useQuery({ roleId })
  const mockData: CockpitData = {
    roleId,
    roleName: customTitle || "VIP Cockpit",
    roleNameAr: customTitleAr || "لوحة القيادة",
    lastUpdated: new Date().toISOString(),
    signals: [
      {
        id: "sig_1",
        indicator: "Exchange Rate (YER/USD)",
        indicatorAr: "سعر الصرف (ريال/دولار)",
        value: 1680,
        unit: "YER",
        change: 45,
        changePercent: 2.7,
        trend: "up",
        status: "warning",
        evidencePack: createMockEvidencePack(1, "Exchange Rate"),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "sig_2",
        indicator: "Inflation Rate",
        indicatorAr: "معدل التضخم",
        value: 35.2,
        unit: "%",
        change: 3.1,
        changePercent: 9.6,
        trend: "up",
        status: "critical",
        evidencePack: createMockEvidencePack(2, "Inflation Rate"),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "sig_3",
        indicator: "Food Security Index",
        indicatorAr: "مؤشر الأمن الغذائي",
        value: 42,
        unit: "points",
        change: -5,
        changePercent: -10.6,
        trend: "down",
        status: "critical",
        evidencePack: createMockEvidencePack(3, "Food Security"),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "sig_4",
        indicator: "Foreign Reserves",
        indicatorAr: "الاحتياطيات الأجنبية",
        value: 1.2,
        unit: "B USD",
        change: -0.1,
        changePercent: -7.7,
        trend: "down",
        status: "warning",
        evidencePack: createMockEvidencePack(4, "Foreign Reserves"),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "sig_5",
        indicator: "Humanitarian Access",
        indicatorAr: "الوصول الإنساني",
        value: 68,
        unit: "%",
        change: 2,
        changePercent: 3.0,
        trend: "up",
        status: "normal",
        evidencePack: createMockEvidencePack(5, "Humanitarian Access"),
        lastUpdated: new Date().toISOString(),
      },
    ],
    changes: [
      {
        id: "chg_1",
        indicator: "Central Bank Reserves",
        indicatorAr: "احتياطيات البنك المركزي",
        previousValue: 1350,
        currentValue: 1200,
        delta: -150,
        deltaPercent: -11.1,
        period: "Last 30 days",
        significance: "high",
        evidencePack: createMockEvidencePack(6, "CB Reserves Change"),
      },
      {
        id: "chg_2",
        indicator: "Fuel Imports",
        indicatorAr: "واردات الوقود",
        previousValue: 450000,
        currentValue: 380000,
        delta: -70000,
        deltaPercent: -15.6,
        period: "Last 30 days",
        significance: "high",
        evidencePack: createMockEvidencePack(7, "Fuel Imports Change"),
      },
      {
        id: "chg_3",
        indicator: "Aid Disbursements",
        indicatorAr: "صرف المساعدات",
        previousValue: 85,
        currentValue: 92,
        delta: 7,
        deltaPercent: 8.2,
        period: "Last 30 days",
        significance: "medium",
        evidencePack: createMockEvidencePack(8, "Aid Disbursements"),
      },
    ],
    drivers: [
      {
        id: "drv_1",
        factor: "Saudi Deposit Withdrawal",
        factorAr: "سحب الوديعة السعودية",
        impact: "negative",
        confidence: "high",
        explanation: "The $2B Saudi deposit withdrawal has significantly reduced CBY-Aden's ability to defend the exchange rate.",
        explanationAr: "أدى سحب الوديعة السعودية بقيمة 2 مليار دولار إلى تقليص قدرة البنك المركزي في عدن على الدفاع عن سعر الصرف.",
        evidencePack: createMockEvidencePack(9, "Saudi Deposit Impact"),
        citations: ["Reuters 2024", "CBY Statement"],
      },
      {
        id: "drv_2",
        factor: "Port Revenue Diversion",
        factorAr: "تحويل إيرادات الموانئ",
        impact: "negative",
        confidence: "medium",
        explanation: "DFA continues to collect port revenues without transferring to CBY-Aden, reducing fiscal space.",
        explanationAr: "تواصل سلطة الأمر الواقع جمع إيرادات الموانئ دون تحويلها إلى البنك المركزي في عدن.",
        evidencePack: createMockEvidencePack(10, "Port Revenue Analysis"),
        citations: ["UN Panel Report", "ACLED"],
      },
    ],
    options: [
      {
        id: "opt_1",
        title: "Emergency Currency Stabilization",
        titleAr: "تثبيت طارئ للعملة",
        mechanism: "Request emergency Saudi/UAE deposit to defend exchange rate floor at 1500 YER/USD",
        mechanismAr: "طلب وديعة طارئة من السعودية/الإمارات للدفاع عن سعر الصرف عند 1500 ريال/دولار",
        preconditions: ["Saudi approval", "IMF coordination", "Fiscal reform commitment"],
        preconditionsAr: ["موافقة سعودية", "تنسيق مع صندوق النقد", "التزام بالإصلاح المالي"],
        risks: ["Political conditions", "Temporary relief only", "Moral hazard"],
        risksAr: ["شروط سياسية", "إغاثة مؤقتة فقط", "خطر أخلاقي"],
        timeframe: "1-3 months",
        confidence: "medium",
        evidencePack: createMockEvidencePack(11, "Stabilization Option"),
      },
      {
        id: "opt_2",
        title: "Revenue Sharing Agreement",
        titleAr: "اتفاقية تقاسم الإيرادات",
        mechanism: "Negotiate port/customs revenue sharing with DFA through UN mediation",
        mechanismAr: "التفاوض على تقاسم إيرادات الموانئ/الجمارك مع سلطة الأمر الواقع عبر وساطة الأمم المتحدة",
        preconditions: ["UN engagement", "DFA willingness", "International guarantees"],
        preconditionsAr: ["مشاركة الأمم المتحدة", "استعداد سلطة الأمر الواقع", "ضمانات دولية"],
        risks: ["DFA rejection", "Implementation challenges", "Political backlash"],
        risksAr: ["رفض سلطة الأمر الواقع", "تحديات التنفيذ", "ردود فعل سياسية"],
        timeframe: "6-12 months",
        confidence: "low",
        evidencePack: createMockEvidencePack(12, "Revenue Sharing Option"),
      },
    ],
    watchlist: [
      {
        id: "wl_1",
        entity: "Exchange Rate",
        entityAr: "سعر الصرف",
        type: "indicator",
        status: "warning",
        value: 1680,
        change7d: 2.7,
        change30d: 8.5,
        evidencePack: createMockEvidencePack(13, "Exchange Rate Watch"),
      },
      {
        id: "wl_2",
        entity: "CBY-Aden Reserves",
        entityAr: "احتياطيات البنك المركزي عدن",
        type: "indicator",
        status: "critical",
        value: 1200,
        change7d: -3.2,
        change30d: -11.1,
        evidencePack: createMockEvidencePack(14, "CBY Reserves Watch"),
      },
      {
        id: "wl_3",
        entity: "Fuel Prices",
        entityAr: "أسعار الوقود",
        type: "indicator",
        status: "warning",
        value: 850,
        change7d: 5.0,
        change30d: 12.3,
        evidencePack: createMockEvidencePack(15, "Fuel Prices Watch"),
      },
    ],
    confidence: {
      overallCoverage: 78,
      dataFreshness: 85,
      contradictionCount: 3,
      gapCount: 7,
    },
  };

  return (
    <div className="space-y-6 p-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isArabic ? mockData.roleNameAr : mockData.roleName}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {isArabic ? "آخر تحديث:" : "Last updated:"} {new Date(mockData.lastUpdated).toLocaleString(isArabic ? "ar-YE" : "en-US")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isArabic ? "تحديث" : "Refresh"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? "تصدير الملخص" : "Export Brief"}
          </Button>
          <Button variant="default" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? "إنشاء تقرير" : "Generate Report"}
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{isArabic ? "نظرة عامة" : "Overview"}</TabsTrigger>
          <TabsTrigger value="analysis">{isArabic ? "التحليل" : "Analysis"}</TabsTrigger>
          <TabsTrigger value="options">{isArabic ? "الخيارات" : "Options"}</TabsTrigger>
          <TabsTrigger value="watchlist">{isArabic ? "المراقبة" : "Watchlist"}</TabsTrigger>
          <TabsTrigger value="journal">{isArabic ? "سجل القرارات" : "Decision Journal"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayIn60Seconds signals={mockData.signals} isArabic={isArabic} />
            <ConfidenceAndGaps confidence={mockData.confidence} isArabic={isArabic} />
          </div>
          <WhatChanged changes={mockData.changes} isArabic={isArabic} />
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6 mt-6">
          <WhyItChanged drivers={mockData.drivers} isArabic={isArabic} />
        </TabsContent>
        
        <TabsContent value="options" className="space-y-6 mt-6">
          <OptionsAndTradeoffs options={mockData.options} isArabic={isArabic} />
        </TabsContent>
        
        <TabsContent value="watchlist" className="space-y-6 mt-6">
          <Watchlist items={mockData.watchlist} isArabic={isArabic} />
        </TabsContent>
        
        <TabsContent value="journal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "سجل القرارات" : "Decision Journal"}</CardTitle>
              <CardDescription>{isArabic ? "تتبع القرارات والنتائج" : "Track decisions and outcomes"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                {isArabic ? "لا توجد قرارات مسجلة بعد. ابدأ بتسجيل قرارك الأول." : "No decisions recorded yet. Start by logging your first decision."}
              </p>
              <div className="flex justify-center">
                <Button>
                  {isArabic ? "تسجيل قرار جديد" : "Log New Decision"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VIPCockpit;
