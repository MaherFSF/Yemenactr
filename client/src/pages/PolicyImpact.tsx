import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Calculator,
  FileText,
  Download,
  Play,
  RefreshCw,
  Info,
  ChevronRight,
  Zap,
  Building2,
  Banknote,
  ShoppingCart,
  Users,
  Fuel,
  Wheat,
  Globe,
  Scale,
} from "lucide-react";
import { Link } from "wouter";

// Policy scenarios
const policyScenarios = [
  {
    id: "monetary_unification",
    name: "Monetary Unification",
    nameAr: "توحيد السياسة النقدية",
    description: "Analyze the impact of unifying monetary policy between Aden and Sana'a",
    descriptionAr: "تحليل تأثير توحيد السياسة النقدية بين عدن وصنعاء",
    category: "monetary",
    icon: Banknote,
    parameters: [
      { id: "unification_rate", name: "Unification Exchange Rate", nameAr: "سعر الصرف الموحد", min: 500, max: 2500, default: 1200, unit: "YER/USD" },
      { id: "transition_period", name: "Transition Period", nameAr: "فترة الانتقال", min: 6, max: 36, default: 18, unit: "months" },
      { id: "reserve_injection", name: "Reserve Injection", nameAr: "ضخ الاحتياطيات", min: 0, max: 5000, default: 1000, unit: "USD millions" },
    ],
    impacts: ["exchange_rate", "inflation", "trade_balance", "banking_sector"],
  },
  {
    id: "fuel_subsidy_reform",
    name: "Fuel Subsidy Reform",
    nameAr: "إصلاح دعم الوقود",
    description: "Model the effects of fuel subsidy changes on economy and households",
    descriptionAr: "نمذجة آثار تغييرات دعم الوقود على الاقتصاد والأسر",
    category: "fiscal",
    icon: Fuel,
    parameters: [
      { id: "subsidy_reduction", name: "Subsidy Reduction", nameAr: "تخفيض الدعم", min: 0, max: 100, default: 30, unit: "%" },
      { id: "cash_transfer", name: "Cash Transfer Amount", nameAr: "مبلغ التحويل النقدي", min: 0, max: 50000, default: 20000, unit: "YER/month" },
      { id: "targeting_efficiency", name: "Targeting Efficiency", nameAr: "كفاءة الاستهداف", min: 50, max: 100, default: 75, unit: "%" },
    ],
    impacts: ["inflation", "poverty_rate", "fiscal_balance", "transport_costs"],
  },
  {
    id: "trade_facilitation",
    name: "Trade Facilitation",
    nameAr: "تسهيل التجارة",
    description: "Assess impact of reducing trade barriers and port fees",
    descriptionAr: "تقييم تأثير تخفيض الحواجز التجارية ورسوم الموانئ",
    category: "trade",
    icon: ShoppingCart,
    parameters: [
      { id: "tariff_reduction", name: "Tariff Reduction", nameAr: "تخفيض التعريفات", min: 0, max: 50, default: 20, unit: "%" },
      { id: "port_efficiency", name: "Port Efficiency Gain", nameAr: "تحسين كفاءة الموانئ", min: 0, max: 50, default: 25, unit: "%" },
      { id: "customs_reform", name: "Customs Processing Time", nameAr: "وقت التخليص الجمركي", min: 1, max: 30, default: 7, unit: "days" },
    ],
    impacts: ["import_prices", "food_prices", "trade_volume", "government_revenue"],
  },
  {
    id: "aid_scaling",
    name: "Aid Scaling Scenarios",
    nameAr: "سيناريوهات تغيير المساعدات",
    description: "Model economic effects of aid increases or decreases",
    descriptionAr: "نمذجة الآثار الاقتصادية لزيادة أو تخفيض المساعدات",
    category: "humanitarian",
    icon: Globe,
    parameters: [
      { id: "aid_change", name: "Aid Change", nameAr: "تغيير المساعدات", min: -50, max: 50, default: 0, unit: "%" },
      { id: "aid_modality", name: "Cash vs In-Kind Ratio", nameAr: "نسبة النقد للعيني", min: 0, max: 100, default: 40, unit: "% cash" },
      { id: "local_procurement", name: "Local Procurement", nameAr: "الشراء المحلي", min: 0, max: 100, default: 30, unit: "%" },
    ],
    impacts: ["gdp_growth", "employment", "food_security", "local_markets"],
  },
  {
    id: "banking_reform",
    name: "Banking Sector Reform",
    nameAr: "إصلاح القطاع المصرفي",
    description: "Analyze banking sector consolidation and recapitalization",
    descriptionAr: "تحليل توحيد القطاع المصرفي وإعادة رسملته",
    category: "financial",
    icon: Building2,
    parameters: [
      { id: "recapitalization", name: "Recapitalization Amount", nameAr: "مبلغ إعادة الرسملة", min: 0, max: 2000, default: 500, unit: "USD millions" },
      { id: "npl_resolution", name: "NPL Resolution Rate", nameAr: "معدل حل القروض المتعثرة", min: 0, max: 100, default: 50, unit: "%" },
      { id: "deposit_guarantee", name: "Deposit Guarantee Limit", nameAr: "حد ضمان الودائع", min: 0, max: 100, default: 20, unit: "USD thousands" },
    ],
    impacts: ["credit_growth", "deposit_confidence", "private_investment", "financial_inclusion"],
  },
  {
    id: "labor_market",
    name: "Labor Market Interventions",
    nameAr: "تدخلات سوق العمل",
    description: "Model employment programs and wage policy effects",
    descriptionAr: "نمذجة برامج التوظيف وآثار سياسات الأجور",
    category: "social",
    icon: Users,
    parameters: [
      { id: "public_works", name: "Public Works Scale", nameAr: "حجم الأشغال العامة", min: 0, max: 500000, default: 100000, unit: "jobs" },
      { id: "minimum_wage", name: "Minimum Wage Increase", nameAr: "زيادة الحد الأدنى للأجور", min: 0, max: 100, default: 20, unit: "%" },
      { id: "skills_training", name: "Skills Training Budget", nameAr: "ميزانية التدريب", min: 0, max: 100, default: 25, unit: "USD millions" },
    ],
    impacts: ["unemployment", "poverty_rate", "productivity", "remittances"],
  },
];

