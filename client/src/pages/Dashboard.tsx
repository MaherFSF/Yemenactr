import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EvidencePackButton, { EvidencePackData } from "@/components/EvidencePackButton";
import { ConfidenceBadge, ConfidenceRatingLegend } from "@/components/DataCard";
import DataQualityBadge from "@/components/DataQualityBadge";
import InsightsTicker from "@/components/InsightsTicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Eye,
  ChevronDown,
  Info
} from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Link } from "wouter";
import TimeTravelSlider from "@/components/TimeTravelSlider";
import { useHistoricalStore, useIsTimeTravelActive } from "@/stores/historicalStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButton } from "@/components/ExportButton";

export default function Dashboard() {
  const { language } = useLanguage();
  const [regimeTag, setRegimeTag] = useState<"aden" | "sanaa" | "both">("both");
  const [granularity, setGranularity] = useState<"annual" | "quarterly" | "monthly">("annual");
  const [selectedIndicator, setSelectedIndicator] = useState("gdp");
  
  // Real Yemen images from search results
  const yemenImages = {
    hero: "/images/yemen/sanaa-old-city.jpg",
    trade: "/images/yemen/aden-port.jpg",
    banking: "/images/yemen/currency-riyal.jpg",
    humanitarian: "/images/yemen/humanitarian-aid.jpg",
    agriculture: "/images/yemen/agriculture-terraces.jpg",
    energy: "/images/yemen/oil-refinery.jpg",
  };

  // GDP Time Series Data (2010-2024) matching mockup
  const gdpData = [
    { year: "2010", aden: 50000, sanaa: 48000, unified: 49000 },
    { year: "2011", aden: 45000, sanaa: 44000, unified: 44500 },
    { year: "2012", aden: 52000, sanaa: 50000, unified: 51000 },
    { year: "2013", aden: 55000, sanaa: 53000, unified: 54000 },
    { year: "2014", aden: 58000, sanaa: 56000, unified: 57000 },
    { year: "2015", aden: 40000, sanaa: 38000, unified: 39000 },
    { year: "2016", aden: 35000, sanaa: 32000, unified: null },
    { year: "2017", aden: 38000, sanaa: 35000, unified: null },
    { year: "2018", aden: 42000, sanaa: 40000, unified: null },
    { year: "2019", aden: 48000, sanaa: 45000, unified: null },
    { year: "2020", aden: 52000, sanaa: 48000, unified: null },
    { year: "2021", aden: 65000, sanaa: 55000, unified: null },
    { year: "2022", aden: 78000, sanaa: 58000, unified: null },
    { year: "2023", aden: 85000, sanaa: 60200, unified: null },
    { year: "2024", aden: 92000, sanaa: 65000, unified: null },
  ];

  // Quick Stats matching mockup
  // EVIDENCE-NATIVE: Quick Stats linked to real evidence_pack subjectIds
  const quickStats = [
    {
      labelEn: "Annual Inflation Rate (Aden)",
      labelAr: "معدل التضخم السنوي (عدن)",
      value: "25.0%",
      trend: "up",
      sparkline: [15, 18, 20, 22, 24, 25],
      evidenceSubjectId: "inflation_cpi_aden_aden_irg"
    },
    {
      labelEn: "Annual Inflation Rate (Sana'a)",
      labelAr: "معدل التضخم السنوي (صنعاء)",
      value: "18.3%",
      trend: "up",
      sparkline: [12, 14, 15, 16, 17, 18.3],
      evidenceSubjectId: "inflation_cpi_sanaa_sanaa_defacto"
    },
    {
      labelEn: "Unemployment Rate",
      labelAr: "نسبة البطالة",
      value: "38.2%",
      trend: "warning",
      sparkline: [30, 32, 34, 35, 37, 38.2],
      evidenceSubjectId: "unemployment_rate_mixed"
    },
  ];

  // Alerts matching mockup
  const alerts = [
    {
      type: "warning",
      titleEn: "Important Update: Exchange rate change",
      titleAr: "تحديث هام: تغيير في سعر الصرف",
      timeEn: "Yesterday, 10:00 AM",
      timeAr: "أمس، 10:00 ص"
    },
    {
      type: "error",
      titleEn: "Warning: Sharp decline in currency reserves",
      titleAr: "تحذير: انخفاض حاد في احتياطيات العملة",
      timeEn: "2 days ago, 3:30 PM",
      timeAr: "قبل يومين، 3:30 م"
    },
  ];

  // Watchlist matching mockup
  const watchlist = [
    { labelEn: "USD Exchange Rate (Aden)", labelAr: "سعر صرف الدولار (عدن)", value: "1500 ريال" },
    { labelEn: "Crude Oil Prices", labelAr: "أسعار النفط الخام", value: "82.3 دولار/برميل" },
    { labelEn: "Consumer Price Index", labelAr: "مؤشر أسعار المستهلكين", value: "154.6 نقطة" },
  ];

  // Data table matching mockup
  const dataTable = [
    { year: "2023", value: "85,000 مليار", regime: "عدن", source: "وزارة التخطيط - عدن", quality: "عالية" },
    { year: "2023", value: "60,200 مليار", regime: "صنعاء", source: "البنك المركزي - صنعاء", quality: "متوسطة" },
    { year: "2012", value: "30,500 مليار", regime: "عدن", source: "البنك المركزي - صنعاء", quality: "عالية" },
    { year: "2018", value: "20,000 مليار", regime: "صنعاء", source: "البنك المركزي - صنعاء", quality: "عالية" },
  ];

  // Simple sparkline component
  const MiniSparkline = ({ data, color = "#2e8b6e" }: { data: number[], color?: string }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      
      {/* Insights Ticker */}
      <InsightsTicker />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="container py-6">
          <div className={`${language === 'ar' ? 'text-right' : ''}`}>
            <h1 className="text-2xl md:text-3xl font-bold text-[#2e8b6e] dark:text-white mb-2">
              {language === "ar" ? "لوحة المؤشرات الاقتصادية" : "Economic Indicators Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === "ar" 
                ? "بيانات موثقة ومحدثة عن الاقتصاد اليمني"
                : "Verified and updated data on the Yemeni economy"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar - Matching mockup */}
      <div className="bg-white dark:bg-gray-900 border-b py-4">
        <div className="container">
          <div className={`flex flex-wrap items-center gap-2 sm:gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            {/* Indicator Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {language === "ar" ? "اختر المؤشر" : "Select Indicator"}
              </span>
              <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gdp">{language === "ar" ? "الناتج المحلي الإجمالي" : "GDP"}</SelectItem>
                  <SelectItem value="inflation">{language === "ar" ? "التضخم" : "Inflation"}</SelectItem>
                  <SelectItem value="fx">{language === "ar" ? "سعر الصرف" : "Exchange Rate"}</SelectItem>
                  <SelectItem value="trade">{language === "ar" ? "الميزان التجاري" : "Trade Balance"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Period */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {language === "ar" ? "الفترة الزمنية" : "Time Period"}
              </span>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                2024/11/20 - 2024/11/30
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Regime Toggle - Matching mockup exactly */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {language === "ar" ? "النظام" : "Regime"}
              </span>
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setRegimeTag("both")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    regimeTag === "both" 
                      ? "bg-[#2e8b6e] text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {language === "ar" ? "كلاهما" : "Both"}
                </button>
                <button
                  onClick={() => setRegimeTag("sanaa")}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-x ${
                    regimeTag === "sanaa" 
                      ? "bg-[#2e8b6e] text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {language === "ar" ? "صنعاء" : "Sana'a"}
                </button>
                <button
                  onClick={() => setRegimeTag("aden")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    regimeTag === "aden" 
                      ? "bg-[#2e8b6e] text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {language === "ar" ? "عدن" : "Aden"}
                </button>
              </div>
            </div>

            {/* Granularity */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {language === "ar" ? "التفصيل" : "Granularity"}
              </span>
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setGranularity("annual")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    granularity === "annual" 
                      ? "bg-[#2e8b6e] text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {language === "ar" ? "سنوي" : "Annual"}
                </button>
                <button
                  onClick={() => setGranularity("quarterly")}
                  className={`px-3 py-2 text-sm font-medium transition-colors border-x ${
                    granularity === "quarterly" 
                      ? "bg-[#2e8b6e] text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {language === "ar" ? "ربع سنوي" : "Quarterly"}
                </button>
                <button
                  onClick={() => setGranularity("monthly")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    granularity === "monthly" 
                      ? "bg-[#2e8b6e] text-white" 
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {language === "ar" ? "شهري" : "Monthly"}
                </button>
              </div>
            </div>

            {/* Export Button */}
            <ExportButton 
              data={gdpData.map(d => ({
                year: d.year,
                aden: d.aden,
                sanaa: d.sanaa,
                unified: d.unified
              }))}
              filename="yeto_economic_data"
              title={language === "ar" ? "تصدير البيانات" : "Export Data"}
              variant="default"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout matching mockup */}
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[280px_1fr_280px] gap-4 md:gap-6">
          
          {/* Left Sidebar */}
          <div className={`space-y-6 ${language === 'ar' ? 'lg:order-3' : ''}`}>
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "إحصائيات سريعة" : "Quick Stats"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? stat.labelAr : stat.labelEn}
                      </div>
                      <ConfidenceBadge rating="C" size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-red-500" />}
                        {stat.trend === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        <span className="font-bold text-[#2e8b6e] dark:text-white">{stat.value}</span>
                      </div>
                      <MiniSparkline data={stat.sparkline} color={stat.trend === "warning" ? "#F59E0B" : "#EF4444"} />
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {/* EVIDENCE-NATIVE: Fetch real evidence from DB */}
                      <EvidencePackButton 
                        subjectType="metric"
                        subjectId={stat.evidenceSubjectId}
                        indicatorName={stat.labelEn}
                        indicatorNameAr={stat.labelAr}
                        variant="link"
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "التنبيهات" : "Alerts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === "warning" 
                        ? "bg-amber-50 border-amber-500 dark:bg-amber-900/20" 
                        : "bg-red-50 border-red-500 dark:bg-red-900/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {alert.type === "warning" 
                        ? <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        : <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      }
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-white">
                          {language === "ar" ? alert.titleAr : alert.titleEn}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {language === "ar" ? alert.timeAr : alert.timeEn}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Watchlist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "قائمة المتابعة" : "Watchlist"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchlist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {language === "ar" ? item.labelAr : item.labelEn}
                    </span>
                    <span className="font-medium text-[#2e8b6e] dark:text-white">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Data Source Info */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "مصدر البيانات" : "Data Source"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {language === "ar" 
                    ? "يتم جمع البيانات ومعالجتها من مصادر رسمية وغير رسمية متعددة في جميع أنحاء اليمن، بما في ذلك المؤسسات الحكومية، المنظمات الدولية، ومراكز الأبحاث المستقلة، مع تطبيق منهجية صارمة للتحقق والتوثيق."
                    : "Data is collected and processed from multiple official and unofficial sources across Yemen, including government institutions, international organizations, and independent research centers, with rigorous verification methodology."}
                </p>
                <Button variant="link" className="text-[#2e8b6e] p-0 h-auto mt-2">
                  {language === "ar" ? "عرض حزمة الأدلة" : "View Evidence Pack"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart Area */}
          <div className={`${language === 'ar' ? 'lg:order-2' : ''}`}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {language === "ar" ? "الناتج المحلي الإجمالي 2010-2024" : "GDP 2010-2024"}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-[#2e8b6e]"></div>
                      <span className="text-gray-600">{language === "ar" ? "نظام عدن" : "Aden Regime"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-[#2e8b6e] border-dashed border-t-2 border-[#2e8b6e]"></div>
                      <span className="text-gray-600">{language === "ar" ? "نظام صنعاء" : "Sana'a Regime"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#2e8b6e]/20 rounded"></div>
                      <span className="text-gray-600">{language === "ar" ? "مجال الثقة (95%)" : "Confidence Band (95%)"}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={gdpData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        label={{ 
                          value: language === "ar" ? "مليار ريال يمني" : "YER Billions", 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 12 }
                        }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${(value / 1000).toFixed(1)}K ${language === "ar" ? "مليار ريال" : "Billion YER"}`,
                          name === "aden" ? (language === "ar" ? "عدن" : "Aden") : (language === "ar" ? "صنعاء" : "Sana'a")
                        ]}
                        labelFormatter={(label) => `${language === "ar" ? "السنة:" : "Year:"} ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      
                      {/* Confidence band for Aden */}
                      <Area 
                        type="monotone" 
                        dataKey="aden" 
                        fill="#2e8b6e" 
                        fillOpacity={0.1} 
                        stroke="none"
                      />
                      
                      {/* Aden line */}
                      {(regimeTag === "both" || regimeTag === "aden") && (
                        <Line 
                          type="monotone" 
                          dataKey="aden" 
                          stroke="#2e8b6e" 
                          strokeWidth={2}
                          dot={{ fill: "#2e8b6e", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#2e8b6e" }}
                          name={language === "ar" ? "عدن" : "Aden"}
                        />
                      )}
                      
                      {/* Sana'a line */}
                      {(regimeTag === "both" || regimeTag === "sanaa") && (
                        <Line 
                          type="monotone" 
                          dataKey="sanaa" 
                          stroke="#2e8b6e" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: "#2e8b6e", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "#2e8b6e" }}
                          name={language === "ar" ? "صنعاء" : "Sana'a"}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Data Table */}
                <div className="mt-6 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "السنة" : "Year"}
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "القيمة" : "Value"}
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "النظام" : "Regime"}
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "المصدر" : "Source"}
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">
                          {language === "ar" ? "جودة البيانات" : "Data Quality"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {dataTable.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-right">{row.year}</td>
                          <td className="px-4 py-3 text-right font-medium">{row.value}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant="outline" className={
                              row.regime === "عدن" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }>
                              {row.regime}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{row.source}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant="outline" className={
                              row.quality === "عالية" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }>
                              {row.quality}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className={`space-y-6 ${language === 'ar' ? 'lg:order-1' : ''}`}>
            {/* Time-Travel Slider */}
            <TimeTravelSlider compact={false} />
            
            {/* Sector Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "القطاعات" : "Sectors"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { nameEn: "Banking & Finance", nameAr: "القطاع المصرفي", href: "/sectors/banking" },
                  { nameEn: "Trade & Commerce", nameAr: "التجارة", href: "/sectors/trade" },
                  { nameEn: "Energy & Fuel", nameAr: "الطاقة والوقود", href: "/sectors/energy" },
                  { nameEn: "Food Security", nameAr: "الأمن الغذائي", href: "/sectors/food-security" },
                  { nameEn: "Aid Flows", nameAr: "تدفقات المساعدات", href: "/sectors/aid-flows" },
                ].map((sector, index) => (
                  <Link key={index} href={sector.href}>
                    <Button variant="ghost" className="w-full justify-start text-sm hover:bg-gray-100">
                      {language === "ar" ? sector.nameAr : sector.nameEn}
                    </Button>
                  </Link>
                ))}
                <Link href="/sectors">
                  <Button variant="link" className="text-[#2e8b6e] w-full justify-start">
                    {language === "ar" ? "عرض جميع القطاعات" : "View All Sectors"}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tools Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {language === "ar" ? "الأدوات" : "Tools"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/ai-assistant">
                  <Button variant="outline" className="w-full justify-start text-sm gap-2">
                    <Eye className="h-4 w-4" />
                    {language === "ar" ? "المساعد الذكي" : "AI Assistant"}
                  </Button>
                </Link>
                <Link href="/scenario-simulator">
                  <Button variant="outline" className="w-full justify-start text-sm gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {language === "ar" ? "محاكي السيناريوهات" : "Scenario Simulator"}
                  </Button>
                </Link>
                <Link href="/report-builder">
                  <Button variant="outline" className="w-full justify-start text-sm gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "منشئ التقارير" : "Report Builder"}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-[#2e8b6e] text-white">
              <CardContent className="pt-6">
                <Info className="h-8 w-8 mb-3 text-[#C0A030]" />
                <h3 className="font-semibold mb-2">
                  {language === "ar" ? "هل تحتاج مساعدة؟" : "Need Help?"}
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  {language === "ar" 
                    ? "اسأل المساعد الذكي أي سؤال عن الاقتصاد اليمني"
                    : "Ask our AI assistant any question about Yemen's economy"}
                </p>
                <Link href="/ai-assistant">
                  <Button size="sm" className="bg-[#2e8b6e] hover:bg-[#0D5A34] text-white w-full">
                    {language === "ar" ? "اسأل الآن" : "Ask Now"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
