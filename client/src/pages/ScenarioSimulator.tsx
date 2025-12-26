import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  Play,
  RotateCcw,
  Download,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScenarioSimulator() {
  const { language } = useLanguage();
  
  // Simulation parameters
  const [inflationRate, setInflationRate] = useState([5]);
  const [exchangeRate, setExchangeRate] = useState([1500]);
  const [aidLevel, setAidLevel] = useState([2.8]);
  const [oilProduction, setOilProduction] = useState([50]);
  
  const [simulationRun, setSimulationRun] = useState(false);

  // Sample simulation results
  const simulationResults = [
    { month: language === "ar" ? "الشهر 1" : "Month 1", gdp: 100, poverty: 77, inflation: 5 },
    { month: language === "ar" ? "الشهر 2" : "Month 2", gdp: 102, poverty: 76.5, inflation: 5.2 },
    { month: language === "ar" ? "الشهر 3" : "Month 3", gdp: 104, poverty: 76, inflation: 5.5 },
    { month: language === "ar" ? "الشهر 4" : "Month 4", gdp: 106, poverty: 75.5, inflation: 5.8 },
    { month: language === "ar" ? "الشهر 5" : "Month 5", gdp: 108, poverty: 75, inflation: 6 },
    { month: language === "ar" ? "الشهر 6" : "Month 6", gdp: 110, poverty: 74.5, inflation: 6.2 },
  ];

  const scenarios = [
    {
      nameEn: "Optimistic Recovery",
      nameAr: "تعافي متفائل",
      descEn: "Increased aid, stable exchange rate, moderate oil production",
      descAr: "زيادة المساعدات، استقرار سعر الصرف، إنتاج نفطي معتدل"
    },
    {
      nameEn: "Continued Stagnation",
      nameAr: "ركود مستمر",
      descEn: "Current trends continue with minimal changes",
      descAr: "استمرار الاتجاهات الحالية مع تغييرات طفيفة"
    },
    {
      nameEn: "Economic Shock",
      nameAr: "صدمة اقتصادية",
      descEn: "Reduced aid, currency devaluation, decreased production",
      descAr: "انخفاض المساعدات، تخفيض قيمة العملة، انخفاض الإنتاج"
    },
  ];

  const handleRunSimulation = () => {
    setSimulationRun(true);
  };

  const handleReset = () => {
    setInflationRate([5]);
    setExchangeRate([1500]);
    setAidLevel([2.8]);
    setOilProduction([50]);
    setSimulationRun(false);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-900/20 via-primary/10 to-orange-900/20 border-b">
        <div className="container py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
              <Badge variant="outline" className="text-sm">
                {language === "ar" ? "محاكي السيناريوهات" : "Scenario Simulator"}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {language === "ar" 
                ? "محاكي السيناريوهات الاقتصادية"
                : "Economic Scenario Simulator"}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {language === "ar"
                ? "نمذج تأثيرات السياسات الاقتصادية والتنبؤ بالنتائج باستخدام نماذج اقتصادية متقدمة"
                : "Model policy impacts and forecast outcomes using advanced economic models"}
            </p>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "معاملات المحاكاة" : "Simulation Parameters"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "اضبط المتغيرات لنمذجة سيناريوهات مختلفة"
                    : "Adjust variables to model different scenarios"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inflation Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "معدل التضخم" : "Inflation Rate"}
                    </label>
                    <Badge variant="outline">{inflationRate[0]}%</Badge>
                  </div>
                  <Slider
                    value={inflationRate}
                    onValueChange={setInflationRate}
                    min={0}
                    max={50}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Exchange Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "سعر الصرف (YER/USD)" : "Exchange Rate (YER/USD)"}
                    </label>
                    <Badge variant="outline">{exchangeRate[0]}</Badge>
                  </div>
                  <Slider
                    value={exchangeRate}
                    onValueChange={setExchangeRate}
                    min={1000}
                    max={3000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1000</span>
                    <span>3000</span>
                  </div>
                </div>

                {/* Aid Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "المساعدات الدولية ($B)" : "International Aid ($B)"}
                    </label>
                    <Badge variant="outline">${aidLevel[0]}B</Badge>
                  </div>
                  <Slider
                    value={aidLevel}
                    onValueChange={setAidLevel}
                    min={0}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0B</span>
                    <span>$10B</span>
                  </div>
                </div>

                {/* Oil Production */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {language === "ar" ? "إنتاج النفط (% من الطاقة)" : "Oil Production (% of capacity)"}
                    </label>
                    <Badge variant="outline">{oilProduction[0]}%</Badge>
                  </div>
                  <Slider
                    value={oilProduction}
                    onValueChange={setOilProduction}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    className="w-full gap-2" 
                    onClick={handleRunSimulation}
                  >
                    <Play className="h-4 w-4" />
                    {language === "ar" ? "تشغيل المحاكاة" : "Run Simulation"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {language === "ar" ? "إعادة تعيين" : "Reset"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preset Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "ar" ? "سيناريوهات محددة مسبقاً" : "Preset Scenarios"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scenarios.map((scenario, index) => (
                    <button
                      key={index}
                      className="w-full p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="font-medium mb-1">
                        {language === "ar" ? scenario.nameAr : scenario.nameEn}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "ar" ? scenario.descAr : scenario.descEn}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {!simulationRun ? (
              <Card className="p-12">
                <div className="text-center">
                  <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {language === "ar" ? "جاهز للمحاكاة" : "Ready to Simulate"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {language === "ar"
                      ? "اضبط المعاملات على اليسار وانقر على \"تشغيل المحاكاة\" لرؤية النتائج"
                      : "Adjust parameters on the left and click \"Run Simulation\" to see results"}
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {/* Impact Summary */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center justify-between">
                        <span>{language === "ar" ? "تأثير الناتج المحلي" : "GDP Impact"}</span>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">+10%</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <TrendingUp className="h-3 w-3" />
                        {language === "ar" ? "خلال 6 أشهر" : "Over 6 months"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center justify-between">
                        <span>{language === "ar" ? "تأثير الفقر" : "Poverty Impact"}</span>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">-2.5%</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <TrendingDown className="h-3 w-3" />
                        {language === "ar" ? "انخفاض" : "Reduction"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center justify-between">
                        <span>{language === "ar" ? "تأثير التضخم" : "Inflation Impact"}</span>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">+1.2%</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <TrendingUp className="h-3 w-3" />
                        {language === "ar" ? "زيادة" : "Increase"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Simulation Charts */}
                <Tabs defaultValue="gdp">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="gdp">
                      {language === "ar" ? "الناتج المحلي" : "GDP"}
                    </TabsTrigger>
                    <TabsTrigger value="poverty">
                      {language === "ar" ? "الفقر" : "Poverty"}
                    </TabsTrigger>
                    <TabsTrigger value="inflation">
                      {language === "ar" ? "التضخم" : "Inflation"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="gdp">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === "ar" ? "توقعات الناتج المحلي الإجمالي" : "GDP Projection"}
                        </CardTitle>
                        <CardDescription>
                          {language === "ar"
                            ? "مؤشر الناتج المحلي الإجمالي (الأساس = 100)"
                            : "GDP Index (Base = 100)"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={simulationResults}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="gdp" 
                              stroke="#107040" 
                              strokeWidth={2}
                              name={language === "ar" ? "الناتج المحلي" : "GDP"}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="poverty">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === "ar" ? "توقعات معدل الفقر" : "Poverty Rate Projection"}
                        </CardTitle>
                        <CardDescription>
                          {language === "ar"
                            ? "معدل الفقر (%)"
                            : "Poverty Rate (%)"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={simulationResults}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[70, 80]} />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="poverty" 
                              stroke="#E57373" 
                              strokeWidth={2}
                              name={language === "ar" ? "معدل الفقر" : "Poverty Rate"}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="inflation">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {language === "ar" ? "توقعات التضخم" : "Inflation Projection"}
                        </CardTitle>
                        <CardDescription>
                          {language === "ar"
                            ? "معدل التضخم (%)"
                            : "Inflation Rate (%)"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={simulationResults}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="inflation" 
                              stroke="#C0A030" 
                              strokeWidth={2}
                              name={language === "ar" ? "التضخم" : "Inflation"}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Policy Recommendations */}
                <Card className="border-blue-200 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      {language === "ar" ? "التوصيات السياسية" : "Policy Recommendations"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>
                          {language === "ar"
                            ? "الحفاظ على مستويات المساعدات الحالية لدعم النمو الاقتصادي"
                            : "Maintain current aid levels to support economic growth"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>
                          {language === "ar"
                            ? "تنفيذ سياسات لاستقرار سعر الصرف"
                            : "Implement policies to stabilize exchange rate"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold">!</span>
                        <span>
                          {language === "ar"
                            ? "مراقبة الضغوط التضخمية الناتجة عن زيادة السيولة"
                            : "Monitor inflationary pressures from increased liquidity"}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>
                          {language === "ar"
                            ? "استثمار في البنية التحتية لتعزيز الإنتاج النفطي"
                            : "Invest in infrastructure to boost oil production"}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Export Results */}
                <div className="flex justify-end">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    {language === "ar" ? "تصدير النتائج" : "Export Results"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
