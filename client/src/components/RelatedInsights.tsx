/**
 * Related Insights Components
 * 
 * Reusable UI components that show related content from the knowledge graph.
 * These can be dropped into any page to show:
 * - Related Documents
 * - Related Entities
 * - Related Datasets
 * - Related Events
 * - Contradictions
 * - "Why am I seeing this?" explanations
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Building2,
  Database,
  Calendar,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Link2,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

// Types
interface RelatedItem {
  id: number;
  type: string;
  label: string;
  linkType: string;
  strength: number;
  whyLinked: string;
  evidenceSnippet?: string;
  confidenceLevel: string;
}

interface ContradictionItem {
  sourceA: { type: string; id: number; value: string };
  sourceB: { type: string; id: number; value: string };
  notes: string;
}

interface RelatedItemsData {
  documents: RelatedItem[];
  entities: RelatedItem[];
  datasets: RelatedItem[];
  events: RelatedItem[];
  contradictions: ContradictionItem[];
}

// ============================================================================
// MAIN COMPONENT - RelatedInsightsPanel
// ============================================================================

interface RelatedInsightsPanelProps {
  sourceType: "entity" | "document" | "series" | "event" | "sector" | "indicator" | "update";
  sourceId: number;
  sourceLabel?: string;
  showDocuments?: boolean;
  showEntities?: boolean;
  showDatasets?: boolean;
  showEvents?: boolean;
  showContradictions?: boolean;
  maxItems?: number;
  className?: string;
}

export function RelatedInsightsPanel({
  sourceType,
  sourceId,
  sourceLabel,
  showDocuments = true,
  showEntities = true,
  showDatasets = true,
  showEvents = true,
  showContradictions = true,
  maxItems = 5,
  className = "",
}: RelatedInsightsPanelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  
  const { data, isLoading, error } = trpc.graph.getRelatedItems.useQuery({
    sourceType,
    sourceId,
    maxItems,
  });
  
  if (isLoading) {
    return <RelatedInsightsSkeleton />;
  }
  
  if (error || !data) {
    return null;
  }
  
  const hasContent = 
    (showDocuments && data.documents.length > 0) ||
    (showEntities && data.entities.length > 0) ||
    (showDatasets && data.datasets.length > 0) ||
    (showEvents && data.events.length > 0) ||
    (showContradictions && data.contradictions.length > 0);
  
  if (!hasContent) {
    return null;
  }
  
  return (
    <div className={`space-y-4 ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      {showDocuments && data.documents.length > 0 && (
        <RelatedDocumentsPanel items={data.documents} maxItems={maxItems} />
      )}
      
      {showEntities && data.entities.length > 0 && (
        <RelatedEntitiesPanel items={data.entities} maxItems={maxItems} />
      )}
      
      {showDatasets && data.datasets.length > 0 && (
        <RelatedDatasetsPanel items={data.datasets} maxItems={maxItems} />
      )}
      
      {showEvents && data.events.length > 0 && (
        <RelatedEventsPanel items={data.events} maxItems={maxItems} />
      )}
      
      {showContradictions && data.contradictions.length > 0 && (
        <ContradictionsPanel items={data.contradictions} />
      )}
    </div>
  );
}

// ============================================================================
// RELATED DOCUMENTS PANEL
// ============================================================================

interface RelatedDocumentsPanelProps {
  items: RelatedItem[];
  maxItems?: number;
  title?: string;
}

export function RelatedDocumentsPanel({
  items,
  maxItems = 5,
  title,
}: RelatedDocumentsPanelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [expanded, setExpanded] = useState(false);
  
  const displayItems = expanded ? items : items.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          {title || (isRTL ? "البحوث والتقارير ذات الصلة" : "Related Research & Reports")}
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayItems.map((item) => (
            <RelatedItemCard
              key={`doc-${item.id}`}
              item={item}
              icon={<FileText className="h-4 w-4" />}
              href={`/research-hub/${item.id}`}
            />
          ))}
        </div>
        
        {items.length > maxItems && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? (isRTL ? "عرض أقل" : "Show less")
              : (isRTL ? `عرض الكل (${items.length})` : `Show all (${items.length})`)}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RELATED ENTITIES PANEL
// ============================================================================

interface RelatedEntitiesPanelProps {
  items: RelatedItem[];
  maxItems?: number;
  title?: string;
}

export function RelatedEntitiesPanel({
  items,
  maxItems = 5,
  title,
}: RelatedEntitiesPanelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [expanded, setExpanded] = useState(false);
  
  const displayItems = expanded ? items : items.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-emerald-500" />
          {title || (isRTL ? "المؤسسات وأصحاب المصلحة الرئيسيون" : "Key Institutions & Stakeholders")}
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayItems.map((item) => (
            <RelatedItemCard
              key={`entity-${item.id}`}
              item={item}
              icon={<Building2 className="h-4 w-4" />}
              href={`/entities/${item.id}`}
            />
          ))}
        </div>
        
        {items.length > maxItems && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? (isRTL ? "عرض أقل" : "Show less")
              : (isRTL ? `عرض الكل (${items.length})` : `Show all (${items.length})`)}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RELATED DATASETS PANEL
// ============================================================================

interface RelatedDatasetsPanelProps {
  items: RelatedItem[];
  maxItems?: number;
  title?: string;
}

export function RelatedDatasetsPanel({
  items,
  maxItems = 5,
  title,
}: RelatedDatasetsPanelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [expanded, setExpanded] = useState(false);
  
  const displayItems = expanded ? items : items.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-4 w-4 text-purple-500" />
          {title || (isRTL ? "المؤشرات والبيانات ذات الصلة" : "Related Indicators & Data")}
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayItems.map((item) => (
            <RelatedItemCard
              key={`dataset-${item.id}`}
              item={item}
              icon={<TrendingUp className="h-4 w-4" />}
              href={`/datasets/${item.id}`}
            />
          ))}
        </div>
        
        {items.length > maxItems && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? (isRTL ? "عرض أقل" : "Show less")
              : (isRTL ? `عرض الكل (${items.length})` : `Show all (${items.length})`)}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RELATED EVENTS PANEL
// ============================================================================

interface RelatedEventsPanelProps {
  items: RelatedItem[];
  maxItems?: number;
  title?: string;
}

export function RelatedEventsPanel({
  items,
  maxItems = 5,
  title,
}: RelatedEventsPanelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [expanded, setExpanded] = useState(false);
  
  const displayItems = expanded ? items : items.slice(0, maxItems);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-500" />
          {title || (isRTL ? "الأحداث على الجدول الزمني" : "Events on the Timeline")}
          <Badge variant="secondary" className="ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayItems.map((item) => (
            <RelatedItemCard
              key={`event-${item.id}`}
              item={item}
              icon={<Calendar className="h-4 w-4" />}
              href={`/timeline?event=${item.id}`}
            />
          ))}
        </div>
        
        {items.length > maxItems && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded 
              ? (isRTL ? "عرض أقل" : "Show less")
              : (isRTL ? `عرض الكل (${items.length})` : `Show all (${items.length})`)}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CONTRADICTIONS PANEL
// ============================================================================

interface ContradictionsPanelProps {
  items: ContradictionItem[];
  title?: string;
}

export function ContradictionsPanel({
  items,
  title,
}: ContradictionsPanelProps) {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  
  if (items.length === 0) return null;
  
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          {title || (isRTL ? "تناقضات في البيانات" : "Data Contradictions")}
          <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {isRTL ? "مصادر متعارضة" : "Conflicting Sources"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">{item.sourceA.type}</span>
                    {" vs "}
                    <span className="font-medium">{item.sourceB.type}</span>
                  </div>
                  {item.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {isRTL 
            ? "تُعرض التناقضات لضمان الشفافية. راجع المصادر الأصلية للتحقق."
            : "Contradictions are shown for transparency. Review original sources to verify."}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// RELATED ITEM CARD (INDIVIDUAL ITEM)
// ============================================================================

interface RelatedItemCardProps {
  item: RelatedItem;
  icon: React.ReactNode;
  href: string;
}

function RelatedItemCard({ item, icon, href }: RelatedItemCardProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  return (
    <Link href={href}>
      <div className="group flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {item.label}
            </span>
            <StrengthIndicator strength={item.strength} />
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className="text-xs h-5">
              {getLinkTypeLabel(item.linkType, isRTL)}
            </Badge>
            <WhyLinkedPopover item={item} />
          </div>
        </div>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

// ============================================================================
// WHY LINKED POPOVER
// ============================================================================

interface WhyLinkedPopoverProps {
  item: RelatedItem;
}

function WhyLinkedPopover({ item }: WhyLinkedPopoverProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className="h-3 w-3 mr-1" />
          {isRTL ? "لماذا؟" : "Why?"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">
              {isRTL ? "لماذا أرى هذا؟" : "Why am I seeing this?"}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">
                {isRTL ? "قاعدة الربط:" : "Linking rule:"}
              </span>
              <p className="mt-1">{item.whyLinked}</p>
            </div>
            
            {item.evidenceSnippet && (
              <div>
                <span className="text-muted-foreground">
                  {isRTL ? "الدليل:" : "Evidence:"}
                </span>
                <p className="mt-1 text-xs bg-muted p-2 rounded italic">
                  "{item.evidenceSnippet}"
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-4 pt-2 border-t">
              <div>
                <span className="text-muted-foreground text-xs">
                  {isRTL ? "القوة:" : "Strength:"}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <StrengthIndicator strength={item.strength} showLabel />
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground text-xs">
                  {isRTL ? "الثقة:" : "Confidence:"}
                </span>
                <div className="mt-0.5">
                  <ConfidenceBadge level={item.confidenceLevel} />
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground border-t pt-2">
            {isRTL 
              ? "جميع الروابط مدعومة بأدلة أو قواعد محددة. لا توجد علاقات مخترعة."
              : "All links are evidence-backed or rule-based. No invented relationships."}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StrengthIndicator({ strength, showLabel = false }: { strength: number; showLabel?: boolean }) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const getColor = () => {
    if (strength >= 0.8) return "bg-emerald-500";
    if (strength >= 0.6) return "bg-blue-500";
    if (strength >= 0.4) return "bg-amber-500";
    return "bg-gray-400";
  };
  
  const getLabel = () => {
    if (strength >= 0.8) return isRTL ? "قوي" : "Strong";
    if (strength >= 0.6) return isRTL ? "متوسط" : "Medium";
    if (strength >= 0.4) return isRTL ? "ضعيف" : "Weak";
    return isRTL ? "غير مؤكد" : "Uncertain";
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getColor()}`} />
            {showLabel && (
              <span className="text-xs text-muted-foreground">{getLabel()}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isRTL ? "قوة الارتباط:" : "Link strength:"} {Math.round(strength * 100)}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const config: Record<string, { label: string; labelAr: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    high: { label: "High", labelAr: "عالي", variant: "default" },
    medium: { label: "Medium", labelAr: "متوسط", variant: "secondary" },
    low: { label: "Low", labelAr: "منخفض", variant: "outline" },
    uncertain: { label: "Uncertain", labelAr: "غير مؤكد", variant: "destructive" },
  };
  
  const c = config[level] || config.medium;
  
  return (
    <Badge variant={c.variant} className="text-xs">
      {isRTL ? c.labelAr : c.label}
    </Badge>
  );
}

function getLinkTypeLabel(linkType: string, isRTL: boolean): string {
  const labels: Record<string, { en: string; ar: string }> = {
    publishes: { en: "Publishes", ar: "ينشر" },
    funds: { en: "Funds", ar: "يمول" },
    implements: { en: "Implements", ar: "ينفذ" },
    located_in: { en: "Located in", ar: "يقع في" },
    mentions: { en: "Mentions", ar: "يذكر" },
    measures: { en: "Measures", ar: "يقيس" },
    affects: { en: "Affects", ar: "يؤثر على" },
    related_to: { en: "Related to", ar: "مرتبط بـ" },
    contradicts: { en: "Contradicts", ar: "يتناقض مع" },
    supersedes: { en: "Supersedes", ar: "يحل محل" },
    update_signal: { en: "Update", ar: "تحديث" },
    suspected_link: { en: "Suspected", ar: "مشتبه به" },
    temporal_cooccurrence: { en: "Same period", ar: "نفس الفترة" },
    cites: { en: "Cites", ar: "يستشهد بـ" },
    derived_from: { en: "Derived from", ar: "مشتق من" },
    part_of: { en: "Part of", ar: "جزء من" },
    regulates: { en: "Regulates", ar: "ينظم" },
    operates_in: { en: "Operates in", ar: "يعمل في" },
  };
  
  const l = labels[linkType] || { en: linkType, ar: linkType };
  return isRTL ? l.ar : l.en;
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

function RelatedInsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-4 w-4" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// ADDITIONAL EXPORTS (non-function components already exported inline)
// ============================================================================

export {
  WhyLinkedPopover,
  StrengthIndicator,
  ConfidenceBadge,
  RelatedInsightsSkeleton,
};