// Impact indicators
const impactIndicators = {
  exchange_rate: { name: "Exchange Rate", nameAr: "سعر الصرف", unit: "YER/USD", baseline: 1620 },
  inflation: { name: "Inflation Rate", nameAr: "معدل التضخم", unit: "%", baseline: 15 },
  gdp_growth: { name: "GDP Growth", nameAr: "نمو الناتج المحلي", unit: "%", baseline: 2.5 },
  poverty_rate: { name: "Poverty Rate", nameAr: "معدل الفقر", unit: "%", baseline: 54 },
  unemployment: { name: "Unemployment", nameAr: "البطالة", unit: "%", baseline: 14 },
  trade_balance: { name: "Trade Balance", nameAr: "الميزان التجاري", unit: "USD millions", baseline: -3500 },
  fiscal_balance: { name: "Fiscal Balance", nameAr: "الرصيد المالي", unit: "% of GDP", baseline: -5.2 },
  food_security: { name: "Food Insecurity", nameAr: "انعدام الأمن الغذائي", unit: "millions", baseline: 17.4 },
  banking_sector: { name: "Banking Sector Health", nameAr: "صحة القطاع المصرفي", unit: "index", baseline: 45 },
  import_prices: { name: "Import Prices", nameAr: "أسعار الواردات", unit: "index", baseline: 100 },
  food_prices: { name: "Food Prices", nameAr: "أسعار الغذاء", unit: "index", baseline: 100 },
  trade_volume: { name: "Trade Volume", nameAr: "حجم التجارة", unit: "USD millions", baseline: 8500 },
  government_revenue: { name: "Government Revenue", nameAr: "إيرادات الحكومة", unit: "YER billions", baseline: 1200 },
  transport_costs: { name: "Transport Costs", nameAr: "تكاليف النقل", unit: "index", baseline: 100 },
  credit_growth: { name: "Credit Growth", nameAr: "نمو الائتمان", unit: "%", baseline: 3 },
  deposit_confidence: { name: "Deposit Confidence", nameAr: "ثقة المودعين", unit: "index", baseline: 40 },
  private_investment: { name: "Private Investment", nameAr: "الاستثمار الخاص", unit: "USD millions", baseline: 200 },
  financial_inclusion: { name: "Financial Inclusion", nameAr: "الشمول المالي", unit: "%", baseline: 12 },
  employment: { name: "Employment", nameAr: "التوظيف", unit: "thousands", baseline: 5800 },
  local_markets: { name: "Local Market Activity", nameAr: "نشاط الأسواق المحلية", unit: "index", baseline: 65 },
  productivity: { name: "Labor Productivity", nameAr: "إنتاجية العمل", unit: "index", baseline: 100 },
  remittances: { name: "Remittances", nameAr: "التحويلات", unit: "USD millions", baseline: 3200 },
};

