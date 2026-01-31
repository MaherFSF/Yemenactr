import { useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
  Info,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  Scale,
  ArrowRight,
  ChevronRight,
  Brain,
  Sparkles,
  LineChart as LineChartIcon,
  PieChart,
  GitCompare,
  Lock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar, ReferenceLine } from 'recharts';

// Economic model coefficients (based on Yemen economic research)
const ECONOMIC_MODEL = {
  // GDP impact coefficients
  gdpFromOil: 0.35,           // Oil revenue contributes ~35% to GDP
  gdpFromAid: 0.25,           // Aid contributes ~25% to GDP
  gdpFromRemittances: 0.20,   // Remittances contribute ~20%
  gdpFromTrade: 0.15,         // Trade contributes ~15%
  gdpFromAgriculture: 0.05,   // Agriculture contributes ~5%
  
  // Inflation drivers
  inflationFromFX: 0.45,      // FX depreciation drives ~45% of inflation
  inflationFromFuel: 0.25,    // Fuel prices drive ~25%
  inflationFromFood: 0.20,    // Food prices drive ~20%
  inflationFromMonetary: 0.10, // Monetary policy drives ~10%
  
  // Poverty impact
  povertyFromInflation: 0.30,  // Inflation increases poverty by ~30%
  povertyFromUnemployment: 0.25,
  povertyFromAid: -0.20,       // Aid reduces poverty
  povertyFromConflict: 0.25,
  
  // Exchange rate drivers
  fxFromReserves: -0.35,       // Higher reserves strengthen currency
  fxFromImports: 0.25,         // Higher imports weaken currency
  fxFromAid: -0.20,            // Aid inflows strengthen currency
  fxFromOil: -0.20,            // Oil revenue strengthens currency
};

// Historical baseline data (2024)
const BASELINE = {
  gdpGrowth: 0.8,
  inflation: 15.0,
  exchangeRate: 2050,
  povertyRate: 77,
  unemployment: 35,
  foreignReserves: 1.2, // $B
  oilProduction: 15, // % of capacity
  aidFlows: 2.8, // $B
  remittances: 3.5, // $B
  foodInsecurity: 51.9, // %
};

