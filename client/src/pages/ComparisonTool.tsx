import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Download,
  Info,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { YETO_COLORS } from "@/lib/chartTheme";

export default function ComparisonTool() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [comparisonType, setComparisonType] = useState<string>("regional");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["jordan", "iraq"]);

  // Regional peer countries
  const countries = [
    { id: "jordan", nameEn: "Jordan", nameAr: "الأردن" },
    { id: "lebanon", nameEn: "Lebanon", nameAr: "لبنان" },
    { id: "sudan", nameEn: "Sudan", nameAr: "السودان" },
    { id: "iraq", nameEn: "Iraq", nameAr: "العراق" },
  ];

  // GDP Comparison Data (Q4 2025 estimates)
  const gdpData = [
    { country: language === 'ar' ? 'اليمن' : 'Yemen', value: 20.5, color: YETO_COLORS.green },
    { country: language === 'ar' ? 'الأردن' : 'Jordan', value: 52.3, color: '#9CA3AF' },
    { country: language === 'ar' ? 'العراق' : 'Iraq', value: 275.4, color: '#9CA3AF' },
  ];

  // Inflation Comparison Data (updated through Q4 2025)
  const inflationData = [
    { year: '2020', yemen: 16, peers: 3 },
    { year: '2021', yemen: 35.2, peers: 12 },
    { year: '2022', yemen: 35, peers: 6 },
    { year: '2023', yemen: 28, peers: 12 },
    { year: '2024', yemen: 22, peers: 4.5 },
    { year: '2025', yemen: 18, peers: 3.2 },
    { year: '2026', yemen: 15, peers: 2.8 },
  ];

  // Unemployment Comparison Data (Q4 2025 estimates)
  const unemploymentData = [
    { country: language === 'ar' ? 'اليمن' : 'Yemen', value: 36.5, color: YETO_COLORS.green },
    { country: language === 'ar' ? 'الأردن' : 'Jordan', value: 20.8, color: '#9CA3AF' },
    { country: language === 'ar' ? 'العراق' : 'Iraq', value: 14.9, color: '#9CA3AF' },
  ];

  // Trade Balance Comparison Data
  const tradeData = [
    { 
      country: language === 'ar' ? 'اليمن' : 'Yemen', 
      exports: 3.5, 
      imports: 11.5,
      balance: -8
    },
    { 
      country: language === 'ar' ? 'الأردن' : 'Jordan', 
      exports: 22, 
      imports: 22,
      balance: 0
    },
    { 
      country: language === 'ar' ? 'العراق' : 'Iraq', 
      exports: 75, 
      imports: 50,
      balance: 25
    },
  ];

  // Key Insights
  const insights = [
    {
      en: "GDP per capita in Yemen is significantly lower than regional peers.",
      ar: "نصيب الفرد من الناتج المحلي الإجمالي في اليمن أقل بكثير من نظرائه الإقليميين."
    },
    {
      en: "Yemen faces considerably higher and more volatile inflation rates.",
      ar: "يواجه اليمن معدلات تضخم أعلى بكثير وأكثر تقلباً."
    },
    {
      en: "Unemployment in Yemen is more than double the average of selected peers.",
      ar: "البطالة في اليمن أكثر من ضعف متوسط النظراء المختارين."
    },
    {
      en: "Yemen experiences a substantial negative trade balance, heavily reliant on imports.",
      ar: "يعاني اليمن من ميزان تجاري سلبي كبير، معتمداً بشكل كبير على الواردات."
    },
    {
      en: "Export diversification remains a critical challenge compared to Jordan and Iraq.",
      ar: "يظل تنويع الصادرات تحدياً حاسماً مقارنة بالأردن والعراق."
    },
  ];

  const toggleCountry = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(c => c !== countryId)
        : [...prev, countryId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#103050]/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6" style={{ color: YETO_COLORS.navy }} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: YETO_COLORS.navy }}>
                {language === 'ar' ? 'التحليل الاقتصادي المقارن' : 'Comparative Economic Analysis'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Comparison Selector */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {language === 'ar' ? 'محدد المقارنة' : 'COMPARISON SELECTOR'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {language === 'ar' ? 'مقارنة اليمن مع:' : 'Compare Yemen with:'}
                    </span>
                    <Select value={comparisonType} onValueChange={setComparisonType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regional">
                          {language === 'ar' ? 'النظراء الإقليميين' : 'Regional Peers'}
                        </SelectItem>
                        <SelectItem value="mena">
                          {language === 'ar' ? 'منطقة الشرق الأوسط' : 'MENA Region'}
                        </SelectItem>
                        <SelectItem value="ldc">
                          {language === 'ar' ? 'أقل البلدان نمواً' : 'Least Developed'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {countries.map(country => (
                      <div key={country.id} className="flex items-center gap-2">
                        <Checkbox 
                          id={country.id}
                          checked={selectedCountries.includes(country.id)}
                          onCheckedChange={() => toggleCountry(country.id)}
                        />
                        <label htmlFor={country.id} className="text-sm cursor-pointer">
                          {language === 'ar' ? country.nameAr : country.nameEn}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GDP Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {language === 'ar' ? 'مقارنة الناتج المحلي الإجمالي' : 'GDP COMPARISON'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'مقارنة الناتج المحلي الإجمالي (مليار دولار أمريكي)'
                    : 'GDP Comparison (USD Billion)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: YETO_COLORS.green }} />
                    {language === 'ar' ? 'اليمن: أخضر' : 'Yemen: Green'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-400" />
                    {language === 'ar' ? 'النظراء الإقليميون: رمادي' : 'Regional Peers: Gray'}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gdpData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 50]} />
                    <YAxis type="category" dataKey="country" width={80} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value}B`, language === 'ar' ? 'الناتج المحلي' : 'GDP']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {gdpData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-4">
                  {language === 'ar' 
                    ? 'الناتج المحلي الإجمالي لليمن مقارنة بالنظراء الإقليميين المختارين، مما يبرز فروقات حجم السوق.'
                    : "Yemen's GDP in comparison to selected regional peers, highlighting market size differences."}
                </p>
              </CardContent>
            </Card>

            {/* Inflation Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {language === 'ar' ? 'مقارنة التضخم' : 'INFLATION COMPARISON'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'معدل التضخم (السنوي %) - عبر الزمن'
                    : 'Inflation Rate (Annual %) - Over Time'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: YETO_COLORS.green }} />
                    {language === 'ar' ? 'اليمن: خط أخضر' : 'Yemen: Green Line'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-400" />
                    {language === 'ar' ? 'النظراء الإقليميون: خطوط رمادية' : 'Regional Peers: Gray Lines'}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={inflationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 40]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="yemen" 
                      stroke={YETO_COLORS.green} 
                      strokeWidth={3}
                      dot={{ fill: YETO_COLORS.green, strokeWidth: 2 }}
                      name={language === 'ar' ? 'اليمن' : 'Yemen'}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="peers" 
                      stroke="#9CA3AF" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={language === 'ar' ? 'متوسط النظراء' : 'Peers Average'}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-4">
                  {language === 'ar' 
                    ? 'اتجاهات التضخم التاريخية تظهر تقلب اليمن مقارنة بالنظراء.'
                    : "Historical inflation trends showing Yemen's volatility compared to peers."}
                </p>
              </CardContent>
            </Card>

            {/* Unemployment Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {language === 'ar' ? 'مقارنة البطالة' : 'UNEMPLOYMENT COMPARISON'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'معدل البطالة (%)' : 'Unemployment Rate (%)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: YETO_COLORS.green }} />
                    {language === 'ar' ? 'اليمن: شريط أخضر' : 'Yemen: Green Bar'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-400" />
                    {language === 'ar' ? 'النظراء الإقليميون: أشرطة رمادية' : 'Regional Peers: Gray Bars'}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={unemploymentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 40]} />
                    <YAxis type="category" dataKey="country" width={80} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, language === 'ar' ? 'البطالة' : 'Unemployment']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {unemploymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {language === 'ar' 
                        ? `اليمن: 32.5% | إجمالي العاطلين: 4.2 مليون | الأردن: 18.2% | العراق: 14.1%`
                        : `Yemen: 32.5% | Total Unemployed: 4.2M | Jordan: 18.2% | Iraq: 14.1%`}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {language === 'ar' 
                    ? 'معدلات البطالة الحالية تعكس تحديات سوق العمل.'
                    : 'Current unemployment rates reflecting labor market challenges.'}
                </p>
              </CardContent>
            </Card>

            {/* Trade Balance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {language === 'ar' ? 'مقارنة الميزان التجاري' : 'TRADE BALANCE COMPARISON'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'الميزان التجاري (الواردات مقابل الصادرات) (مليار دولار أمريكي)'
                    : 'Trade Balance (Imports vs. Exports) (USD Billion)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: YETO_COLORS.gold }} />
                    {language === 'ar' ? 'الصادرات: ذهبي' : 'Exports: Gold'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: YETO_COLORS.navy }} />
                    {language === 'ar' ? 'الواردات: أزرق داكن' : 'Imports: Navy Blue'}
                  </Badge>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tradeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 80]} />
                    <YAxis type="category" dataKey="country" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="exports" 
                      fill={YETO_COLORS.gold} 
                      name={language === 'ar' ? 'الصادرات' : 'Exports'}
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="imports" 
                      fill={YETO_COLORS.navy} 
                      name={language === 'ar' ? 'الواردات' : 'Imports'}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {language === 'ar' 
                        ? 'اليمن: صادرات $3.5B | واردات $11.5B | الميزان -$8B'
                        : 'Yemen: Exports $3.5B | Imports $11.5B | Balance -$8B'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {language === 'ar' 
                    ? 'عرض مكدس يظهر ديناميكيات التجارة وعجز/فوائض الميزان التجاري.'
                    : 'Stacked view showing trade dynamics and trade deficits/surpluses.'}
                </p>
              </CardContent>
            </Card>

            {/* Export Button */}
            <div className="flex justify-end">
              <Button 
                className="gap-2"
                style={{ backgroundColor: YETO_COLORS.green }}
              >
                <Download className="h-4 w-4" />
                {language === 'ar' ? 'تصدير المقارنة' : 'EXPORT COMPARISON'}
              </Button>
            </div>
          </div>

          {/* Sidebar - Key Insights */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader style={{ backgroundColor: YETO_COLORS.navy }} className="text-white rounded-t-lg">
                <CardTitle className="text-lg">
                  {language === 'ar' ? 'الرؤى الرئيسية' : 'KEY INSIGHTS'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? insight.ar : insight.en}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 py-4">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {language === 'ar' 
              ? 'مرصد اليمن - البيانات حتى الربع الرابع 2023'
              : 'Yemen Observatory - Data as of Q4 2023'}
          </span>
          <div className="flex items-center gap-4">
            <button className="hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
