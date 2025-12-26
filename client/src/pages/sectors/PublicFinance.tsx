import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Landmark,
  Download,
  Info,
  AlertTriangle,
  FileText,
  ArrowLeft,
  Users
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PublicFinance() {
  const { language } = useLanguage();

  // Revenue data
  const revenueData = [
    { year: "2014", oil: 4.2, customs: 1.8, taxes: 1.2, other: 0.8 },
    { year: "2015", oil: 1.5, customs: 0.8, taxes: 0.6, other: 0.4 },
    { year: "2016", oil: 0.8, customs: 0.5, taxes: 0.4, other: 0.3 },
    { year: "2017", oil: 1.2, customs: 0.6, taxes: 0.5, other: 0.3 },
    { year: "2018", oil: 1.8, customs: 0.8, taxes: 0.6, other: 0.4 },
    { year: "2019", oil: 1.5, customs: 0.7, taxes: 0.5, other: 0.3 },
    { year: "2020", oil: 0.9, customs: 0.5, taxes: 0.4, other: 0.2 },
    { year: "2021", oil: 1.1, customs: 0.6, taxes: 0.5, other: 0.3 },
    { year: "2022", oil: 1.4, customs: 0.7, taxes: 0.5, other: 0.3 },
    { year: "2023", oil: 1.2, customs: 0.6, taxes: 0.4, other: 0.3 },
  ];

  // Expenditure breakdown
  const expenditureData = [
    { name: language === "ar" ? "الرواتب" : "Salaries", value: 45, color: "#103050" },
    { name: language === "ar" ? "الدفاع والأمن" : "Defense & Security", value: 25, color: "#107040" },
    { name: language === "ar" ? "الخدمات" : "Services", value: 15, color: "#C0A030" },
    { name: language === "ar" ? "البنية التحتية" : "Infrastructure", value: 8, color: "#6B7280" },
    { name: language === "ar" ? "أخرى" : "Other", value: 7, color: "#9CA3AF" },
  ];

  // Salary payment status
  const salaryStatus = [
    { 
      regionEn: "Aden (IRG)", 
      regionAr: "عدن (الشرعية)",
      status: "Irregular",
      statusAr: "غير منتظم",
      lastPayment: "Nov 2024",
      arrears: "3-4 months"
    },
    { 
      regionEn: "Sana'a (DFA)", 
      regionAr: "صنعاء (الأمر الواقع)",
      status: "Suspended",
      statusAr: "متوقف",
      lastPayment: "Aug 2016",
      arrears: "8+ years"
    },
    { 
      regionEn: "Marib", 
      regionAr: "مأرب",
      status: "Regular",
      statusAr: "منتظم",
      lastPayment: "Dec 2024",
      arrears: "None"
    },
  ];

  const kpis = [
    {
      titleEn: "Total Revenue (IRG)",
      titleAr: "إجمالي الإيرادات (الشرعية)",
      value: "$2.5B",
      change: -8.5,
      source: "MoF Aden",
      confidence: "C",
      regime: "IRG"
    },
    {
      titleEn: "Oil Revenue",
      titleAr: "إيرادات النفط",
      value: "$1.2B",
      change: -14.3,
      source: "MoF Aden",
      confidence: "C",
      regime: "IRG"
    },
    {
      titleEn: "Public Employees",
      titleAr: "الموظفون العموميون",
      value: "1.2M",
      change: 0,
      source: "MoCS",
      confidence: "C"
    },
    {
      titleEn: "Salary Arrears",
      titleAr: "متأخرات الرواتب",
      value: "$8.5B+",
      change: 12.0,
      source: "Estimates",
      confidence: "D"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-blue-950/30 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mb-4 gap-2">
                <ArrowLeft className="h-4 w-4" />
                {language === "ar" ? "العودة إلى لوحة المعلومات" : "Back to Dashboard"}
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Landmark className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-sm border-blue-200 text-blue-700">
                {language === "ar" ? "القطاع الحكومي" : "Government Sector"}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {language === "ar" 
                ? "المالية العامة والحوكمة"
                : "Public Finance & Governance"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === "ar"
                ? "تحليل الإيرادات والنفقات الحكومية ورواتب القطاع العام"
                : "Analysis of government revenues, expenditures, and public sector salaries"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Warning Banner */}
        <Card className="mb-8 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                  {language === "ar" ? "أزمة الرواتب" : "Salary Crisis"}
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {language === "ar"
                    ? "أكثر من مليون موظف حكومي في مناطق صنعاء لم يتلقوا رواتب منتظمة منذ 2016. هذه أزمة إنسانية واقتصادية كبرى."
                    : "Over 1 million public employees in Sana'a areas have not received regular salaries since 2016. This is a major humanitarian and economic crisis."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center justify-between">
                  <span>{language === "ar" ? kpi.titleAr : kpi.titleEn}</span>
                  <div className="flex items-center gap-1">
                    {kpi.regime && (
                      <Badge variant="default" className="text-xs">
                        {kpi.regime}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {kpi.confidence}
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  {kpi.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${kpi.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {kpi.source}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="revenue">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">
              {language === "ar" ? "الإيرادات" : "Revenue"}
            </TabsTrigger>
            <TabsTrigger value="expenditure">
              {language === "ar" ? "النفقات" : "Expenditure"}
            </TabsTrigger>
            <TabsTrigger value="salaries">
              {language === "ar" ? "الرواتب" : "Salaries"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "ar" ? "الإيرادات الحكومية (2014-2023)" : "Government Revenue (2014-2023)"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar" ? "بالمليار دولار أمريكي" : "In billions USD"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تصدير" : "Export"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="oil" stackId="a" fill="#103050" name={language === "ar" ? "النفط" : "Oil"} />
                    <Bar dataKey="customs" stackId="a" fill="#107040" name={language === "ar" ? "الجمارك" : "Customs"} />
                    <Bar dataKey="taxes" stackId="a" fill="#C0A030" name={language === "ar" ? "الضرائب" : "Taxes"} />
                    <Bar dataKey="other" stackId="a" fill="#6B7280" name={language === "ar" ? "أخرى" : "Other"} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{language === "ar" ? "ملاحظة" : "Note"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {language === "ar"
                      ? "البيانات تمثل إيرادات الحكومة الشرعية فقط. إيرادات سلطات صنعاء غير متوفرة."
                      : "Data represents IRG revenues only. DFA revenues are not available."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenditure">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "توزيع النفقات الحكومية" : "Government Expenditure Distribution"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "النسبة المئوية (تقديرات 2023)" : "Percentage (2023 estimates)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenditureData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {expenditureData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {expenditureData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salaries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === "ar" ? "حالة رواتب القطاع العام" : "Public Sector Salary Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المنطقة" : "Region"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "الحالة" : "Status"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "آخر دفعة" : "Last Payment"}
                        </th>
                        <th className="text-start p-3 font-medium">
                          {language === "ar" ? "المتأخرات" : "Arrears"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryStatus.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">
                            {language === "ar" ? item.regionAr : item.regionEn}
                          </td>
                          <td className="p-3">
                            <Badge variant={
                              item.status === "Regular" ? "default" : 
                              item.status === "Irregular" ? "secondary" : "destructive"
                            }>
                              {language === "ar" ? item.statusAr : item.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{item.lastPayment}</td>
                          <td className="p-3 text-muted-foreground">{item.arrears}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Research */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "الأبحاث ذات الصلة" : "Related Research"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Yemen Public Finance Assessment</h4>
                <p className="text-sm text-muted-foreground mb-2">World Bank • September 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-1">Salary Crisis and Humanitarian Impact</h4>
                <p className="text-sm text-muted-foreground mb-2">UNDP Yemen • August 2024</p>
                <Badge variant="outline" className="text-xs">PDF</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