// Simple impact calculation (placeholder for real economic model)
function calculateImpact(scenario: typeof policyScenarios[0], parameters: Record<string, number>) {
  const impacts: Record<string, { value: number; change: number; direction: "up" | "down" | "stable" }> = {};
  
  // Simplified impact calculations based on scenario type
  scenario.impacts.forEach(indicatorId => {
    const indicator = impactIndicators[indicatorId as keyof typeof impactIndicators];
    if (!indicator) return;
    
    let change = 0;
    let newValue = indicator.baseline;
    
    // Scenario-specific calculations (simplified)
    switch (scenario.id) {
      case "monetary_unification":
        if (indicatorId === "exchange_rate") {
          newValue = parameters.unification_rate || 1200;
          change = ((newValue - indicator.baseline) / indicator.baseline) * 100;
        } else if (indicatorId === "inflation") {
          change = (parameters.unification_rate - 1200) / 100;
          newValue = indicator.baseline + change;
        }
        break;
      case "fuel_subsidy_reform":
        if (indicatorId === "inflation") {
          change = (parameters.subsidy_reduction || 30) * 0.15;
          newValue = indicator.baseline + change;
        } else if (indicatorId === "poverty_rate") {
          const cashEffect = (parameters.cash_transfer || 20000) / 50000 * -5;
          const subsidyEffect = (parameters.subsidy_reduction || 30) * 0.1;
          change = subsidyEffect + cashEffect;
          newValue = indicator.baseline + change;
        }
        break;
      case "trade_facilitation":
        if (indicatorId === "import_prices" || indicatorId === "food_prices") {
          change = -(parameters.tariff_reduction || 20) * 0.5;
          newValue = indicator.baseline + change;
        } else if (indicatorId === "trade_volume") {
          change = (parameters.port_efficiency || 25) * 50;
          newValue = indicator.baseline + change;
        }
        break;
      case "aid_scaling":
        if (indicatorId === "gdp_growth") {
          change = (parameters.aid_change || 0) * 0.03;
          newValue = indicator.baseline + change;
        } else if (indicatorId === "food_security") {
          change = -(parameters.aid_change || 0) * 0.05;
          newValue = indicator.baseline + change;
        }
        break;
      default:
        // Default small random variation
        change = (Math.random() - 0.5) * 10;
        newValue = indicator.baseline * (1 + change / 100);
    }
    
    impacts[indicatorId] = {
      value: Math.round(newValue * 100) / 100,
      change: Math.round(change * 100) / 100,
      direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "stable",
    };
  });
  
  return impacts;
}

