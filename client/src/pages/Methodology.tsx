import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, Shield, FileCheck, AlertTriangle, CheckCircle, Info, Download,
  ExternalLink, Database, Scale, Eye, FileText, ChevronDown, ChevronUp,
  Globe, Building2, FlaskConical, BarChart3, FileJson, FileSpreadsheet,
  Lock, Sparkles, Search, Filter, Layers, Activity, TrendingUp,
  CircleDot, Zap, Clock, Link2, ArrowRight, Award, Target,
  GitBranch, Gauge, LayoutGrid, List, Hash, Radio
} from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface SourceRow {
  id: number;
  sourceId: string;
  name: string;
  nameAr?: string;
  publisher?: string;
  url?: string;
  description?: string;
  tier: string;
  tierDescription: string;
  status: string;
  statusDescription: string;
  accessType: string;
  updateFrequency?: string;
  confidenceRating?: string;
  sectorCategory?: string;
  license?: string;
  historicalStart?: string;
  historicalEnd?: string;
  connectorType?: string;
  apiKeyRequired?: number;
  needsPartnership?: number;
}

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const TIER_META: Record<string, { label: string; labelAr: string; color: string; icon: typeof Shield; desc: string; descAr: string }> = {
  T0: {
    label: "Foundational Standards",
    labelAr: "المعايير التأسيسية",
    color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-300 dark:border-violet-700",
    icon: Award,
    desc: "IMF, World Bank, WTO statistical manuals and frameworks that define how data should be collected and classified globally",
    descAr: "أدلة ومعايير صندوق النقد الدولي والبنك الدولي ومنظمة التجارة العالمية التي تحدد كيفية جمع البيانات وتصنيفها عالمياً",
  },
  T1: {
    label: "Authoritative Sources",
    labelAr: "المصادر الموثوقة",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    icon: CheckCircle,
    desc: "International organizations, UN agencies, and established research institutions that produce primary data and analysis on Yemen",
    descAr: "المنظمات الدولية ووكالات الأمم المتحدة والمؤسسات البحثية الراسخة التي تنتج بيانات وتحليلات أولية عن اليمن",
  },
  T2: {
    label: "Specialized Assessments",
    labelAr: "التقييمات المتخصصة",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    icon: Target,
    desc: "Research centers, think tanks, and specialized agencies providing sector-specific analysis and assessments",
    descAr: "مراكز البحث ومؤسسات الفكر والوكالات المتخصصة التي تقدم تحليلات وتقييمات قطاعية",
  },
  T3: {
    label: "Aggregated Platforms",
    labelAr: "المنصات المجمعة",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    icon: Layers,
    desc: "Data portals and aggregation platforms that compile data from multiple primary sources",
    descAr: "بوابات البيانات ومنصات التجميع التي تجمع البيانات من مصادر أولية متعددة",
  },
  UNKNOWN: {
    label: "Pending Classification",
    labelAr: "بانتظار التصنيف",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-300 dark:border-gray-600",
    icon: Clock,
    desc: "Sources registered but not yet classified through our tiering methodology",
    descAr: "مصادر مسجلة ولكن لم يتم تصنيفها بعد من خلال منهجية التصنيف لدينا",
  },
};

