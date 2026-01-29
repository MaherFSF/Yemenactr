/**
 * YETO Quality Assurance Dashboard
 * 
 * Features:
 * - Schema validation on ingest
 * - Unit normalization checks
 * - Duplicate detection
 * - Continuity checks
 * - Contradiction detection
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileSearch,
  Copy,
  GitCompare,
  Scale,
  TrendingUp,
  Clock,
  Eye,
  Play,
} from "lucide-react";

// Quality gate types
interface QualityGate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  status: "pass" | "fail" | "warning" | "pending";
  lastRun: Date;
  passRate: number;
  totalChecks: number;
  failedChecks: number;
}

interface QualityIssue {
  id: string;
  gateId: string;
  gateName: string;
  severity: "critical" | "high" | "medium" | "low";
  datasetId: string;
  datasetName: string;
  indicator?: string;
  description: string;
  descriptionAr: string;
  detectedAt: Date;
  status: "open" | "resolved" | "ignored";
  resolution?: string;
}

// Mock quality gates
const mockGates: QualityGate[] = [
  {
    id: "schema",
    name: "Schema Validation",
    nameAr: "التحقق من المخطط",
    description: "Validates data structure and field types",
    descriptionAr: "التحقق من بنية البيانات وأنواع الحقول",
    status: "pass",
    lastRun: new Date(Date.now() - 3600000),
    passRate: 98.5,
    totalChecks: 1250,
    failedChecks: 19,
  },
  {
    id: "units",
    name: "Unit Normalization",
    nameAr: "توحيد الوحدات",
    description: "Ensures consistent units across datasets",
    descriptionAr: "ضمان توحيد الوحدات عبر مجموعات البيانات",
    status: "warning",
    lastRun: new Date(Date.now() - 7200000),
    passRate: 92.3,
    totalChecks: 850,
    failedChecks: 65,
  },
  {
    id: "duplicates",
    name: "Duplicate Detection",
    nameAr: "كشف التكرار",
    description: "Identifies duplicate records and series",
    descriptionAr: "تحديد السجلات والسلاسل المكررة",
    status: "pass",
    lastRun: new Date(Date.now() - 1800000),
    passRate: 99.8,
    totalChecks: 3500,
    failedChecks: 7,
  },
  {
    id: "continuity",
    name: "Continuity Checks",
    nameAr: "فحوصات الاستمرارية",
    description: "Detects gaps and breaks in time series",
    descriptionAr: "كشف الفجوات والانقطاعات في السلاسل الزمنية",
    status: "warning",
    lastRun: new Date(Date.now() - 5400000),
    passRate: 87.2,
    totalChecks: 620,
    failedChecks: 79,
  },
  {
    id: "contradictions",
    name: "Contradiction Detection",
    nameAr: "كشف التناقضات",
    description: "Identifies conflicting values from different sources",
    descriptionAr: "تحديد القيم المتناقضة من مصادر مختلفة",
    status: "fail",
    lastRun: new Date(Date.now() - 900000),
    passRate: 78.5,
    totalChecks: 420,
    failedChecks: 90,
  },
  {
    id: "outliers",
    name: "Outlier Detection",
    nameAr: "كشف القيم الشاذة",
    description: "Flags statistical outliers and anomalies",
    descriptionAr: "تحديد القيم الشاذة والحالات الشاذة إحصائياً",
    status: "pass",
    lastRun: new Date(Date.now() - 2700000),
    passRate: 95.1,
    totalChecks: 1800,
    failedChecks: 88,
  },
];

// Mock issues
const mockIssues: QualityIssue[] = [
  {
    id: "i1",
    gateId: "contradictions",
    gateName: "Contradiction Detection",
    severity: "critical",
    datasetId: "ds_exchange_rate",
    datasetName: "Exchange Rate",
    indicator: "YER/USD",
    description: "CBY Aden reports 1,890 YER/USD while CBY Sana'a reports 535 YER/USD for same date",
    descriptionAr: "البنك المركزي عدن يبلغ 1,890 ريال/دولار بينما البنك المركزي صنعاء يبلغ 535 ريال/دولار لنفس التاريخ",
    detectedAt: new Date(Date.now() - 3600000),
    status: "open",
  },
  {
    id: "i2",
    gateId: "continuity",
    gateName: "Continuity Checks",
    severity: "high",
    datasetId: "ds_inflation",
    datasetName: "Inflation Rate",
    indicator: "CPI Monthly",
    description: "Missing data for Q2 2024 (April-June)",
    descriptionAr: "بيانات مفقودة للربع الثاني 2024 (أبريل-يونيو)",
    detectedAt: new Date(Date.now() - 86400000),
    status: "open",
  },
  {
    id: "i3",
    gateId: "units",
    gateName: "Unit Normalization",
    severity: "medium",
    datasetId: "ds_trade",
    datasetName: "Trade Balance",
    indicator: "Exports",
    description: "Mixed units: some values in USD millions, others in USD thousands",
    descriptionAr: "وحدات مختلطة: بعض القيم بملايين الدولارات، وأخرى بآلاف الدولارات",
    detectedAt: new Date(Date.now() - 172800000),
    status: "resolved",
    resolution: "Normalized all values to USD millions",
  },
  {
    id: "i4",
    gateId: "duplicates",
    gateName: "Duplicate Detection",
    severity: "low",
    datasetId: "ds_gdp",
    datasetName: "GDP Estimates",
    description: "Duplicate record found for 2023 annual GDP from World Bank",
    descriptionAr: "سجل مكرر للناتج المحلي الإجمالي السنوي 2023 من البنك الدولي",
    detectedAt: new Date(Date.now() - 259200000),
    status: "resolved",
    resolution: "Removed duplicate, kept latest version",
  },
  {
    id: "i5",
    gateId: "outliers",
    gateName: "Outlier Detection",
    severity: "medium",
    datasetId: "ds_remittances",
    datasetName: "Remittances",
    indicator: "Monthly Inflows",
    description: "Value 3.2x higher than historical average for December 2024",
    descriptionAr: "القيمة أعلى بـ 3.2 مرة من المتوسط التاريخي لديسمبر 2024",
    detectedAt: new Date(Date.now() - 43200000),
    status: "open",
  },
];

export default function QADashboard() {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  
  const [gates] = useState<QualityGate[]>(mockGates);
  const [issues] = useState<QualityIssue[]>(mockIssues);
  const [isRunning, setIsRunning] = useState(false);

  // Calculate overall stats
  const overallPassRate = gates.reduce((sum, g) => sum + g.passRate, 0) / gates.length;
  const totalIssues = issues.filter(i => i.status === "open").length;
  const criticalIssues = issues.filter(i => i.status === "open" && i.severity === "critical").length;

  // Get gate icon
  const getGateIcon = (gateId: string) => {
    switch (gateId) {
      case "schema": return <FileSearch className="w-5 h-5" />;
      case "units": return <Scale className="w-5 h-5" />;
      case "duplicates": return <Copy className="w-5 h-5" />;
      case "continuity": return <TrendingUp className="w-5 h-5" />;
      case "contradictions": return <GitCompare className="w-5 h-5" />;
      case "outliers": return <AlertTriangle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: QualityGate["status"]) => {
    switch (status) {
      case "pass":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />{isArabic ? "ناجح" : "Pass"}</Badge>;
      case "fail":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />{isArabic ? "فشل" : "Fail"}</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />{isArabic ? "تحذير" : "Warning"}</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{isArabic ? "قيد الانتظار" : "Pending"}</Badge>;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: QualityIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-600">{isArabic ? "حرج" : "Critical"}</Badge>;
      case "high":
        return <Badge className="bg-orange-500">{isArabic ? "عالي" : "High"}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">{isArabic ? "متوسط" : "Medium"}</Badge>;
      case "low":
        return <Badge className="bg-blue-500">{isArabic ? "منخفض" : "Low"}</Badge>;
    }
  };

  // Run all gates
  const handleRunAllGates = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className={`p-6 space-y-6 ${isArabic ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {isArabic ? "لوحة ضمان الجودة" : "Quality Assurance Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isArabic
              ? "مراقبة بوابات الجودة وحل المشكلات"
              : "Monitor quality gates and resolve issues"}
          </p>
        </div>
        <Button onClick={handleRunAllGates} disabled={isRunning}>
          {isRunning ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {isArabic ? "تشغيل جميع البوابات" : "Run All Gates"}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "معدل النجاح الإجمالي" : "Overall Pass Rate"}</p>
                <p className="text-2xl font-bold text-green-600">{overallPassRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
            <Progress value={overallPassRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "المشكلات المفتوحة" : "Open Issues"}</p>
                <p className="text-2xl font-bold text-yellow-600">{totalIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "المشكلات الحرجة" : "Critical Issues"}</p>
                <p className="text-2xl font-bold text-red-600">{criticalIssues}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isArabic ? "البوابات النشطة" : "Active Gates"}</p>
                <p className="text-2xl font-bold">{gates.length}</p>
              </div>
              <Shield className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="gates">
        <TabsList>
          <TabsTrigger value="gates">
            <Shield className="w-4 h-4 mr-2" />
            {isArabic ? "بوابات الجودة" : "Quality Gates"}
          </TabsTrigger>
          <TabsTrigger value="issues">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {isArabic ? "المشكلات" : "Issues"} ({totalIssues})
          </TabsTrigger>
        </TabsList>

        {/* Quality Gates Tab */}
        <TabsContent value="gates" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {gates.map(gate => (
              <Card key={gate.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getGateIcon(gate.id)}
                      <CardTitle className="text-lg">
                        {isArabic ? gate.nameAr : gate.name}
                      </CardTitle>
                    </div>
                    {getStatusBadge(gate.status)}
                  </div>
                  <CardDescription>
                    {isArabic ? gate.descriptionAr : gate.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{isArabic ? "معدل النجاح" : "Pass Rate"}</span>
                      <span className={`font-medium ${gate.passRate >= 95 ? "text-green-600" : gate.passRate >= 85 ? "text-yellow-600" : "text-red-600"}`}>
                        {gate.passRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={gate.passRate} 
                      className={`h-2 ${gate.passRate >= 95 ? "[&>div]:bg-green-500" : gate.passRate >= 85 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500"}`}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{gate.totalChecks.toLocaleString()} {isArabic ? "فحص" : "checks"}</span>
                      <span>{gate.failedChecks} {isArabic ? "فشل" : "failed"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {isArabic ? "آخر تشغيل:" : "Last run:"} {gate.lastRun.toLocaleTimeString()}
                      </span>
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        {isArabic ? "تشغيل" : "Run"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "مشكلات الجودة" : "Quality Issues"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? "المشكلات المكتشفة التي تحتاج إلى حل"
                  : "Detected issues requiring resolution"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "الخطورة" : "Severity"}</TableHead>
                    <TableHead>{isArabic ? "البوابة" : "Gate"}</TableHead>
                    <TableHead>{isArabic ? "مجموعة البيانات" : "Dataset"}</TableHead>
                    <TableHead>{isArabic ? "الوصف" : "Description"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map(issue => (
                    <TableRow key={issue.id}>
                      <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getGateIcon(issue.gateId)}
                          <span className="text-sm">{issue.gateName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{issue.datasetName}</p>
                          {issue.indicator && (
                            <p className="text-xs text-muted-foreground">{issue.indicator}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate">
                          {isArabic ? issue.descriptionAr : issue.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        {issue.status === "open" ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            {isArabic ? "مفتوح" : "Open"}
                          </Badge>
                        ) : issue.status === "resolved" ? (
                          <Badge className="bg-green-500">
                            {isArabic ? "تم الحل" : "Resolved"}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {isArabic ? "تم التجاهل" : "Ignored"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {issue.status === "open" && (
                            <Button size="sm" variant="ghost" className="text-green-600">
                              <CheckCircle className="w-4 h-4" />
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
      </Tabs>
    </div>
  );
}