export default function PolicyImpact() {
  const { language } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState<typeof policyScenarios[0] | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [compareBaseline, setCompareBaseline] = useState(true);

  // Initialize parameters when scenario changes
  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = policyScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      const defaultParams: Record<string, number> = {};
      scenario.parameters.forEach(p => {
        defaultParams[p.id] = p.default;
      });
      setParameters(defaultParams);
      setShowResults(false);
    }
  };

  // Calculate impacts
  const impacts = useMemo(() => {
    if (!selectedScenario || !showResults) return null;
    return calculateImpact(selectedScenario, parameters);
  }, [selectedScenario, parameters, showResults]);

  const runSimulation = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4C583E] to-[#768064] text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-[#C0A030] text-[#4C583E]">
              {language === "ar" ? "أدوات التحليل" : "Analysis Tools"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === "ar" ? "تحليل تأثير السياسات" : "Policy Impact Analysis"}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {language === "ar"
                ? "نمذجة وتحليل تأثيرات السياسات الاقتصادية على اقتصاد اليمن"
                : "Model and analyze the effects of economic policies on Yemen's economy"}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Scenario Selection */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#C0A030]" />
                    {language === "ar" ? "اختر السيناريو" : "Select Scenario"}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar"
                      ? "اختر سيناريو السياسة للتحليل"
                      : "Choose a policy scenario to analyze"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {policyScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioSelect(scenario.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedScenario?.id === scenario.id
                          ? "border-[#C0A030] bg-[#C0A030]/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-[#C0A030]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedScenario?.id === scenario.id
                            ? "bg-[#C0A030] text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                        }`}>
                          <scenario.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {language === "ar" ? scenario.nameAr : scenario.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {scenario.impacts.length} {language === "ar" ? "مؤشرات" : "indicators"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Parameters & Results */}
            <div className="lg:col-span-2 space-y-6">
              {selectedScenario ? (
                <>
                  {/* Scenario Description */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#C0A030]/20 rounded-lg flex items-center justify-center">
                            <selectedScenario.icon className="w-6 h-6 text-[#C0A030]" />
                          </div>
                          <div>
                            <CardTitle>
                              {language === "ar" ? selectedScenario.nameAr : selectedScenario.name}
                            </CardTitle>
                            <CardDescription>
                              {language === "ar" ? selectedScenario.descriptionAr : selectedScenario.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{selectedScenario.category}</Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Parameters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-[#C0A030]" />
                        {language === "ar" ? "معلمات السيناريو" : "Scenario Parameters"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {selectedScenario.parameters.map((param) => (
                        <div key={param.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              {language === "ar" ? param.nameAr : param.name}
                            </Label>
                            <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {parameters[param.id] || param.default} {param.unit}
                            </span>
                          </div>
                          <Slider
                            value={[parameters[param.id] || param.default]}
                            min={param.min}
                            max={param.max}
                            step={(param.max - param.min) / 100}
                            onValueChange={(value) => {
                              setParameters({ ...parameters, [param.id]: value[0] });
                              setShowResults(false);
                            }}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{param.min} {param.unit}</span>
                            <span>{param.max} {param.unit}</span>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="compare-baseline"
                            checked={compareBaseline}
                            onCheckedChange={setCompareBaseline}
                          />
                          <Label htmlFor="compare-baseline" className="text-sm">
                            {language === "ar" ? "مقارنة مع خط الأساس" : "Compare with baseline"}
                          </Label>
                        </div>
                        <Button onClick={runSimulation} className="bg-[#C0A030] hover:bg-[#a08020] text-[#4C583E]">
                          <Play className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تشغيل المحاكاة" : "Run Simulation"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Results */}
                  {showResults && impacts && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#C0A030]" />
                            {language === "ar" ? "نتائج التحليل" : "Analysis Results"}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              {language === "ar" ? "تصدير" : "Export"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowResults(false)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              {language === "ar" ? "إعادة تعيين" : "Reset"}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(impacts).map(([indicatorId, impact]) => {
                            const indicator = impactIndicators[indicatorId as keyof typeof impactIndicators];
                            if (!indicator) return null;
                            
                            return (
                              <div
                                key={indicatorId}
                                className="p-4 border rounded-lg bg-white dark:bg-gray-800"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {language === "ar" ? indicator.nameAr : indicator.name}
                                  </span>
                                  <Badge
                                    variant={
                                      impact.direction === "up"
                                        ? "default"
                                        : impact.direction === "down"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className={
                                      impact.direction === "up"
                                        ? "bg-green-500"
                                        : impact.direction === "down"
                                        ? "bg-red-500"
                                        : ""
                                    }
                                  >
                                    {impact.direction === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                                    {impact.direction === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                                    {impact.change > 0 ? "+" : ""}{impact.change}%
                                  </Badge>
                                </div>
                                <div className="flex items-end justify-between">
                                  <div>
                                    <div className="text-2xl font-bold text-[#4C583E] dark:text-white">
                                      {impact.value.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500">{indicator.unit}</div>
                                  </div>
                                  {compareBaseline && (
                                    <div className="text-right">
                                      <div className="text-sm text-gray-500">
                                        {language === "ar" ? "خط الأساس" : "Baseline"}
                                      </div>
                                      <div className="text-sm font-medium">
                                        {indicator.baseline.toLocaleString()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {/* Simple bar visualization */}
                                <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      impact.direction === "up"
                                        ? "bg-green-500"
                                        : impact.direction === "down"
                                        ? "bg-red-500"
                                        : "bg-gray-400"
                                    }`}
                                    style={{
                                      width: `${Math.min(100, Math.abs(impact.change) * 2 + 50)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-800 dark:text-amber-200">
                                {language === "ar" ? "إخلاء المسؤولية" : "Disclaimer"}
                              </h4>
                              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                {language === "ar"
                                  ? "هذه النتائج مبنية على نماذج مبسطة وافتراضات. النتائج الفعلية قد تختلف بشكل كبير. يرجى استشارة الخبراء قبل اتخاذ قرارات سياسية."
                                  : "These results are based on simplified models and assumptions. Actual outcomes may vary significantly. Please consult experts before making policy decisions."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                /* No scenario selected */
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {language === "ar" ? "اختر سيناريو للبدء" : "Select a Scenario to Begin"}
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      {language === "ar"
                        ? "اختر سيناريو سياسة من القائمة على اليسار لتحليل تأثيراته المحتملة على الاقتصاد اليمني."
                        : "Choose a policy scenario from the list on the left to analyze its potential impacts on Yemen's economy."}
                    </p>
                  </div>
                </Card>
              )}

              {/* Methodology Note */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#C0A030]" />
                    {language === "ar" ? "المنهجية" : "Methodology"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {language === "ar"
                      ? "تستخدم أداة تحليل تأثير السياسات نماذج اقتصادية مبسطة مبنية على البيانات التاريخية والعلاقات الاقتصادية المعروفة. النماذج تأخذ في الاعتبار:"
                      : "The Policy Impact Analysis tool uses simplified economic models based on historical data and established economic relationships. The models account for:"}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {[
                      language === "ar" ? "العلاقات بين المتغيرات الاقتصادية الكلية" : "Relationships between macroeconomic variables",
                      language === "ar" ? "الخصائص الهيكلية للاقتصاد اليمني" : "Structural characteristics of Yemen's economy",
                      language === "ar" ? "تأثيرات الصراع والانقسام المؤسسي" : "Effects of conflict and institutional fragmentation",
                      language === "ar" ? "ديناميكيات تدفقات المساعدات والتحويلات" : "Dynamics of aid flows and remittances",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-[#C0A030]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link href="/methodology">
                      <Button variant="link" className="p-0 h-auto text-[#C0A030]">
                        {language === "ar" ? "اقرأ المزيد عن منهجيتنا" : "Read more about our methodology"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
