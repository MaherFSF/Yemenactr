import { CheckCircle, AlertTriangle, HelpCircle, Info, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DQAFStatus = "pass" | "needs_review" | "unknown";

interface DQAFDimension {
  name: string;
  nameAr: string;
  status: DQAFStatus;
  description: string;
  descriptionAr: string;
  details?: string;
  detailsAr?: string;
}

interface DQAFPanelProps {
  integrity: DQAFStatus;
  methodology: DQAFStatus;
  accuracyReliability: DQAFStatus;
  serviceability: DQAFStatus;
  accessibility: DQAFStatus;
  language?: "en" | "ar";
  compact?: boolean;
}

const translations = {
  en: {
    title: "DQAF Quality Panel",
    subtitle: "IMF Data Quality Assessment Framework",
    integrity: "Integrity",
    integrityDesc: "Institutional environment, statistical processes, and ethical standards",
    methodology: "Methodology",
    methodologyDesc: "Concepts, definitions, and classification systems used",
    accuracy: "Accuracy & Reliability",
    accuracyDesc: "Source data quality, statistical techniques, and validation",
    serviceability: "Serviceability",
    serviceabilityDesc: "Timeliness, periodicity, and consistency over time",
    accessibility: "Accessibility",
    accessibilityDesc: "Data availability, metadata, and user support",
    pass: "Pass",
    needsReview: "Needs Review",
    unknown: "Unknown",
    dimensionsPass: "dimensions pass",
    note: "Note: This panel shows 5 independent quality dimensions. We do not combine them into a single score.",
  },
  ar: {
    title: "لوحة جودة DQAF",
    subtitle: "إطار تقييم جودة البيانات لصندوق النقد الدولي",
    integrity: "النزاهة",
    integrityDesc: "البيئة المؤسسية والعمليات الإحصائية والمعايير الأخلاقية",
    methodology: "المنهجية",
    methodologyDesc: "المفاهيم والتعريفات وأنظمة التصنيف المستخدمة",
    accuracy: "الدقة والموثوقية",
    accuracyDesc: "جودة البيانات المصدرية والتقنيات الإحصائية والتحقق",
    serviceability: "قابلية الخدمة",
    serviceabilityDesc: "التوقيت والدورية والاتساق عبر الزمن",
    accessibility: "إمكانية الوصول",
    accessibilityDesc: "توفر البيانات والبيانات الوصفية ودعم المستخدمين",
    pass: "ناجح",
    needsReview: "يحتاج مراجعة",
    unknown: "غير معروف",
    dimensionsPass: "أبعاد ناجحة",
    note: "ملاحظة: تعرض هذه اللوحة 5 أبعاد جودة مستقلة. لا نجمعها في درجة واحدة.",
  },
};

const statusConfig = {
  pass: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900",
    border: "border-green-200 dark:border-green-800",
    progress: 100,
  },
  needs_review: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900",
    border: "border-amber-200 dark:border-amber-800",
    progress: 50,
  },
  unknown: {
    icon: HelpCircle,
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    progress: 0,
  },
};

function DimensionRow({
  name,
  description,
  status,
  language,
  compact,
}: {
  name: string;
  description: string;
  status: DQAFStatus;
  language: "en" | "ar";
  compact?: boolean;
}) {
  const t = translations[language];
  const config = statusConfig[status];
  const Icon = config.icon;
  const isRTL = language === "ar";

  const statusLabel = status === "pass" ? t.pass : status === "needs_review" ? t.needsReview : t.unknown;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg cursor-help",
                config.bg,
                config.border,
                "border",
                isRTL && "flex-row-reverse"
              )}
            >
              <Icon className={cn("h-4 w-4", config.color)} />
              <span className="text-xs font-medium truncate">{name}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isRTL ? "left" : "right"} className="max-w-xs">
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            <Badge className={cn("mt-2", config.bg, config.color)}>{statusLabel}</Badge>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg",
        config.bg,
        config.border,
        "border",
        isRTL && "flex-row-reverse text-right"
      )}
    >
      <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("flex items-center justify-between gap-2", isRTL && "flex-row-reverse")}>
          <h4 className="font-medium text-sm">{name}</h4>
          <Badge variant="outline" className={cn("text-xs", config.color, config.border)}>
            {statusLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export function DQAFPanel({
  integrity,
  methodology,
  accuracyReliability,
  serviceability,
  accessibility,
  language = "en",
  compact = false,
}: DQAFPanelProps) {
  const t = translations[language];
  const isRTL = language === "ar";

  const dimensions: DQAFDimension[] = [
    {
      name: t.integrity,
      nameAr: translations.ar.integrity,
      status: integrity,
      description: t.integrityDesc,
      descriptionAr: translations.ar.integrityDesc,
    },
    {
      name: t.methodology,
      nameAr: translations.ar.methodology,
      status: methodology,
      description: t.methodologyDesc,
      descriptionAr: translations.ar.methodologyDesc,
    },
    {
      name: t.accuracy,
      nameAr: translations.ar.accuracy,
      status: accuracyReliability,
      description: t.accuracyDesc,
      descriptionAr: translations.ar.accuracyDesc,
    },
    {
      name: t.serviceability,
      nameAr: translations.ar.serviceability,
      status: serviceability,
      description: t.serviceabilityDesc,
      descriptionAr: translations.ar.serviceabilityDesc,
    },
    {
      name: t.accessibility,
      nameAr: translations.ar.accessibility,
      status: accessibility,
      description: t.accessibilityDesc,
      descriptionAr: translations.ar.accessibilityDesc,
    },
  ];

  const passCount = dimensions.filter((d) => d.status === "pass").length;

  if (compact) {
    return (
      <div className={cn("space-y-2", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
        <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t.title}</span>
          <Badge variant="secondary" className="text-xs">
            {passCount}/5 {t.dimensionsPass}
          </Badge>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {dimensions.map((dim) => (
            <DimensionRow
              key={dim.name}
              name={dim.name}
              description={dim.description}
              status={dim.status}
              language={language}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t.title}</CardTitle>
          </div>
          <Badge variant="secondary">
            {passCount}/5 {t.dimensionsPass}
          </Badge>
        </div>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {dimensions.map((dim) => (
          <DimensionRow
            key={dim.name}
            name={dim.name}
            description={dim.description}
            status={dim.status}
            language={language}
          />
        ))}

        {/* Note about not combining scores */}
        <div className={cn("flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>{t.note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini badge version for inline display
export function DQAFBadge({
  integrity,
  methodology,
  accuracyReliability,
  serviceability,
  accessibility,
  language = "en",
}: Omit<DQAFPanelProps, "compact">) {
  const t = translations[language];
  const isRTL = language === "ar";

  const statuses = [integrity, methodology, accuracyReliability, serviceability, accessibility];
  const passCount = statuses.filter((s) => s === "pass").length;
  const hasIssues = statuses.some((s) => s === "needs_review");

  const bgColor = passCount === 5
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : hasIssues
    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

  const Icon = passCount === 5 ? CheckCircle : hasIssues ? AlertTriangle : HelpCircle;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("cursor-help", bgColor)}>
            <Icon className="h-3 w-3 mr-1" />
            DQAF {passCount}/5
          </Badge>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? "left" : "right"} className="w-64">
          <DQAFPanel
            integrity={integrity}
            methodology={methodology}
            accuracyReliability={accuracyReliability}
            serviceability={serviceability}
            accessibility={accessibility}
            language={language}
            compact
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default DQAFPanel;
