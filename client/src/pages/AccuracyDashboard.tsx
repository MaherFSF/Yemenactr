import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  RefreshCw,
  Database,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
  Download,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

type CheckStatus = 'pass' | 'warning' | 'fail' | 'skipped';

const statusConfig: Record<CheckStatus, { icon: typeof CheckCircle; color: string; bgColor: string }> = {
  pass: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  fail: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  skipped: { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

const categoryLabels: Record<string, { en: string; ar: string }> = {
  completeness: { en: 'Completeness', ar: 'الاكتمال' },
  consistency: { en: 'Consistency', ar: 'الاتساق' },
  accuracy: { en: 'Accuracy', ar: 'الدقة' },
  timeliness: { en: 'Timeliness', ar: 'الحداثة' },
  reliability: { en: 'Reliability', ar: 'الموثوقية' },
};

export default function AccuracyDashboard() {
  const { language } = useLanguage();
  const [isRunning, setIsRunning] = useState(false);
  
  const { data: report, isLoading, refetch, error } = trpc.accuracy.runChecks.useQuery(undefined, {
    enabled: false, // Don't run automatically
    retry: false,
  });

  const handleRunChecks = async () => {
    setIsRunning(true);
    try {
      await refetch();
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#768064] to-[#1a4a70] text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-[#C9A227] text-[#768064]">
              {language === "ar" ? "مراقبة الجودة" : "Quality Control"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === "ar" ? "لوحة فحص الدقة" : "Accuracy Check Dashboard"}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {language === "ar"
                ? "فحص شامل لجودة البيانات ودقتها واتساقها عبر المنصة"
                : "Comprehensive data quality, accuracy, and consistency checks across the platform"}
            </p>
            <Button 
              onClick={handleRunChecks}
              disabled={isRunning || isLoading}
              size="lg"
              className="bg-[#C9A227] hover:bg-[#a08020] text-[#768064]"
            >
              {isRunning || isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الفحص..." : "Running Checks..."}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  {language === "ar" ? "تشغيل فحوصات الدقة" : "Run Accuracy Checks"}
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-800">
                      {language === "ar" ? "خطأ في تشغيل الفحوصات" : "Error Running Checks"}
                    </h3>
                    <p className="text-red-600 text-sm">
                      {language === "ar" 
                        ? "يجب أن تكون مسؤولاً لتشغيل فحوصات الدقة. يرجى تسجيل الدخول بحساب مسؤول."
                        : "You must be an admin to run accuracy checks. Please log in with an admin account."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!report && !error && (
            <Card className="mb-8">
              <CardContent className="py-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  {language === "ar" ? "لم يتم تشغيل الفحوصات بعد" : "No Checks Run Yet"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {language === "ar"
                    ? "انقر على زر 'تشغيل فحوصات الدقة' أعلاه لبدء فحص شامل لجودة البيانات."
                    : "Click the 'Run Accuracy Checks' button above to start a comprehensive data quality check."}
                </p>
              </CardContent>
            </Card>
          )}

          {report && (
            <>
              {/* Overall Score */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#C9A227]" />
                      {language === "ar" ? "النتيجة الإجمالية" : "Overall Score"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className={`text-6xl font-bold ${getScoreColor(report.overallScore)}`}>
                        {report.overallScore}%
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={report.overallScore} 
                          className="h-4 mb-2"
                        />
                        <div className="flex items-center gap-2">
                          {(() => {
                            const config = statusConfig[report.overallStatus as CheckStatus];
                            const Icon = config.icon;
                            return (
                              <Badge className={`${config.bgColor} ${config.color}`}>
                                <Icon className="w-3 h-3 mr-1" />
                                {report.overallStatus.toUpperCase()}
                              </Badge>
                            );
                          })()}
                          <span className="text-sm text-gray-500">
                            {language === "ar" ? "آخر فحص:" : "Last check:"}{" "}
                            {new Date(report.generatedAt).toLocaleString(language === "ar" ? "ar-YE" : "en-US")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {language === "ar" ? "ملخص الفحوصات" : "Check Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          {language === "ar" ? "ناجح" : "Passed"}
                        </span>
                        <span className="font-bold">{report.summary.passed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-yellow-600">
                          <AlertTriangle className="w-4 h-4" />
                          {language === "ar" ? "تحذيرات" : "Warnings"}
                        </span>
                        <span className="font-bold">{report.summary.warnings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-4 h-4" />
                          {language === "ar" ? "فشل" : "Failed"}
                        </span>
                        <span className="font-bold">{report.summary.failed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {language === "ar" ? "إحصائيات البيانات" : "Data Stats"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">{language === "ar" ? "السجلات" : "Records"}</span>
                        <span className="font-bold">{report.dataStats.totalRecords.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">{language === "ar" ? "المؤشرات" : "Indicators"}</span>
                        <span className="font-bold">{report.dataStats.totalIndicators}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">{language === "ar" ? "المصادر" : "Sources"}</span>
                        <span className="font-bold">{report.dataStats.totalSources}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Individual Checks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#C9A227]" />
                      {language === "ar" ? "نتائج الفحوصات التفصيلية" : "Detailed Check Results"}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      {language === "ar" ? "تصدير التقرير" : "Export Report"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.checks.map((check) => {
                      const config = statusConfig[check.status as CheckStatus];
                      const Icon = config.icon;
                      const categoryLabel = categoryLabels[check.category] || { en: check.category, ar: check.category };
                      
                      return (
                        <div
                          key={check.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {language === "ar" ? check.nameAr : check.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {language === "ar" ? check.descriptionAr : check.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(check.score)}`}>
                                {check.score}%
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {language === "ar" ? categoryLabel.ar : categoryLabel.en}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <Progress 
                              value={check.score} 
                              className="h-2"
                            />
                          </div>

                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {check.details}
                          </div>

                          {check.recommendations.length > 0 && (
                            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm font-medium mb-2">
                                <AlertCircle className="w-4 h-4" />
                                {language === "ar" ? "التوصيات" : "Recommendations"}
                              </div>
                              <ul className="space-y-1">
                                {check.recommendations.map((rec, index) => (
                                  <li key={index} className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A227]" />
                {language === "ar" ? "حول فحوصات الدقة" : "About Accuracy Checks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: language === "ar" ? "اكتمال البيانات" : "Data Completeness",
                    description: language === "ar" 
                      ? "يتحقق من وجود جميع نقاط البيانات المتوقعة وعدم وجود فجوات"
                      : "Verifies all expected data points exist without gaps",
                    icon: Database,
                  },
                  {
                    title: language === "ar" ? "الاتساق الزمني" : "Temporal Consistency",
                    description: language === "ar"
                      ? "يكتشف الشذوذ في التواريخ والتسلسلات الزمنية"
                      : "Detects anomalies in dates and time sequences",
                    icon: Clock,
                  },
                  {
                    title: language === "ar" ? "كشف القيم الشاذة" : "Outlier Detection",
                    description: language === "ar"
                      ? "يحدد القيم الإحصائية غير العادية التي قد تشير إلى أخطاء"
                      : "Identifies statistically unusual values that may indicate errors",
                    icon: AlertTriangle,
                  },
                  {
                    title: language === "ar" ? "التحقق عبر المصادر" : "Cross-Source Validation",
                    description: language === "ar"
                      ? "يقارن البيانات من مصادر متعددة للتحقق من الاتساق"
                      : "Compares data from multiple sources for consistency",
                    icon: Shield,
                  },
                  {
                    title: language === "ar" ? "موثوقية المصادر" : "Source Reliability",
                    description: language === "ar"
                      ? "يقيم جودة وموثوقية مصادر البيانات"
                      : "Evaluates the quality and reliability of data sources",
                    icon: CheckCircle,
                  },
                  {
                    title: language === "ar" ? "حداثة البيانات" : "Data Freshness",
                    description: language === "ar"
                      ? "يتحقق من تحديث البيانات بانتظام"
                      : "Checks that data is regularly updated",
                    icon: RefreshCw,
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#C9A227]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