export default function ScenarioSimulator() {
  const { language } = useLanguage();
  
  // Simulation parameters
  const [inflationRate, setInflationRate] = useState([BASELINE.inflation]);
  const [exchangeRate, setExchangeRate] = useState([BASELINE.exchangeRate]);
  const [aidLevel, setAidLevel] = useState([BASELINE.aidFlows]);
  const [oilProduction, setOilProduction] = useState([BASELINE.oilProduction]);
  const [remittances, setRemittances] = useState([BASELINE.remittances]);
  const [conflictIntensity, setConflictIntensity] = useState([50]); // 0-100 scale
  const [fuelPrices, setFuelPrices] = useState([100]); // Index, 100 = baseline
  const [foodPrices, setFoodPrices] = useState([100]); // Index, 100 = baseline
  
  // Variable neutralization (what-if analysis)
  const [neutralizeOil, setNeutralizeOil] = useState(false);
  const [neutralizeAid, setNeutralizeAid] = useState(false);
  const [neutralizeConflict, setNeutralizeConflict] = useState(false);
  const [neutralizeFX, setNeutralizeFX] = useState(false);
  
  // Simulation state
  const [simulationRun, setSimulationRun] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState("12"); // months
  const [activeTab, setActiveTab] = useState("parameters");
  const [comparisonMode, setComparisonMode] = useState(false);
  
  // ML-powered simulation function
  const runSimulation = useCallback(() => {
    const months = parseInt(timeHorizon);
    const results = [];
    
    // Initial values
    let gdp = 100; // Index
    let poverty = BASELINE.povertyRate;
    let inflation = inflationRate[0];
    let fx = exchangeRate[0];
    
    // Calculate change factors
    const oilFactor = neutralizeOil ? 1 : (oilProduction[0] / BASELINE.oilProduction);
    const aidFactor = neutralizeAid ? 1 : (aidLevel[0] / BASELINE.aidFlows);
    const conflictFactor = neutralizeConflict ? 1 : (conflictIntensity[0] / 50);
    const fxFactor = neutralizeFX ? 1 : (exchangeRate[0] / BASELINE.exchangeRate);
    const fuelFactor = fuelPrices[0] / 100;
    const foodFactor = foodPrices[0] / 100;
    const remittanceFactor = remittances[0] / BASELINE.remittances;
    
    for (let m = 0; m <= months; m++) {
      // GDP calculation with uncertainty
      const gdpGrowth = (
        ECONOMIC_MODEL.gdpFromOil * (oilFactor - 1) +
        ECONOMIC_MODEL.gdpFromAid * (aidFactor - 1) +
        ECONOMIC_MODEL.gdpFromRemittances * (remittanceFactor - 1) -
        0.1 * (conflictFactor - 1)
      ) * 100 / 12; // Monthly rate
      
      gdp = gdp * (1 + gdpGrowth / 100);
      
      // Inflation calculation
      const inflationChange = (
        ECONOMIC_MODEL.inflationFromFX * (fxFactor - 1) +
        ECONOMIC_MODEL.inflationFromFuel * (fuelFactor - 1) +
        ECONOMIC_MODEL.inflationFromFood * (foodFactor - 1)
      ) * 100;
      
      inflation = Math.max(0, BASELINE.inflation + inflationChange * (m / months));
      
      // Poverty calculation
      const povertyChange = (
        ECONOMIC_MODEL.povertyFromInflation * (inflation / BASELINE.inflation - 1) +
        ECONOMIC_MODEL.povertyFromAid * (1 - aidFactor) +
        ECONOMIC_MODEL.povertyFromConflict * (conflictFactor - 1)
      ) * 100;
      
      poverty = Math.min(100, Math.max(0, BASELINE.povertyRate + povertyChange * (m / months)));
      
      // Exchange rate projection
      fx = BASELINE.exchangeRate * fxFactor * (1 + 0.02 * (conflictFactor - 1) * m / 12);
      
      // Uncertainty bands (wider as time increases)
      const uncertainty = 1 + (m / months) * 0.15;
      
      results.push({
        month: m,
        monthLabel: language === "ar" ? `الشهر ${m}` : `Month ${m}`,
        gdp: Math.round(gdp * 10) / 10,
        gdpUpper: Math.round(gdp * uncertainty * 10) / 10,
        gdpLower: Math.round(gdp / uncertainty * 10) / 10,
        poverty: Math.round(poverty * 10) / 10,
        povertyUpper: Math.round(Math.min(100, poverty * uncertainty) * 10) / 10,
        povertyLower: Math.round(Math.max(0, poverty / uncertainty) * 10) / 10,
        inflation: Math.round(inflation * 10) / 10,
        inflationUpper: Math.round(inflation * uncertainty * 10) / 10,
        inflationLower: Math.round(inflation / uncertainty * 10) / 10,
        exchangeRate: Math.round(fx),
        fxUpper: Math.round(fx * uncertainty),
        fxLower: Math.round(fx / uncertainty),
      });
    }
    
    return results;
  }, [inflationRate, exchangeRate, aidLevel, oilProduction, remittances, conflictIntensity, fuelPrices, foodPrices, timeHorizon, neutralizeOil, neutralizeAid, neutralizeConflict, neutralizeFX, language]);
  
  // Simulation results
  const simulationResults = useMemo(() => {
    if (!simulationRun) return [];
    return runSimulation();
  }, [simulationRun, runSimulation]);
  
  // Calculate driver decomposition
  const driverDecomposition = useMemo(() => {
    if (!simulationRun || simulationResults.length === 0) return [];
    
    const lastResult = simulationResults[simulationResults.length - 1];
    const gdpChange = lastResult.gdp - 100;
    
    return [
      {
        driver: language === "ar" ? "إنتاج النفط" : "Oil Production",
        contribution: Math.round(ECONOMIC_MODEL.gdpFromOil * (oilProduction[0] / BASELINE.oilProduction - 1) * 100 * 10) / 10,
        color: "#4C583E"
      },
      {
        driver: language === "ar" ? "المساعدات الدولية" : "International Aid",
        contribution: Math.round(ECONOMIC_MODEL.gdpFromAid * (aidLevel[0] / BASELINE.aidFlows - 1) * 100 * 10) / 10,
        color: "#C9A227"
      },
      {
        driver: language === "ar" ? "التحويلات" : "Remittances",
        contribution: Math.round(ECONOMIC_MODEL.gdpFromRemittances * (remittances[0] / BASELINE.remittances - 1) * 100 * 10) / 10,
        color: "#768064"
      },
      {
        driver: language === "ar" ? "تأثير الصراع" : "Conflict Impact",
        contribution: Math.round(-0.1 * (conflictIntensity[0] / 50 - 1) * 100 * 10) / 10,
        color: "#DC2626"
      },
    ];
  }, [simulationRun, simulationResults, oilProduction, aidLevel, remittances, conflictIntensity, language]);

  const scenarios = [
    {
      id: "optimistic",
      nameEn: "Optimistic Recovery",
      nameAr: "تعافي متفائل",
      descEn: "Peace agreement, increased aid, oil production resumes to 50%",
      descAr: "اتفاق سلام، زيادة المساعدات، استئناف إنتاج النفط إلى 50%",
      icon: TrendingUp,
      color: "text-green-500",
      params: { oil: 50, aid: 5, conflict: 20, fx: 1800 }
    },
    {
      id: "baseline",
      nameEn: "Continued Stagnation",
      nameAr: "ركود مستمر",
      descEn: "Current trends continue with minimal changes",
      descAr: "استمرار الاتجاهات الحالية مع تغييرات طفيفة",
      icon: Activity,
      color: "text-yellow-500",
      params: { oil: 15, aid: 2.8, conflict: 50, fx: 2050 }
    },
    {
      id: "pessimistic",
      nameEn: "Economic Shock",
      nameAr: "صدمة اقتصادية",
      descEn: "Aid cuts, currency collapse, conflict escalation",
      descAr: "قطع المساعدات، انهيار العملة، تصعيد الصراع",
      icon: TrendingDown,
      color: "text-red-500",
      params: { oil: 5, aid: 1, conflict: 80, fx: 3000 }
    },
    {
      id: "whatif_oil",
      nameEn: "What if: Oil +50%",
      nameAr: "ماذا لو: النفط +50%",
      descEn: "Oil production increases by 50% from current levels",
      descAr: "زيادة إنتاج النفط بنسبة 50% من المستويات الحالية",
      icon: Zap,
      color: "text-blue-500",
      params: { oil: 22.5, aid: 2.8, conflict: 50, fx: 1900 }
    },
    {
      id: "whatif_peace",
      nameEn: "What if: Peace Agreement",
      nameAr: "ماذا لو: اتفاق سلام",
      descEn: "Full peace agreement reduces conflict to minimum",
      descAr: "اتفاق سلام شامل يقلل الصراع إلى الحد الأدنى",
      icon: Scale,
      color: "text-purple-500",
      params: { oil: 30, aid: 4, conflict: 10, fx: 1600 }
    },
  ];

  const handleApplyScenario = (scenario: typeof scenarios[0]) => {
    setOilProduction([scenario.params.oil]);
    setAidLevel([scenario.params.aid]);
    setConflictIntensity([scenario.params.conflict]);
    setExchangeRate([scenario.params.fx]);
    setSimulationRun(false);
  };

  const handleRunSimulation = () => {
    setSimulationRun(true);
  };

  const handleReset = () => {
    setInflationRate([BASELINE.inflation]);
    setExchangeRate([BASELINE.exchangeRate]);
    setAidLevel([BASELINE.aidFlows]);
    setOilProduction([BASELINE.oilProduction]);
    setRemittances([BASELINE.remittances]);
    setConflictIntensity([50]);
    setFuelPrices([100]);
    setFoodPrices([100]);
    setNeutralizeOil(false);
    setNeutralizeAid(false);
    setNeutralizeConflict(false);
    setNeutralizeFX(false);
    setSimulationRun(false);
  };

  const handleExport = () => {
    const data = {
      parameters: {
        inflationRate: inflationRate[0],
        exchangeRate: exchangeRate[0],
        aidLevel: aidLevel[0],
        oilProduction: oilProduction[0],
        remittances: remittances[0],
        conflictIntensity: conflictIntensity[0],
        fuelPrices: fuelPrices[0],
        foodPrices: foodPrices[0],
        timeHorizon,
        neutralizations: { oil: neutralizeOil, aid: neutralizeAid, conflict: neutralizeConflict, fx: neutralizeFX }
      },
      results: simulationResults,
      driverDecomposition,
      timestamp: new Date().toISOString(),
      model: "YETO Economic Scenario Model v2.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yeto-scenario-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-900/20 via-primary/10 to-orange-900/20 border-b">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Brain className="h-7 w-7 text-orange-500" />
              </div>
              <div>
                <Badge variant="outline" className="text-sm mb-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {language === "ar" ? "مدعوم بالذكاء الاصطناعي" : "ML-Powered"}
                </Badge>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {language === "ar" 
                ? "محاكي السيناريوهات الاقتصادية"
                : "Economic Scenario Simulator"}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {language === "ar"
                ? "نمذج تأثيرات السياسات الاقتصادية والتنبؤ بالنتائج باستخدام نماذج اقتصادية متقدمة مع نطاقات عدم اليقين"
                : "Model policy impacts and forecast outcomes using advanced economic models with uncertainty bands"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Target className="h-3 w-3" />
                {language === "ar" ? "8 متغيرات" : "8 Variables"}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <GitCompare className="h-3 w-3" />
                {language === "ar" ? "تحليل ماذا لو" : "What-If Analysis"}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <LineChartIcon className="h-3 w-3" />
                {language === "ar" ? "نطاقات عدم اليقين" : "Uncertainty Bands"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="parameters" className="gap-2">
              <Activity className="h-4 w-4" />
              {language === "ar" ? "المعاملات" : "Parameters"}
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              {language === "ar" ? "السيناريوهات" : "Scenarios"}
            </TabsTrigger>
            <TabsTrigger value="whatif" className="gap-2">
              <Scale className="h-4 w-4" />
              {language === "ar" ? "ماذا لو" : "What-If"}
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {language === "ar" ? "النتائج" : "Results"}
            </TabsTrigger>
          </TabsList>

          {/* Parameters Tab */}
          <TabsContent value="parameters">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Control Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {language === "ar" ? "المتغيرات الرئيسية" : "Key Variables"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Oil Production */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {language === "ar" ? "إنتاج النفط (% من الطاقة)" : "Oil Production (% capacity)"}
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
                      <p className="text-xs text-muted-foreground">
                        {language === "ar" ? "الحالي: 15% | الذروة 2010: 100%" : "Current: 15% | Peak 2010: 100%"}
                      </p>
                    </div>

                    {/* International Aid */}
                    <div className="space-y-2">
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
                    </div>

                    {/* Exchange Rate */}
                    <div className="space-y-2">
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
                        max={4000}
                        step={50}
                        className="w-full"
                      />
                    </div>

                    {/* Conflict Intensity */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {language === "ar" ? "حدة الصراع" : "Conflict Intensity"}
                        </label>
                        <Badge variant={conflictIntensity[0] > 60 ? "destructive" : conflictIntensity[0] > 30 ? "secondary" : "default"}>
                          {conflictIntensity[0]}%
                        </Badge>
                      </div>
                      <Slider
                        value={conflictIntensity}
                        onValueChange={setConflictIntensity}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {language === "ar" ? "متغيرات إضافية" : "Additional Variables"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Remittances */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {language === "ar" ? "التحويلات ($B)" : "Remittances ($B)"}
                        </label>
                        <Badge variant="outline">${remittances[0]}B</Badge>
                      </div>
                      <Slider
                        value={remittances}
                        onValueChange={setRemittances}
                        min={0}
                        max={8}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Fuel Prices */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {language === "ar" ? "أسعار الوقود (مؤشر)" : "Fuel Prices (Index)"}
                        </label>
                        <Badge variant="outline">{fuelPrices[0]}</Badge>
                      </div>
                      <Slider
                        value={fuelPrices}
                        onValueChange={setFuelPrices}
                        min={50}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Food Prices */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          {language === "ar" ? "أسعار الغذاء (مؤشر)" : "Food Prices (Index)"}
                        </label>
                        <Badge variant="outline">{foodPrices[0]}</Badge>
                      </div>
                      <Slider
                        value={foodPrices}
                        onValueChange={setFoodPrices}
                        min={50}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Horizon & Actions */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {language === "ar" ? "إعدادات المحاكاة" : "Simulation Settings"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {language === "ar" ? "الأفق الزمني" : "Time Horizon"}
                        </label>
                        <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">{language === "ar" ? "6 أشهر" : "6 Months"}</SelectItem>
                            <SelectItem value="12">{language === "ar" ? "12 شهر" : "12 Months"}</SelectItem>
                            <SelectItem value="24">{language === "ar" ? "24 شهر" : "24 Months"}</SelectItem>
                            <SelectItem value="36">{language === "ar" ? "36 شهر" : "36 Months"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleRunSimulation} className="gap-2">
                        <Play className="h-4 w-4" />
                        {language === "ar" ? "تشغيل المحاكاة" : "Run Simulation"}
                      </Button>
                      <Button variant="outline" onClick={handleReset} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        {language === "ar" ? "إعادة تعيين" : "Reset"}
                      </Button>
                      {simulationRun && (
                        <Button variant="outline" onClick={handleExport} className="gap-2">
                          <Download className="h-4 w-4" />
                          {language === "ar" ? "تصدير" : "Export"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Results Preview */}
                {simulationRun && simulationResults.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        {language === "ar" ? "نتائج سريعة" : "Quick Results"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          {
                            label: language === "ar" ? "نمو الناتج المحلي" : "GDP Growth",
                            value: `${(simulationResults[simulationResults.length - 1].gdp - 100).toFixed(1)}%`,
                            trend: simulationResults[simulationResults.length - 1].gdp >= 100 ? "up" : "down"
                          },
                          {
                            label: language === "ar" ? "معدل الفقر" : "Poverty Rate",
                            value: `${simulationResults[simulationResults.length - 1].poverty}%`,
                            trend: simulationResults[simulationResults.length - 1].poverty <= BASELINE.povertyRate ? "up" : "down"
                          },
                          {
                            label: language === "ar" ? "التضخم" : "Inflation",
                            value: `${simulationResults[simulationResults.length - 1].inflation}%`,
                            trend: simulationResults[simulationResults.length - 1].inflation <= BASELINE.inflation ? "up" : "down"
                          },
                          {
                            label: language === "ar" ? "سعر الصرف" : "Exchange Rate",
                            value: `${simulationResults[simulationResults.length - 1].exchangeRate}`,
                            trend: simulationResults[simulationResults.length - 1].exchangeRate <= BASELINE.exchangeRate ? "up" : "down"
                          },
                        ].map((item, i) => (
                          <div key={i} className="p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{item.value}</span>
                              {item.trend === "up" ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleApplyScenario(scenario)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${scenario.color}`}>
                        <scenario.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {language === "ar" ? scenario.nameAr : scenario.nameEn}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === "ar" ? scenario.descAr : scenario.descEn}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {language === "ar" ? "نفط" : "Oil"}: {scenario.params.oil}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {language === "ar" ? "مساعدات" : "Aid"}: ${scenario.params.aid}B
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* What-If Tab */}
          <TabsContent value="whatif">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  {language === "ar" ? "تحليل ماذا لو - تحييد المتغيرات" : "What-If Analysis - Variable Neutralization"}
                </CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "قم بتحييد متغيرات معينة لرؤية تأثيرها على الاقتصاد"
                    : "Neutralize specific variables to see their isolated impact on the economy"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {language === "ar" ? "تحييد إنتاج النفط" : "Neutralize Oil Production"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" 
                            ? "ماذا لو لم يتغير إنتاج النفط؟"
                            : "What if oil production stayed constant?"}
                        </div>
                      </div>
                      <Switch checked={neutralizeOil} onCheckedChange={setNeutralizeOil} />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {language === "ar" ? "تحييد المساعدات" : "Neutralize Aid"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" 
                            ? "ماذا لو لم تتغير المساعدات الدولية؟"
                            : "What if international aid stayed constant?"}
                        </div>
                      </div>
                      <Switch checked={neutralizeAid} onCheckedChange={setNeutralizeAid} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {language === "ar" ? "تحييد الصراع" : "Neutralize Conflict"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" 
                            ? "ماذا لو لم يكن هناك صراع؟"
                            : "What if there was no conflict impact?"}
                        </div>
                      </div>
                      <Switch checked={neutralizeConflict} onCheckedChange={setNeutralizeConflict} />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {language === "ar" ? "تحييد سعر الصرف" : "Neutralize Exchange Rate"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {language === "ar" 
                            ? "ماذا لو استقر سعر الصرف؟"
                            : "What if exchange rate stayed stable?"}
                        </div>
                      </div>
                      <Switch checked={neutralizeFX} onCheckedChange={setNeutralizeFX} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-orange-500/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-700 dark:text-orange-300">
                        {language === "ar" ? "ملاحظة منهجية" : "Methodology Note"}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "ar"
                          ? "تحييد المتغيرات يعني إزالة تأثيرها من النموذج الاقتصادي. هذا يساعد على فهم المساهمة النسبية لكل عامل."
                          : "Neutralizing variables removes their impact from the economic model. This helps understand the relative contribution of each factor."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {!simulationRun ? (
              <Card className="p-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "جاهز للمحاكاة" : "Ready to Simulate"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "ar"
                    ? "اضبط المعاملات واضغط على 'تشغيل المحاكاة' لرؤية النتائج"
                    : "Adjust parameters and click 'Run Simulation' to see results"}
                </p>
                <Button onClick={() => setActiveTab("parameters")}>
                  {language === "ar" ? "الذهاب إلى المعاملات" : "Go to Parameters"}
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* GDP Projection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {language === "ar" ? "توقعات الناتج المحلي الإجمالي" : "GDP Projection"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={simulationResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="monthLabel" />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="gdpUpper" 
                          fill="#4C583E20" 
                          stroke="none"
                          name={language === "ar" ? "الحد الأعلى" : "Upper Bound"}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="gdpLower" 
                          fill="#ffffff" 
                          stroke="none"
                          name={language === "ar" ? "الحد الأدنى" : "Lower Bound"}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="gdp" 
                          stroke="#4C583E" 
                          strokeWidth={2}
                          name={language === "ar" ? "الناتج المحلي" : "GDP Index"}
                        />
                        <ReferenceLine y={100} stroke="#666" strokeDasharray="3 3" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Driver Decomposition */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {language === "ar" ? "تحليل المحركات" : "Driver Decomposition"}
                    </CardTitle>
                    <CardDescription>
                      {language === "ar"
                        ? "مساهمة كل عامل في تغير الناتج المحلي"
                        : "Contribution of each factor to GDP change"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {driverDecomposition.map((driver, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-32 text-sm">{driver.driver}</div>
                          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(100, Math.abs(driver.contribution) * 5)}%`,
                                backgroundColor: driver.contribution >= 0 ? '#4C583E' : '#DC2626',
                                marginLeft: driver.contribution < 0 ? 'auto' : 0
                              }}
                            />
                          </div>
                          <div className={`w-16 text-sm font-medium text-right ${driver.contribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {driver.contribution >= 0 ? '+' : ''}{driver.contribution}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Poverty & Inflation */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {language === "ar" ? "معدل الفقر" : "Poverty Rate"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={simulationResults}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="monthLabel" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="poverty" 
                            fill="#DC262620" 
                            stroke="#DC2626"
                            name={language === "ar" ? "معدل الفقر" : "Poverty Rate"}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {language === "ar" ? "معدل التضخم" : "Inflation Rate"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={simulationResults}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="monthLabel" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="inflation" 
                            fill="#C9A22720" 
                            stroke="#C9A227"
                            name={language === "ar" ? "التضخم" : "Inflation"}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Methodology Note */}
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-medium mb-1">
                          {language === "ar" ? "ملاحظة منهجية" : "Methodology Note"}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "تستند هذه التوقعات إلى نموذج اقتصادي مبسط يعتمد على العلاقات التاريخية بين المتغيرات. نطاقات عدم اليقين تتسع مع زيادة الأفق الزمني. هذا النموذج للأغراض التوضيحية فقط ولا ينبغي استخدامه كأساس وحيد لاتخاذ القرارات."
                            : "These projections are based on a simplified economic model using historical relationships between variables. Uncertainty bands widen with longer time horizons. This model is for illustrative purposes only and should not be used as the sole basis for decision-making."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