const STATUS_META: Record<string, { label: string; labelAr: string; color: string; dot: string }> = {
  ACTIVE: { label: "Active", labelAr: "نشط", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  NEEDS_KEY: { label: "Needs API Key", labelAr: "يحتاج مفتاح", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
  PENDING_REVIEW: { label: "Pending Review", labelAr: "قيد المراجعة", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500" },
  INACTIVE: { label: "Inactive", labelAr: "غير نشط", color: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400", dot: "bg-gray-400" },
  DEPRECATED: { label: "Deprecated", labelAr: "متوقف", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" },
};

const ACCESS_META: Record<string, { label: string; icon: typeof Globe }> = {
  API: { label: "REST API", icon: Zap },
  WEB: { label: "Web Portal", icon: Globe },
  MANUAL: { label: "Manual Collection", icon: FileText },
  PDF: { label: "PDF Reports", icon: FileText },
  CSV: { label: "CSV Download", icon: FileSpreadsheet },
  SDMX: { label: "SDMX", icon: Database },
  RSS: { label: "RSS Feed", icon: Radio },
};

const CONFIDENCE_LEVELS = [
  {
    grade: "A", labelEn: "High Confidence", labelAr: "ثقة عالية",
    descEn: "Official source, verified by multiple independent parties, data from the last 2 years. Cross-referenced against at least one additional authoritative source.",
    descAr: "مصدر رسمي، تم التحقق منه من قبل أطراف مستقلة متعددة، بيانات من آخر سنتين. مقارنة مع مصدر موثوق إضافي واحد على الأقل.",
    color: "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    examples: "World Bank WDI, IMF WEO, UN OCHA FTS",
  },
  {
    grade: "B", labelEn: "Moderate Confidence", labelAr: "ثقة متوسطة",
    descEn: "Credible institutional source with established methodology. Limited independent verification but consistent with broader trends. Data within 3 years.",
    descAr: "مصدر مؤسسي موثوق بمنهجية راسخة. تحقق مستقل محدود ولكنه متسق مع الاتجاهات العامة. بيانات خلال 3 سنوات.",
    color: "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    examples: "UNDP reports, IPC assessments, ACLED events",
  },
  {
    grade: "C", labelEn: "Low Confidence", labelAr: "ثقة منخفضة",
    descEn: "Single source without independent verification, or data older than 3 years. May be based on limited sampling or incomplete coverage.",
    descAr: "مصدر واحد بدون تحقق مستقل، أو بيانات أقدم من 3 سنوات. قد تكون مبنية على عينات محدودة أو تغطية غير كاملة.",
    color: "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    examples: "Older survey data, single-agency estimates",
  },
  {
    grade: "D", labelEn: "Estimate / Proxy", labelAr: "تقدير / مؤشر بديل",
    descEn: "Calculated estimate using proxy indicators, statistical models, or expert judgment. Methodology is documented but uncertainty is high.",
    descAr: "تقدير محسوب باستخدام مؤشرات بديلة أو نماذج إحصائية أو حكم خبراء. المنهجية موثقة ولكن عدم اليقين مرتفع.",
    color: "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    examples: "GDP estimates, poverty projections, nightlight-based activity",
  },
  {
    grade: "E", labelEn: "Contested / Disputed", labelAr: "متنازع عليه",
    descEn: "Multiple conflicting sources with no consensus. Data may be politically sensitive or produced under conditions that compromise independence.",
    descAr: "مصادر متعددة متضاربة بدون إجماع. قد تكون البيانات حساسة سياسياً أو منتجة في ظروف تضر بالاستقلالية.",
    color: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    examples: "Dual exchange rates, conflicting casualty figures",
  },
];

const DQAF_DIMENSIONS = [
  {
    id: "prerequisites", titleEn: "Prerequisites of Quality", titleAr: "متطلبات الجودة المسبقة",
    descEn: "Legal and institutional environment, resources, and relevance",
    descAr: "البيئة القانونية والمؤسسية والموارد والملاءمة",
    icon: Shield, score: 72,
    yetoEn: "YETO operates as an independent observatory. We document all source institutions, their mandates, and any known political constraints on data production.",
    yetoAr: "يعمل YETO كمرصد مستقل. نوثق جميع المؤسسات المصدرية وتفويضاتها وأي قيود سياسية معروفة على إنتاج البيانات.",
  },
  {
    id: "integrity", titleEn: "Assurances of Integrity", titleAr: "ضمانات النزاهة",
    descEn: "Professionalism, transparency, and ethical standards",
    descAr: "المهنية والشفافية والمعايير الأخلاقية",
    icon: Lock, score: 85,
    yetoEn: "Every data point carries provenance metadata. We never alter source data — only annotate, contextualize, and flag discrepancies.",
    yetoAr: "كل نقطة بيانات تحمل بيانات وصفية للمصدر. لا نغير بيانات المصدر أبداً — فقط نعلق ونضع في سياق ونشير إلى التناقضات.",
  },
  {
    id: "methodology", titleEn: "Methodological Soundness", titleAr: "السلامة المنهجية",
    descEn: "Concepts, scope, classification, and basis for recording",
    descAr: "المفاهيم والنطاق والتصنيف وأساس التسجيل",
    icon: FlaskConical, score: 78,
    yetoEn: "We align with SNA 2008, BPM6, GFSM 2014, and IPC standards. Each sector page documents which international framework governs its indicators.",
    yetoAr: "نلتزم بمعايير SNA 2008 و BPM6 و GFSM 2014 و IPC. كل صفحة قطاع توثق الإطار الدولي الذي يحكم مؤشراتها.",
  },
  {
    id: "accuracy", titleEn: "Accuracy & Reliability", titleAr: "الدقة والموثوقية",
    descEn: "Source data, assessment of source data, statistical techniques, and revision studies",
    descAr: "بيانات المصدر وتقييم بيانات المصدر والتقنيات الإحصائية ودراسات المراجعة",
    icon: Target, score: 65,
    yetoEn: "We run automated anomaly detection, cross-source contradiction checks, and maintain a public corrections log. Yemen's data environment means accuracy scores are inherently lower than stable economies.",
    yetoAr: "نشغل كشف الشذوذ الآلي وفحوصات التناقض بين المصادر ونحتفظ بسجل تصحيحات عام. بيئة البيانات في اليمن تعني أن درجات الدقة أقل بطبيعتها من الاقتصادات المستقرة.",
  },
  {
    id: "serviceability", titleEn: "Serviceability", titleAr: "قابلية الخدمة",
    descEn: "Periodicity, timeliness, and consistency",
    descAr: "الدورية والتوقيت والاتساق",
    icon: Clock, score: 70,
    yetoEn: "Automated pipelines fetch data from 20+ APIs daily. We track freshness SLAs per source and flag stale data. Historical series span 2010-2026.",
    yetoAr: "خطوط أنابيب آلية تجلب البيانات من 20+ واجهة برمجة يومياً. نتتبع اتفاقيات مستوى الخدمة للحداثة لكل مصدر ونشير إلى البيانات القديمة.",
  },
  {
    id: "accessibility", titleEn: "Accessibility", titleAr: "إمكانية الوصول",
    descEn: "Data accessibility, metadata accessibility, and assistance to users",
    descAr: "إمكانية الوصول إلى البيانات والبيانات الوصفية والمساعدة للمستخدمين",
    icon: Globe, score: 90,
    yetoEn: "All data is freely accessible via web interface and API. Bilingual (EN/AR) support. Downloadable datasets, methodology documents, and indicator catalog.",
    yetoAr: "جميع البيانات متاحة مجاناً عبر واجهة الويب وواجهة البرمجة. دعم ثنائي اللغة (EN/AR). مجموعات بيانات قابلة للتحميل ووثائق منهجية وكتالوج مؤشرات.",
  },
];

const PROVENANCE_RULES = [
  { titleEn: "Source Attribution", titleAr: "إسناد المصدر", descEn: "Every data point cites its original source with publication date, access date, and a direct URL where available", descAr: "كل نقطة بيانات تذكر مصدرها الأصلي مع تاريخ النشر وتاريخ الوصول ورابط مباشر حيثما توفر", icon: FileCheck },
  { titleEn: "Confidence Grading", titleAr: "تصنيف الثقة", descEn: "All indicators carry a confidence grade (A through E) based on source reliability, verification depth, and data age", descAr: "جميع المؤشرات تحمل درجة ثقة (A إلى E) بناءً على موثوقية المصدر وعمق التحقق وعمر البيانات", icon: Scale },
  { titleEn: "Regime Tagging", titleAr: "وسم النظام", descEn: "Data is tagged by territorial authority (IRG, DFA, or National) where applicable, reflecting Yemen's dual governance reality", descAr: "البيانات موسومة حسب السلطة الإقليمية (الشرعية، الأمر الواقع، أو وطني) حيثما ينطبق", icon: Building2 },
  { titleEn: "Temporal Marking", titleAr: "التحديد الزمني", descEn: "Reference period, data vintage, and last-updated timestamp are clearly indicated for every indicator", descAr: "فترة المرجع وعمر البيانات وآخر تحديث محددة بوضوح لكل مؤشر", icon: Clock },
  { titleEn: "Methodology Notes", titleAr: "ملاحظات المنهجية", descEn: "Calculation methods, assumptions, and proxy methodologies are documented for all derived indicators", descAr: "طرق الحساب والافتراضات ومنهجيات البدائل موثقة لجميع المؤشرات المشتقة", icon: FileText },
  { titleEn: "Contradiction Flagging", titleAr: "تحديد التناقضات", descEn: "When sources disagree, we flag the contradiction, present both values, and explain the discrepancy", descAr: "عندما تختلف المصادر، نشير إلى التناقض ونعرض كلتا القيمتين ونشرح التباين", icon: AlertTriangle },
  { titleEn: "Revision Tracking", titleAr: "تتبع المراجعات", descEn: "All data revisions are logged with timestamps, previous values, and justification for the change", descAr: "جميع مراجعات البيانات مسجلة مع الطوابع الزمنية والقيم السابقة ومبرر التغيير", icon: GitBranch },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function Methodology() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [expandedDqaf, setExpandedDqaf] = useState<string | null>(null);

  // Data fetching
  const utils = trpc.useUtils();
  const statsQuery = trpc.sourceRegistry.getStats.useQuery();
  const sourcesQuery = trpc.sourceRegistry.getAll.useQuery({
    tier: selectedTier || undefined,
    status: selectedStatus || undefined,
    search: searchQuery || undefined,
    limit: 500,
    offset: 0,
  });

  const stats = statsQuery.data?.stats;
  const sources = (sourcesQuery.data?.sources || []) as SourceRow[];
  const totalSources = sourcesQuery.data?.total || 0;

  // Group sources by tier
  const sourcesByTier = useMemo(() => {
    const grouped: Record<string, SourceRow[]> = {};
    for (const s of sources) {
      const tier = s.tier || "UNKNOWN";
      if (!grouped[tier]) grouped[tier] = [];
      grouped[tier].push(s);
    }
    return grouped;
  }, [sources]);

  // Tier order
  const tierOrder = ["T0", "T1", "T2", "T3", "UNKNOWN"];

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen" dir={isAr ? "rtl" : "ltr"}>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-100/30 via-transparent to-transparent dark:from-violet-900/10" />
        <div className="container relative py-10 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              {isAr ? "معايير IMF DQAF · البنك الدولي DECDG · OECD" : "IMF DQAF · World Bank DECDG · OECD Standards"}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {isAr ? "المنهجية والشفافية" : "Methodology & Transparency"}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {isAr
                ? "كيف نجمع ونتحقق ونصنف ونقدم البيانات الاقتصادية في اليمن — بما يتوافق مع أعلى المعايير الدولية لجودة البيانات"
                : "How we collect, verify, classify, and present economic data on Yemen — aligned with the highest international standards for statistical quality"}
            </p>

            {/* Quick stats bar */}
            {stats && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { n: stats.total, en: "Registered Sources", ar: "مصدر مسجل" },
                  { n: stats.active, en: "Active Connectors", ar: "رابط نشط" },
                  { n: Object.keys(stats.byTier).filter(t => t !== "UNKNOWN").length, en: "Quality Tiers", ar: "مستويات جودة" },
                  { n: stats.sectorCount, en: "Economic Sectors", ar: "قطاع اقتصادي" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{s.n}</div>
                    <div className="text-xs text-muted-foreground">{isAr ? s.ar : s.en}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="container py-8 md:py-12 flex-1">
        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 p-6 rounded-2xl border bg-gradient-to-r from-primary/5 to-transparent">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isAr ? "التزامنا بالشفافية" : "Our Commitment to Transparency"}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {isAr
                  ? "في بيئة بيانات مجزأة مثل اليمن — حيث تنتج سلطتان حكوميتان إحصاءات متضاربة، وحيث لم يُجرَ تعداد سكاني منذ 2004 — الشفافية حول ما نعرفه وما لا نعرفه ليست مجرد ممارسة جيدة، بل هي ضرورة أخلاقية. نحن ملتزمون بالإفصاح الكامل عن مصادرنا ومنهجياتنا وقيودنا."
                  : "In a fragmented data environment like Yemen — where two governing authorities produce conflicting statistics, and where no population census has been conducted since 2004 — transparency about what we know and what we don't know is not just good practice, it is an ethical imperative. We are committed to full disclosure of our sources, methodologies, and limitations."}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <Tabs defaultValue="registry" className="space-y-6">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1.5 bg-muted/50 rounded-xl">
            {[
              { value: "registry", icon: Database, en: "Source Registry", ar: "سجل المصادر" },
              { value: "quality", icon: Gauge, en: "Quality Framework", ar: "إطار الجودة" },
              { value: "provenance", icon: GitBranch, en: "Provenance Rules", ar: "قواعد المصدر" },
              { value: "confidence", icon: Scale, en: "Confidence System", ar: "نظام الثقة" },
              { value: "downloads", icon: Download, en: "Documents", ar: "الوثائق" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 min-w-[120px] text-xs sm:text-sm py-2.5 gap-1.5">
                <tab.icon className="h-3.5 w-3.5" />
                {isAr ? tab.ar : tab.en}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════
               TAB 1: SOURCE REGISTRY — All 292 Sources
             ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="registry" className="space-y-6">
            {/* Tier Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {tierOrder.map((tier) => {
                const meta = TIER_META[tier];
                const count = stats?.byTier?.[tier] || 0;
                const isSelected = selectedTier === tier;
                const Icon = meta.icon;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(isSelected ? null : tier)}
                    className={`p-3 md:p-4 rounded-xl border-2 text-start transition-all ${
                      isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs font-mono">{tier}</Badge>
                    </div>
                    <div className="text-xl md:text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{isAr ? meta.labelAr : meta.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isAr ? "البحث في 292 مصدر..." : "Search across 292 sources..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                  const isActive = selectedStatus === key;
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus(isActive ? null : key)}
                      className="text-xs gap-1.5"
                    >
                      <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {isAr ? meta.labelAr : meta.label}
                    </Button>
                  );
                })}
              </div>
              <div className="flex gap-1 border rounded-lg p-0.5">
                <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="h-8 w-8 p-0">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-8 w-8 p-0">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `عرض ${totalSources} مصدر${selectedTier ? ` في ${selectedTier}` : ""}${selectedStatus ? ` (${STATUS_META[selectedStatus]?.labelAr})` : ""}`
                  : `Showing ${totalSources} source${totalSources !== 1 ? "s" : ""}${selectedTier ? ` in ${selectedTier}` : ""}${selectedStatus ? ` (${STATUS_META[selectedStatus]?.label})` : ""}`}
              </p>
              {(selectedTier || selectedStatus || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedTier(null); setSelectedStatus(null); setSearchQuery(""); }}>
                  {isAr ? "مسح الفلاتر" : "Clear filters"}
                </Button>
              )}
            </div>

            {/* Source List by Tier */}
            {sourcesQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {tierOrder.filter(t => !selectedTier || selectedTier === t).map((tier) => {
                  const tierSources = sourcesByTier[tier] || [];
                  if (tierSources.length === 0) return null;
                  const meta = TIER_META[tier];
                  const Icon = meta.icon;
                  return (
                    <div key={tier} className="space-y-3">
                      {/* Tier Header */}
                      <div className="flex items-center gap-3 py-2">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${meta.color}`}>
                          <Icon className="h-4 w-4" />
                          <span className="font-semibold text-sm">{tier}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{isAr ? meta.labelAr : meta.label}</h3>
                          <p className="text-xs text-muted-foreground">{isAr ? meta.descAr : meta.desc}</p>
                        </div>
                        <Badge variant="secondary">{tierSources.length}</Badge>
                      </div>

                      {/* Sources */}
                      {viewMode === "list" ? (
                        <div className="rounded-xl border overflow-hidden">
                          {/* Desktop table */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/30">
                                  <th className="text-start p-3 font-medium w-[30%]">{isAr ? "المصدر" : "Source"}</th>
                                  <th className="text-start p-3 font-medium w-[15%]">{isAr ? "الناشر" : "Publisher"}</th>
                                  <th className="text-start p-3 font-medium w-[10%]">{isAr ? "الوصول" : "Access"}</th>
                                  <th className="text-start p-3 font-medium w-[10%]">{isAr ? "الحالة" : "Status"}</th>
                                  <th className="text-start p-3 font-medium w-[10%]">{isAr ? "التكرار" : "Frequency"}</th>
                                  <th className="text-start p-3 font-medium w-[5%]"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {tierSources.map((source) => {
                                  const statusMeta = STATUS_META[source.status] || STATUS_META.PENDING_REVIEW;
                                  const accessMeta = ACCESS_META[source.accessType] || ACCESS_META.WEB;
                                  return (
                                    <tr key={source.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                      <td className="p-3">
                                        <div className="font-medium text-sm">{source.name}</div>
                                        {source.description && (
                                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{source.description}</div>
                                        )}
                                      </td>
                                      <td className="p-3 text-xs text-muted-foreground">{source.publisher || "—"}</td>
                                      <td className="p-3">
                                        <Badge variant="outline" className="text-xs gap-1">
                                          <accessMeta.icon className="h-3 w-3" />
                                          {accessMeta.label}
                                        </Badge>
                                      </td>
                                      <td className="p-3">
                                        <Badge className={`text-xs gap-1 ${statusMeta.color}`}>
                                          <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                          {isAr ? statusMeta.labelAr : statusMeta.label}
                                        </Badge>
                                      </td>
                                      <td className="p-3 text-xs text-muted-foreground">{source.updateFrequency || "—"}</td>
                                      <td className="p-3">
                                        {source.url && (
                                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          {/* Mobile cards */}
                          <div className="md:hidden divide-y">
                            {tierSources.map((source) => {
                              const statusMeta = STATUS_META[source.status] || STATUS_META.PENDING_REVIEW;
                              return (
                                <div key={source.id} className="p-4">
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="font-medium text-sm flex-1">{source.name}</div>
                                    <Badge className={`text-xs flex-shrink-0 ${statusMeta.color}`}>
                                      {isAr ? statusMeta.labelAr : statusMeta.label}
                                    </Badge>
                                  </div>
                                  {source.description && (
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{source.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">{source.accessType}</Badge>
                                    {source.updateFrequency && <Badge variant="outline" className="text-xs">{source.updateFrequency}</Badge>}
                                    {source.url && (
                                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                        <ExternalLink className="h-3 w-3" />
                                        {isAr ? "الموقع" : "Website"}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Grid view */
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {tierSources.map((source) => {
                            const statusMeta = STATUS_META[source.status] || STATUS_META.PENDING_REVIEW;
                            const accessMeta = ACCESS_META[source.accessType] || ACCESS_META.WEB;
                            return (
                              <div key={source.id} className="p-4 rounded-xl border hover:border-primary/30 transition-colors">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-medium text-sm line-clamp-2">{source.name}</h4>
                                  {source.url && (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary flex-shrink-0">
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                                {source.description && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{source.description}</p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`text-xs ${statusMeta.color}`}>{isAr ? statusMeta.labelAr : statusMeta.label}</Badge>
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <accessMeta.icon className="h-3 w-3" />
                                    {accessMeta.label}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Access Type Distribution */}
            {stats && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    {isAr ? "توزيع طرق الوصول" : "Access Method Distribution"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(stats.byAccessType).sort((a, b) => b[1] - a[1]).map(([method, count]) => {
                      const meta = ACCESS_META[method] || ACCESS_META.WEB;
                      const pct = Math.round((count / stats.total) * 100);
                      return (
                        <div key={method} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <meta.icon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{meta.label}</span>
                            </div>
                            <span className="text-sm font-bold">{count}</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">{pct}% of registry</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
               TAB 2: DATA QUALITY FRAMEWORK (IMF DQAF Alignment)
             ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {isAr ? "إطار تقييم جودة البيانات" : "Data Quality Assessment Framework"}
                    </CardTitle>
                    <CardDescription>
                      {isAr
                        ? "متوافق مع إطار تقييم جودة البيانات لصندوق النقد الدولي (DQAF)"
                        : "Aligned with the IMF Data Quality Assessment Framework (DQAF)"}
                    </CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {isAr
                    ? "يعتمد YETO على الأبعاد الستة لإطار DQAF الصادر عن صندوق النقد الدولي لتقييم ومراقبة جودة البيانات بشكل منهجي. كل بُعد يُقيَّم على مقياس من 0 إلى 100 بناءً على مدى التزام ممارساتنا بالمعايير الدولية."
                    : "YETO adopts the six dimensions of the IMF's Data Quality Assessment Framework (DQAF) to systematically evaluate and monitor data quality. Each dimension is scored on a 0-100 scale based on how closely our practices align with international standards."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall score */}
                <div className="p-4 rounded-xl bg-muted/30 border mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{isAr ? "النتيجة الإجمالية لجودة البيانات" : "Overall Data Quality Score"}</span>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(DQAF_DIMENSIONS.reduce((sum, d) => sum + d.score, 0) / DQAF_DIMENSIONS.length)}%
                    </span>
                  </div>
                  <Progress value={Math.round(DQAF_DIMENSIONS.reduce((sum, d) => sum + d.score, 0) / DQAF_DIMENSIONS.length)} className="h-2.5" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {isAr
                      ? "ملاحظة: الدرجات تعكس واقع بيئة البيانات في اليمن. الدقة (65%) أقل بطبيعتها بسبب غياب التعداد منذ 2004 والحرب المستمرة."
                      : "Note: Scores reflect Yemen's data environment reality. Accuracy (65%) is inherently lower due to no census since 2004 and ongoing conflict."}
                  </p>
                </div>

                {/* DQAF Dimensions */}
                <div className="space-y-3">
                  {DQAF_DIMENSIONS.map((dim) => {
                    const Icon = dim.icon;
                    const isExpanded = expandedDqaf === dim.id;
                    return (
                      <div key={dim.id} className="rounded-xl border overflow-hidden">
                        <button
                          onClick={() => setExpandedDqaf(isExpanded ? null : dim.id)}
                          className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-start"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{isAr ? dim.titleAr : dim.titleEn}</h4>
                              <span className="text-sm font-bold text-primary">{dim.score}%</span>
                            </div>
                            <Progress value={dim.score} className="h-1.5" />
                          </div>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t bg-muted/10">
                            <div className="pt-3 space-y-3">
                              <p className="text-sm text-muted-foreground">{isAr ? dim.descAr : dim.descEn}</p>
                              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <h5 className="text-xs font-semibold text-primary mb-1">{isAr ? "كيف يطبق YETO هذا:" : "How YETO applies this:"}</h5>
                                <p className="text-sm">{isAr ? dim.yetoAr : dim.yetoEn}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* International Standards Alignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  {isAr ? "المعايير الدولية المعتمدة" : "International Standards Adopted"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { code: "SNA 2008", en: "System of National Accounts", ar: "نظام الحسابات القومية", org: "UN", use: "GDP, national income accounting" },
                    { code: "BPM6", en: "Balance of Payments Manual", ar: "دليل ميزان المدفوعات", org: "IMF", use: "Trade, FX reserves, capital flows" },
                    { code: "GFSM 2014", en: "Government Finance Statistics Manual", ar: "دليل إحصاءات المالية الحكومية", org: "IMF", use: "Public finance, fiscal data" },
                    { code: "IPC", en: "Integrated Food Security Phase Classification", ar: "التصنيف المرحلي المتكامل للأمن الغذائي", org: "FAO/WFP", use: "Food security severity" },
                    { code: "ISIC Rev.4", en: "Industrial Classification of All Economic Activities", ar: "التصنيف الصناعي الدولي", org: "UN", use: "Sector classification" },
                    { code: "SDDS", en: "Special Data Dissemination Standard", ar: "معيار نشر البيانات الخاص", org: "IMF", use: "Data dissemination practices" },
                  ].map((std) => (
                    <div key={std.code} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                      <Badge variant="outline" className="font-mono text-xs flex-shrink-0 mt-0.5">{std.code}</Badge>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{isAr ? std.ar : std.en}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{std.org} — {std.use}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
               TAB 3: PROVENANCE RULES
             ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="provenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitBranch className="h-5 w-5 text-primary" />
                  {isAr ? "قواعد تتبع المصدر والمنشأ" : "Data Provenance & Lineage Rules"}
                </CardTitle>
                <CardDescription>
                  {isAr
                    ? "سبع قواعد غير قابلة للتفاوض تحكم كيفية تتبع كل نقطة بيانات من المصدر إلى العرض"
                    : "Seven non-negotiable rules governing how every data point is traced from source to presentation"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PROVENANCE_RULES.map((rule, index) => {
                  const Icon = rule.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-xl border hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base">{isAr ? rule.titleAr : rule.titleEn}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{isAr ? rule.descAr : rule.descEn}</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-1" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Correction Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {isAr ? "سياسة التصحيحات" : "Corrections Policy"}
                </CardTitle>
                <CardDescription>
                  {isAr ? "كيف نتعامل مع الأخطاء والتحديثات" : "How we handle errors, revisions, and updates"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-5 gap-3">
                  {[
                    { step: 1, en: "Report received", ar: "استلام التقرير", desc: "Via email, form, or automated detection" },
                    { step: 2, en: "Source verification", ar: "التحقق من المصدر", desc: "Cross-check against original source" },
                    { step: 3, en: "Impact assessment", ar: "تقييم الأثر", desc: "Determine affected indicators" },
                    { step: 4, en: "Data correction", ar: "تصحيح البيانات", desc: "Update with revision note" },
                    { step: 5, en: "Public notification", ar: "إخطار عام", desc: "Changelog entry published" },
                  ].map((item) => (
                    <div key={item.step} className="text-center p-3 rounded-xl border bg-muted/20">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-primary">
                        {item.step}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{isAr ? item.ar : item.en}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
               TAB 4: CONFIDENCE GRADING SYSTEM
             ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="confidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-primary" />
                  {isAr ? "نظام تصنيف الثقة A–E" : "Confidence Grading System A–E"}
                </CardTitle>
                <CardDescription>
                  {isAr
                    ? "كل مؤشر في YETO يحمل درجة ثقة تعكس موثوقية البيانات ومستوى التحقق وعمر البيانات"
                    : "Every indicator in YETO carries a confidence grade reflecting source reliability, verification depth, and data age"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {CONFIDENCE_LEVELS.map((level) => (
                  <div key={level.grade} className={`p-4 md:p-5 rounded-xl border-2 ${level.color}`}>
                    <div className="flex items-start gap-4">
                      <Badge className={`text-xl font-bold px-4 py-2.5 ${level.badge}`}>
                        {level.grade}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base mb-1">{isAr ? level.labelAr : level.labelEn}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{isAr ? level.descAr : level.descEn}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          <span>{isAr ? "أمثلة:" : "Examples:"} {level.examples}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* How grades are assigned */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  {isAr ? "كيف تُحدد الدرجات" : "How Grades Are Assigned"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-start p-3 font-medium">{isAr ? "المعيار" : "Criterion"}</th>
                        <th className="text-center p-3 font-medium">A</th>
                        <th className="text-center p-3 font-medium">B</th>
                        <th className="text-center p-3 font-medium">C</th>
                        <th className="text-center p-3 font-medium">D</th>
                        <th className="text-center p-3 font-medium">E</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { en: "Source tier", ar: "مستوى المصدر", vals: ["T0–T1", "T1–T2", "T2–T3", "Any", "Any"] },
                        { en: "Independent verification", ar: "التحقق المستقل", vals: ["2+ sources", "1 source", "None", "N/A", "Conflicting"] },
                        { en: "Data age", ar: "عمر البيانات", vals: ["< 2 years", "< 3 years", "> 3 years", "Modeled", "Disputed"] },
                        { en: "Methodology documented", ar: "المنهجية موثقة", vals: ["Full", "Partial", "Minimal", "Yes", "Varies"] },
                        { en: "Coverage", ar: "التغطية", vals: ["National", "National", "Partial", "Estimated", "Partial"] },
                      ].map((row, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-3 font-medium">{isAr ? row.ar : row.en}</td>
                          {row.vals.map((v, j) => (
                            <td key={j} className="p-3 text-center text-xs text-muted-foreground">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
               TAB 5: DOWNLOADABLE DOCUMENTS
             ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="downloads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-primary" />
                  {isAr ? "تحميل الوثائق" : "Download Documentation"}
                </CardTitle>
                <CardDescription>
                  {isAr
                    ? "وثائق منهجية شاملة وقواميس بيانات وكتالوجات مؤشرات"
                    : "Comprehensive methodology documents, data dictionaries, and indicator catalogs"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      titleEn: "Full Methodology Guide", titleAr: "دليل المنهجية الكامل",
                      descEn: "Complete documentation of data collection, verification, quality standards, and presentation methodology across all 16 sectors",
                      descAr: "توثيق كامل لمعايير جمع البيانات والتحقق والجودة ومنهجية العرض عبر جميع القطاعات الـ 16",
                      format: "MD", size: "Live", icon: FileText, key: "methodologyGuide" as const,
                      color: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-950/50",
                    },
                    {
                      titleEn: "Data Dictionary", titleAr: "قاموس البيانات",
                      descEn: "Definitions, units, calculation methods, and metadata for all indicators tracked on the platform",
                      descAr: "التعريفات والوحدات وطرق الحساب والبيانات الوصفية لجميع المؤشرات المتتبعة على المنصة",
                      format: "CSV", size: "Live", icon: Database, key: "dataDictionary" as const,
                      color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950/50",
                    },
                    {
                      titleEn: "Source Registry Export", titleAr: "تصدير سجل المصادر",
                      descEn: "Complete list of all 292 registered data sources with tier classifications, access methods, and status",
                      descAr: "قائمة كاملة بجميع المصادر الـ 292 المسجلة مع تصنيفات المستوى وطرق الوصول والحالة",
                      format: "CSV", size: "Live", icon: FileSpreadsheet, key: "sourceRegistryExport" as const,
                      color: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
                    },
                    {
                      titleEn: "Indicator Catalog", titleAr: "كتالوج المؤشرات",
                      descEn: "All economic indicators with sources, update frequencies, confidence grades, and sector mappings",
                      descAr: "جميع المؤشرات الاقتصادية مع المصادر وتكرار التحديث ودرجات الثقة وتصنيفات القطاع",
                      format: "CSV", size: "Live", icon: FileSpreadsheet, key: "indicatorCatalog" as const,
                      color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/50",
                    },
                  ].map((doc, index) => {
                    const Icon = doc.icon;
                    return (
                      <button
                        key={index}
                        onClick={async () => {
                          try {
                            const fetcher = utils.documentExports[doc.key as keyof typeof utils.documentExports] as any;
                            const result = await fetcher.fetch();
                            if (!result) return;
                            const blob = new Blob([result.content], { type: result.mimeType || 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = result.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error('Download error:', err);
                            alert(isAr ? 'حدث خطأ أثناء التحميل' : 'Download error, please try again');
                          }
                        }}
                        className={`group p-5 rounded-xl border-2 transition-all duration-200 text-start block w-full ${doc.color}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm md:text-base mb-1 flex items-center gap-2">
                              {isAr ? doc.titleAr : doc.titleEn}
                              <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {isAr ? doc.descAr : doc.descEn}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{doc.format}</Badge>
                              <span className="text-xs text-muted-foreground">{doc.size}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sector Methodology Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {isAr ? "وثائق منهجية القطاعات" : "Sector Methodology Documents"}
                </CardTitle>
                <CardDescription>
                  {isAr ? "كل قطاع له وثيقة منهجية مخصصة" : "Each sector has a dedicated methodology document"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { code: "macro", en: "Macroeconomic Indicators", ar: "المؤشرات الاقتصادية الكلية" },
                    { code: "banking", en: "Banking & Monetary Policy", ar: "القطاع المصرفي والسياسة النقدية" },
                    { code: "trade", en: "Trade & External Sector", ar: "التجارة والقطاع الخارجي" },
                    { code: "fiscal", en: "Public Finance & Fiscal", ar: "المالية العامة والمالية" },
                    { code: "currency", en: "Currency & Exchange Rates", ar: "العملة وأسعار الصرف" },
                    { code: "energy", en: "Energy & Fuel", ar: "الطاقة والوقود" },
                    { code: "agriculture", en: "Agriculture & Food Security", ar: "الزراعة والأمن الغذائي" },
                    { code: "labor", en: "Labor Market & Wages", ar: "سوق العمل والأجور" },
                    { code: "poverty", en: "Poverty & Human Development", ar: "الفقر والتنمية البشرية" },
                    { code: "infrastructure", en: "Infrastructure & Reconstruction", ar: "البنية التحتية والإعمار" },
                    { code: "investment", en: "Investment Climate", ar: "مناخ الاستثمار" },
                    { code: "microfinance", en: "Microfinance & Inclusion", ar: "التمويل الأصغر والشمول" },
                    { code: "conflict", en: "Conflict Economy", ar: "اقتصاد الصراع" },
                    { code: "aid", en: "Aid Flows & Humanitarian", ar: "تدفقات المساعدات والإنسانية" },
                    { code: "private", en: "Private Sector", ar: "القطاع الخاص" },
                    { code: "digital", en: "Digital Economy", ar: "الاقتصاد الرقمي" },
                  ].map((sector) => (
                    <div key={sector.code} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{isAr ? sector.ar : sector.en}</div>
                        <div className="text-xs text-muted-foreground">v2.0 — March 2026</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={async () => {
                          try {
                            const result = await (utils.methodologyDownloads.downloadMarkdown as any).fetch({ sectorCode: sector.code });
                            if (!result) {
                              alert(isAr ? 'الوثيقة غير متوفرة بعد' : 'Document not yet available for this sector');
                              return;
                            }
                            const blob = new Blob([result.content], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = result.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch {
                            alert(isAr ? 'الوثيقة غير متوفرة بعد' : 'Document not yet available for this sector');
                          }
                        }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
