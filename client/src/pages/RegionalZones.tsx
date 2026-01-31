import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Users,
  DollarSign,
  Factory,
  Droplets,
  Zap,
  Building2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function RegionalZones() {
  const { language } = useLanguage();

  // Regional economic data
  const regions = [
    {
      id: "aden",
      nameEn: "Aden",
      nameAr: "عدن",
      control: "IRG",
      population: 1.1,
      gdpShare: 12,
      exchangeRate: 1620,
      inflationRate: 35,
      unemploymentRate: 32,
      keyIndustries: ["Port", "Refinery", "Services", "Trade"],
      keyIndustriesAr: ["الميناء", "المصفاة", "الخدمات", "التجارة"],
      challenges: ["Currency volatility", "Security", "Infrastructure damage"],
      challengesAr: ["تقلب العملة", "الأمن", "تضرر البنية التحتية"],
      color: "#107040"
    },
    {
      id: "sanaa",
      nameEn: "Sana'a",
      nameAr: "صنعاء",
      control: "DFA",
      population: 4.2,
      gdpShare: 28,
      exchangeRate: 535,
      inflationRate: 12,
      unemploymentRate: 38,
      keyIndustries: ["Government", "Services", "Manufacturing", "Agriculture"],
      keyIndustriesAr: ["الحكومة", "الخدمات", "التصنيع", "الزراعة"],
      challenges: ["Sanctions", "Fuel shortages", "Banking isolation"],
      challengesAr: ["العقوبات", "نقص الوقود", "العزلة المصرفية"],
      color: "#1e40af"
    },
    {
      id: "marib",
      nameEn: "Marib",
      nameAr: "مأرب",
      control: "IRG",
      population: 2.8,
      gdpShare: 18,
      exchangeRate: 1620,
      inflationRate: 28,
      unemploymentRate: 25,
      keyIndustries: ["Oil/Gas", "Power Generation", "Agriculture"],
      keyIndustriesAr: ["النفط/الغاز", "توليد الكهرباء", "الزراعة"],
      challenges: ["Conflict frontline", "IDP influx", "Infrastructure strain"],
      challengesAr: ["خط المواجهة", "تدفق النازحين", "ضغط البنية التحتية"],
      color: "#C0A030"
    },
    {
      id: "taiz",
      nameEn: "Taiz",
      nameAr: "تعز",
      control: "Contested",
      population: 3.2,
      gdpShare: 8,
      exchangeRate: 1850,
      inflationRate: 40,
      unemploymentRate: 45,
      keyIndustries: ["Manufacturing", "Agriculture", "Trade"],
      keyIndustriesAr: ["التصنيع", "الزراعة", "التجارة"],
      challenges: ["Siege conditions", "Divided city", "Humanitarian crisis"],
      challengesAr: ["ظروف الحصار", "مدينة منقسمة", "أزمة إنسانية"],
      color: "#dc2626"
    },
    {
      id: "hodeidah",
      nameEn: "Hodeidah",
      nameAr: "الحديدة",
      control: "DFA",
      population: 3.5,
      gdpShare: 15,
      exchangeRate: 535,
      inflationRate: 15,
      unemploymentRate: 42,
      keyIndustries: ["Port", "Fishing", "Agriculture", "Trade"],
      keyIndustriesAr: ["الميناء", "الصيد", "الزراعة", "التجارة"],
      challenges: ["Port restrictions", "Red Sea crisis", "Infrastructure damage"],
      challengesAr: ["قيود الميناء", "أزمة البحر الأحمر", "تضرر البنية التحتية"],
      color: "#7c3aed"
    },
    {
      id: "hadramawt",
      nameEn: "Hadramawt",
      nameAr: "حضرموت",
      control: "IRG",
      population: 1.8,
      gdpShare: 12,
      exchangeRate: 1620,
      inflationRate: 30,
      unemploymentRate: 28,
      keyIndustries: ["Oil", "Agriculture", "Fishing", "Trade"],
      keyIndustriesAr: ["النفط", "الزراعة", "الصيد", "التجارة"],
      challenges: ["Oil export disruption", "Infrastructure", "Governance"],
      challengesAr: ["توقف صادرات النفط", "البنية التحتية", "الحوكمة"],
      color: "#059669"
    },
  ];

  // Comparative data for radar chart
  const comparativeData = regions.map(r => ({
    region: language === "ar" ? r.nameAr : r.nameEn,
    gdpShare: r.gdpShare,
    population: r.population * 10,
    stability: r.control === "Contested" ? 20 : r.control === "DFA" ? 50 : 60,
    infrastructure: r.id === "aden" ? 55 : r.id === "sanaa" ? 45 : r.id === "marib" ? 50 : 30,
    employment: 100 - r.unemploymentRate,
  }));

  // Exchange rate comparison
  const exchangeComparison = [
    { region: language === "ar" ? "عدن" : "Aden", rate: 1620, color: "#107040" },
    { region: language === "ar" ? "صنعاء" : "Sana'a", rate: 535, color: "#1e40af" },
    { region: language === "ar" ? "مأرب" : "Marib", rate: 1620, color: "#C0A030" },
    { region: language === "ar" ? "تعز" : "Taiz", rate: 1850, color: "#dc2626" },
    { region: language === "ar" ? "الحديدة" : "Hodeidah", rate: 535, color: "#7c3aed" },
    { region: language === "ar" ? "حضرموت" : "Hadramawt", rate: 1620, color: "#059669" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-zinc-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container relative h-full flex items-center">
          <div className={`max-w-2xl ${language === 'ar' ? 'mr-auto text-right' : 'ml-0'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-slate-500 text-white border-0">
                {language === "ar" ? "التحليل الإقليمي" : "Regional Analysis"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === "ar" 
                ? "المناطق الاقتصادية"
                : "Economic Zones"}
            </h1>
            <p className="text-xl text-white/90 mb-6">
              {language === "ar"
                ? "تحليل مقارن للمناطق الاقتصادية الرئيسية في اليمن"
                : "Comparative analysis of Yemen's key economic regions"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Context */}
        <Card className="mb-8 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  {language === "ar" ? "سياق الانقسام" : "Division Context"}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {language === "ar"
                    ? "اليمن منقسم بين مناطق سيطرة متعددة: الحكومة المعترف بها دولياً (IRG) في الجنوب، وسلطة الأمر الواقع (DFA/أنصار الله) في الشمال، ومناطق متنازع عليها. هذا يخلق اقتصادات متوازية بأسعار صرف ومعدلات تضخم مختلفة."
                    : "Yemen is divided between multiple control zones: the Internationally Recognized Government (IRG) in the south, De Facto Authority (DFA/Ansar Allah) in the north, and contested areas. This creates parallel economies with different exchange rates and inflation rates."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rate Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "مقارنة أسعار الصرف (يناير 2026)" : "Exchange Rate Comparison (January 2026)"}
            </CardTitle>
            <CardDescription>
              {language === "ar" ? "ريال يمني مقابل دولار أمريكي" : "YER per USD"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exchangeComparison} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 2000]} />
                <YAxis dataKey="region" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="rate" fill="#107040" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {language === "ar"
                  ? "الفرق في سعر الصرف بين مناطق الشمال والجنوب يتجاوز 250%، مما يخلق تشوهات اقتصادية كبيرة وفرص للمراجحة."
                  : "The exchange rate difference between north and south zones exceeds 250%, creating significant economic distortions and arbitrage opportunities."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "ar" ? "المصدر:" : "Source:"} CBY-Aden, Market Reports (January 2026)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Regional Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {regions.map((region) => (
            <Card key={region.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: region.color }} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color: region.color }} />
                    {language === "ar" ? region.nameAr : region.nameEn}
                  </CardTitle>
                  <Badge 
                    variant={region.control === "IRG" ? "default" : region.control === "DFA" ? "secondary" : "destructive"}
                  >
                    {region.control}
                  </Badge>
                </div>
                <CardDescription>
                  {language === "ar" 
                    ? `${region.population} مليون نسمة`
                    : `${region.population}M population`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "سعر الصرف:" : "Exchange Rate:"}
                    </span>
                    <div className="font-semibold">{region.exchangeRate} YER/$</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "التضخم:" : "Inflation:"}
                    </span>
                    <div className="font-semibold">{region.inflationRate}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "البطالة:" : "Unemployment:"}
                    </span>
                    <div className="font-semibold">{region.unemploymentRate}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {language === "ar" ? "حصة الناتج:" : "GDP Share:"}
                    </span>
                    <div className="font-semibold">{region.gdpShare}%</div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {language === "ar" ? "الصناعات الرئيسية:" : "Key Industries:"}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(language === "ar" ? region.keyIndustriesAr : region.keyIndustries).map((ind, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{ind}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {language === "ar" ? "التحديات:" : "Challenges:"}
                  </span>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    {(language === "ar" ? region.challengesAr : region.challenges).map((ch, i) => (
                      <li key={i}>• {ch}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparative Radar */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ar" ? "مقارنة المؤشرات الإقليمية" : "Regional Indicators Comparison"}
            </CardTitle>
            <CardDescription>
              {language === "ar" 
                ? "مقارنة متعددة الأبعاد للمناطق الاقتصادية"
                : "Multi-dimensional comparison of economic zones"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={comparativeData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="region" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar 
                  name={language === "ar" ? "حصة الناتج المحلي" : "GDP Share"} 
                  dataKey="gdpShare" 
                  stroke="#107040" 
                  fill="#107040" 
                  fillOpacity={0.3} 
                />
                <Radar 
                  name={language === "ar" ? "الاستقرار" : "Stability"} 
                  dataKey="stability" 
                  stroke="#C0A030" 
                  fill="#C0A030" 
                  fillOpacity={0.3} 
                />
                <Radar 
                  name={language === "ar" ? "التوظيف" : "Employment"} 
                  dataKey="employment" 
                  stroke="#1e40af" 
                  fill="#1e40af" 
                  fillOpacity={0.3} 
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
