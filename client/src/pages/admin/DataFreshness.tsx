/**
 * YETO Data Freshness / Staleness SLA Admin Page
 * 
 * Monitor data freshness and enforce SLA thresholds:
 * - Track last update times for all indicators
 * - Define SLA thresholds per frequency
 * - Alert on stale data
 * - Create GAP tickets automatically
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  RefreshCw,
  Calendar,
  TrendingUp,
  Filter,
  Mail,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

// SLA thresholds by frequency
const DEFAULT_SLA_THRESHOLDS = {
  daily: { warning: 2, critical: 7 },      // days
  weekly: { warning: 10, critical: 21 },   // days
  monthly: { warning: 45, critical: 90 },  // days
  quarterly: { warning: 120, critical: 180 }, // days
  annual: { warning: 400, critical: 730 }, // days
};

type SLAStatus = "fresh" | "warning" | "critical" | "unknown";

interface IndicatorFreshness {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  sector: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  lastUpdate: Date;
  daysSinceUpdate: number;
  slaStatus: SLAStatus;
  source: string;
  regimeTag: string;
  autoTicketEnabled: boolean;
}

// Generate mock freshness data
const generateFreshnessData = (): IndicatorFreshness[] => {
  const indicators = [
    { code: "fx_rate_official", name: "Official Exchange Rate", nameAr: "سعر الصرف الرسمي", sector: "currency", frequency: "daily" as const },
    { code: "fx_rate_parallel", name: "Parallel Exchange Rate", nameAr: "سعر الصرف الموازي", sector: "currency", frequency: "daily" as const },
    { code: "inflation_cpi", name: "CPI Inflation", nameAr: "معدل التضخم", sector: "prices", frequency: "monthly" as const },
    { code: "food_prices", name: "Food Price Index", nameAr: "مؤشر أسعار الغذاء", sector: "prices", frequency: "weekly" as const },
    { code: "fuel_prices", name: "Fuel Prices", nameAr: "أسعار الوقود", sector: "energy", frequency: "weekly" as const },
    { code: "trade_balance", name: "Trade Balance", nameAr: "الميزان التجاري", sector: "trade", frequency: "monthly" as const },
    { code: "remittances", name: "Remittances", nameAr: "التحويلات المالية", sector: "finance", frequency: "quarterly" as const },
    { code: "gdp_nominal", name: "GDP Nominal", nameAr: "الناتج المحلي الإجمالي", sector: "macro", frequency: "annual" as const },
    { code: "unemployment", name: "Unemployment Rate", nameAr: "معدل البطالة", sector: "labor", frequency: "annual" as const },
    { code: "idp_population", name: "IDP Population", nameAr: "النازحون داخلياً", sector: "humanitarian", frequency: "monthly" as const },
    { code: "health_facilities", name: "Health Facilities", nameAr: "المرافق الصحية", sector: "health", frequency: "quarterly" as const },
    { code: "oil_exports", name: "Oil Exports", nameAr: "صادرات النفط", sector: "energy", frequency: "monthly" as const },
  ];

  return indicators.map((ind, i) => {
    // Simulate various freshness states
    const daysSinceUpdate = Math.floor(Math.random() * 200);
    const thresholds = DEFAULT_SLA_THRESHOLDS[ind.frequency];
    
    let slaStatus: SLAStatus;
    if (daysSinceUpdate <= thresholds.warning) {
      slaStatus = "fresh";
    } else if (daysSinceUpdate <= thresholds.critical) {
      slaStatus = "warning";
    } else {
      slaStatus = "critical";
    }

    const lastUpdate = new Date();
    lastUpdate.setDate(lastUpdate.getDate() - daysSinceUpdate);

    return {
      id: `ind_${i}`,
      code: ind.code,
      name: ind.name,
      nameAr: ind.nameAr,
      sector: ind.sector,
      frequency: ind.frequency,
      lastUpdate,
      daysSinceUpdate,
      slaStatus,
      source: ["World Bank", "IMF", "CBY", "OCHA", "WFP"][Math.floor(Math.random() * 5)],
      regimeTag: Math.random() > 0.5 ? "aden_irg" : "sanaa_defacto",
      autoTicketEnabled: Math.random() > 0.3,
    };
  });
};

export default function DataFreshness() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [slaThresholds, setSlaThresholds] = useState(DEFAULT_SLA_THRESHOLDS);
  
  const freshnessData = useMemo(() => generateFreshnessData(), []);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const total = freshnessData.length;
    const fresh = freshnessData.filter(d => d.slaStatus === "fresh").length;
    const warning = freshnessData.filter(d => d.slaStatus === "warning").length;
    const critical = freshnessData.filter(d => d.slaStatus === "critical").length;
    
    return {
      total,
      fresh,
      warning,
      critical,
      healthPercent: Math.round((fresh / total) * 100),
    };
  }, [freshnessData]);
  
  // Filter data
  const filteredData = useMemo(() => {
    return freshnessData.filter(d => {
      if (sectorFilter !== "all" && d.sector !== sectorFilter) return false;
      if (statusFilter !== "all" && d.slaStatus !== statusFilter) return false;
      if (frequencyFilter !== "all" && d.frequency !== frequencyFilter) return false;
      return true;
    });
  }, [freshnessData, sectorFilter, statusFilter, frequencyFilter]);
  
  // Get status badge
  const getStatusBadge = (status: SLAStatus) => {
    switch (status) {
      case "fresh":
        return <Badge className="bg-green-500">{isArabic ? "محدث" : "Fresh"}</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">{isArabic ? "تحذير" : "Warning"}</Badge>;
      case "critical":
        return <Badge className="bg-red-500">{isArabic ? "حرج" : "Critical"}</Badge>;
      default:
        return <Badge variant="outline">{isArabic ? "غير معروف" : "Unknown"}</Badge>;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: SLAStatus) => {
    switch (status) {
      case "fresh":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };
  
  // Handle creating a GAP ticket
  const handleCreateTicket = (indicator: IndicatorFreshness) => {
    toast.success(
      isArabic 
        ? `تم إنشاء تذكرة فجوة لـ ${indicator.nameAr}`
        : `Created GAP ticket for ${indicator.name}`
    );
  };
  
  // Handle toggling auto-ticket
  const handleToggleAutoTicket = (indicatorId: string) => {
    toast.info(
      isArabic
        ? "تم تحديث إعدادات التذكرة التلقائية"
        : "Auto-ticket settings updated"
    );
  };

  return (
    <div className={`p-6 space-y-6 ${isArabic ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            {isArabic ? "حداثة البيانات واتفاقيات مستوى الخدمة" : "Data Freshness & SLA"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? "مراقبة حداثة البيانات وتطبيق عتبات اتفاقية مستوى الخدمة"
              : "Monitor data freshness and enforce SLA thresholds"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            {isArabic ? "إعدادات التنبيهات" : "Alert Settings"}
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {isArabic ? "تحديث" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "صحة النظام" : "System Health"}
                </p>
                <p className="text-2xl font-bold">{stats.healthPercent}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
            <Progress value={stats.healthPercent} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "محدث" : "Fresh"}
                </p>
                <p className="text-2xl font-bold text-green-600">{stats.fresh}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "تحذير" : "Warning"}
                </p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "حرج" : "Critical"}
                </p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="indicators">
        <TabsList>
          <TabsTrigger value="indicators">
            <Calendar className="w-4 h-4 mr-2" />
            {isArabic ? "المؤشرات" : "Indicators"}
          </TabsTrigger>
          <TabsTrigger value="sla">
            <Settings className="w-4 h-4 mr-2" />
            {isArabic ? "إعدادات SLA" : "SLA Settings"}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-2" />
            {isArabic ? "التنبيهات" : "Alerts"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="mt-4">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {isArabic ? "تصفية:" : "Filters:"}
                  </span>
                </div>
                
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={isArabic ? "القطاع" : "Sector"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="currency">{isArabic ? "العملة" : "Currency"}</SelectItem>
                    <SelectItem value="prices">{isArabic ? "الأسعار" : "Prices"}</SelectItem>
                    <SelectItem value="trade">{isArabic ? "التجارة" : "Trade"}</SelectItem>
                    <SelectItem value="macro">{isArabic ? "الاقتصاد الكلي" : "Macro"}</SelectItem>
                    <SelectItem value="humanitarian">{isArabic ? "الإنسانية" : "Humanitarian"}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={isArabic ? "الحالة" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="fresh">{isArabic ? "محدث" : "Fresh"}</SelectItem>
                    <SelectItem value="warning">{isArabic ? "تحذير" : "Warning"}</SelectItem>
                    <SelectItem value="critical">{isArabic ? "حرج" : "Critical"}</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={isArabic ? "التكرار" : "Frequency"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="daily">{isArabic ? "يومي" : "Daily"}</SelectItem>
                    <SelectItem value="weekly">{isArabic ? "أسبوعي" : "Weekly"}</SelectItem>
                    <SelectItem value="monthly">{isArabic ? "شهري" : "Monthly"}</SelectItem>
                    <SelectItem value="quarterly">{isArabic ? "ربع سنوي" : "Quarterly"}</SelectItem>
                    <SelectItem value="annual">{isArabic ? "سنوي" : "Annual"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Indicators Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "حالة حداثة المؤشرات" : "Indicator Freshness Status"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? `عرض ${filteredData.length} من ${freshnessData.length} مؤشر`
                  : `Showing ${filteredData.length} of ${freshnessData.length} indicators`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "المؤشر" : "Indicator"}</TableHead>
                    <TableHead>{isArabic ? "التكرار" : "Frequency"}</TableHead>
                    <TableHead>{isArabic ? "آخر تحديث" : "Last Update"}</TableHead>
                    <TableHead>{isArabic ? "الأيام منذ التحديث" : "Days Since"}</TableHead>
                    <TableHead>{isArabic ? "المصدر" : "Source"}</TableHead>
                    <TableHead>{isArabic ? "تذكرة تلقائية" : "Auto-Ticket"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map(indicator => (
                    <TableRow key={indicator.id}>
                      <TableCell>
                        {getStatusIcon(indicator.slaStatus)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {isArabic ? indicator.nameAr : indicator.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{indicator.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{indicator.frequency}</Badge>
                      </TableCell>
                      <TableCell>
                        {indicator.lastUpdate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={
                          indicator.slaStatus === "critical" ? "text-red-600 font-bold" :
                          indicator.slaStatus === "warning" ? "text-yellow-600" :
                          "text-green-600"
                        }>
                          {indicator.daysSinceUpdate} {isArabic ? "يوم" : "days"}
                        </span>
                      </TableCell>
                      <TableCell>{indicator.source}</TableCell>
                      <TableCell>
                        <Switch
                          checked={indicator.autoTicketEnabled}
                          onCheckedChange={() => handleToggleAutoTicket(indicator.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {indicator.slaStatus !== "fresh" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateTicket(indicator)}
                            >
                              <Ticket className="w-3 h-3 mr-1" />
                              {isArabic ? "تذكرة" : "Ticket"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "عتبات اتفاقية مستوى الخدمة" : "SLA Thresholds"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "تكوين عتبات التحذير والحرجة لكل تكرار"
                  : "Configure warning and critical thresholds per frequency"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(slaThresholds).map(([freq, thresholds]) => (
                  <div key={freq} className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <p className="font-medium capitalize">{freq}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "البيانات" : "Data"} {freq}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        {isArabic ? "تحذير (أيام)" : "Warning (days)"}
                      </label>
                      <Input
                        type="number"
                        value={thresholds.warning}
                        onChange={(e) => setSlaThresholds({
                          ...slaThresholds,
                          [freq]: { ...thresholds, warning: parseInt(e.target.value) }
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        {isArabic ? "حرج (أيام)" : "Critical (days)"}
                      </label>
                      <Input
                        type="number"
                        value={thresholds.critical}
                        onChange={(e) => setSlaThresholds({
                          ...slaThresholds,
                          [freq]: { ...thresholds, critical: parseInt(e.target.value) }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => toast.success(isArabic ? "تم حفظ الإعدادات" : "Settings saved")}>
                    {isArabic ? "حفظ الإعدادات" : "Save Settings"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "إعدادات التنبيهات" : "Alert Settings"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "تكوين كيفية إرسال التنبيهات عند انتهاك SLA"
                  : "Configure how alerts are sent when SLA is breached"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {isArabic ? "تنبيهات البريد الإلكتروني" : "Email Alerts"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic
                          ? "إرسال بريد إلكتروني عند انتهاك SLA"
                          : "Send email when SLA is breached"}
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {isArabic ? "إنشاء تذكرة تلقائي" : "Auto-Create Tickets"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic
                          ? "إنشاء تذكرة GAP تلقائياً للحالات الحرجة"
                          : "Automatically create GAP ticket for critical status"}
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {isArabic ? "ملخص يومي" : "Daily Digest"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic
                          ? "إرسال ملخص يومي لحالة SLA"
                          : "Send daily summary of SLA status"}
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
