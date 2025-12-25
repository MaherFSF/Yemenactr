import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Calendar, 
  Tag,
  Search,
  Filter,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { useState } from "react";

export default function Research() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Sample research reports (will be replaced with real data from tRPC)
  const reports = [
    {
      id: 1,
      titleEn: "Yemen Banking Sector Analysis Q4 2024",
      titleAr: "تحليل القطاع المصرفي اليمني - الربع الرابع 2024",
      descriptionEn: "Comprehensive analysis of banking sector performance, liquidity challenges, and regulatory developments in both Aden and Sana'a jurisdictions.",
      descriptionAr: "تحليل شامل لأداء القطاع المصرفي وتحديات السيولة والتطورات التنظيمية في كل من عدن وصنعاء.",
      date: "2024-12-15",
      category: "Banking",
      downloadUrl: "#",
      featured: true,
    },
    {
      id: 2,
      titleEn: "Inflation Dynamics and Monetary Policy Effectiveness",
      titleAr: "ديناميكيات التضخم وفعالية السياسة النقدية",
      descriptionEn: "Examination of inflation trends, currency devaluation impacts, and the effectiveness of monetary policy interventions by the Central Bank of Yemen.",
      descriptionAr: "دراسة اتجاهات التضخم وتأثيرات انخفاض قيمة العملة وفعالية تدخلات السياسة النقدية من قبل البنك المركزي اليمني.",
      date: "2024-11-28",
      category: "Monetary Policy",
      downloadUrl: "#",
      featured: true,
    },
    {
      id: 3,
      titleEn: "Trade Balance and Foreign Exchange Reserves",
      titleAr: "الميزان التجاري واحتياطيات النقد الأجنبي",
      descriptionEn: "Analysis of Yemen's trade balance, import/export trends, and foreign exchange reserve adequacy in the context of ongoing economic challenges.",
      descriptionAr: "تحليل الميزان التجاري لليمن واتجاهات الاستيراد والتصدير وكفاية احتياطيات النقد الأجنبي في سياق التحديات الاقتصادية المستمرة.",
      date: "2024-11-10",
      category: "Trade",
      downloadUrl: "#",
      featured: false,
    },
    {
      id: 4,
      titleEn: "Poverty and Humanitarian Indicators 2024",
      titleAr: "مؤشرات الفقر والوضع الإنساني 2024",
      descriptionEn: "Comprehensive assessment of poverty rates, food security, and humanitarian conditions across different regions of Yemen.",
      descriptionAr: "تقييم شامل لمعدلات الفقر والأمن الغذائي والظروف الإنسانية في مختلف مناطق اليمن.",
      date: "2024-10-22",
      category: "Development",
      downloadUrl: "#",
      featured: false,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" ? "مكتبة الأبحاث" : "Research Library"}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === "ar"
                ? "تقارير وتحليلات اقتصادية شاملة مبنية على بيانات موثقة"
                : "Comprehensive economic reports and analysis built on verified data"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "ar" ? "ابحث في التقارير..." : "Search reports..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {language === "ar" ? "تصفية" : "Filter"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Featured Reports */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">
              {language === "ar" ? "تقارير مميزة" : "Featured Reports"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {reports.filter(r => r.featured).map((report) => (
              <Card key={report.id} className="border-2 border-primary/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <Badge variant="default">{report.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(report.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}
                    </div>
                  </div>
                  <CardTitle className="text-xl">
                    {language === "ar" ? report.titleAr : report.titleEn}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {language === "ar" ? report.descriptionAr : report.descriptionEn}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تحميل التقرير" : "Download Report"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Reports */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">
              {language === "ar" ? "جميع التقارير" : "All Reports"}
            </h2>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{report.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.date).toLocaleDateString(language === "ar" ? "ar-YE" : "en-US")}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2">
                        {language === "ar" ? report.titleAr : report.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? report.descriptionAr : report.descriptionEn}
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2 flex-shrink-0">
                      <Download className="h-4 w-4" />
                      {language === "ar" ? "تحميل" : "Download"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              {language === "ar" 
                ? "هل تحتاج إلى تحليل مخصص؟"
                : "Need Custom Analysis?"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {language === "ar"
                ? "فريقنا من الخبراء يمكنه إعداد تقارير وتحليلات مخصصة بناءً على احتياجاتك المحددة"
                : "Our team of experts can prepare custom reports and analysis tailored to your specific needs"}
            </p>
            <Button size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              {language === "ar" ? "طلب تحليل مخصص" : "Request Custom Analysis"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
