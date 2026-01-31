import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  ScatterChart,
  Activity,
  Map,
  GitBranch,
  Calendar,
  Plus,
  Save,
  Eye,
  Download,
  Settings,
  Palette,
  Database,
  FileText,
  RefreshCw,
  Trash2,
  Copy
} from "lucide-react";
import { toast } from "sonner";

type ChartType = "line" | "bar" | "scatter" | "heatmap" | "network" | "sankey" | "timeline" | "area" | "pie" | "donut" | "treemap" | "choropleth";

interface ChartConfig {
  id?: number;
  name: string;
  nameAr?: string;
  description?: string;
  chartType: ChartType;
  dataSource: string;
  indicatorCodes: string[];
  dateRange?: { start: string; end: string };
  regimeFilter?: "aden" | "sanaa" | "both";
  config: {
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    animate?: boolean;
    stacked?: boolean;
    normalized?: boolean;
  };
  evidencePackEnabled: boolean;
  confidenceThreshold: "A" | "B" | "C" | "D";
}

const chartTypes: { type: ChartType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "line", label: "Line Chart", icon: <LineChart className="w-6 h-6" />, description: "Time series trends" },
  { type: "bar", label: "Bar Chart", icon: <BarChart3 className="w-6 h-6" />, description: "Categorical comparison" },
  { type: "area", label: "Area Chart", icon: <Activity className="w-6 h-6" />, description: "Stacked trends" },
  { type: "scatter", label: "Scatter Plot", icon: <ScatterChart className="w-6 h-6" />, description: "Correlation analysis" },
  { type: "pie", label: "Pie Chart", icon: <PieChart className="w-6 h-6" />, description: "Part-to-whole" },
  { type: "donut", label: "Donut Chart", icon: <PieChart className="w-6 h-6" />, description: "Part-to-whole with center" },
  { type: "heatmap", label: "Heatmap", icon: <Map className="w-6 h-6" />, description: "Density visualization" },
  { type: "network", label: "Network Graph", icon: <GitBranch className="w-6 h-6" />, description: "Relationship mapping" },
  { type: "sankey", label: "Sankey Diagram", icon: <GitBranch className="w-6 h-6" />, description: "Flow visualization" },
  { type: "timeline", label: "Timeline", icon: <Calendar className="w-6 h-6" />, description: "Event sequence" },
  { type: "treemap", label: "Treemap", icon: <BarChart3 className="w-6 h-6" />, description: "Hierarchical data" },
  { type: "choropleth", label: "Choropleth Map", icon: <Map className="w-6 h-6" />, description: "Geographic data" },
];

const indicators = [
  { code: "FX_ADEN", name: "Exchange Rate (Aden)" },
  { code: "FX_SANAA", name: "Exchange Rate (Sana'a)" },
  { code: "CPI_NATIONAL", name: "Consumer Price Index" },
  { code: "INFLATION_YOY", name: "Inflation Rate (YoY)" },
  { code: "GDP_NOMINAL", name: "GDP (Nominal)" },
  { code: "OIL_PRODUCTION", name: "Oil Production" },
  { code: "FOOD_PRICES", name: "Food Price Index" },
  { code: "IPC_PHASE", name: "IPC Food Security Phase" },
  { code: "HUM_FUNDING", name: "Humanitarian Funding" },
  { code: "REMITTANCES", name: "Remittance Inflows" },
];

const colorPalettes = {
  yeto: ["#4C583E", "#4C583E", "#C0A030", "#4A90A4", "#7B8794"],
  warm: ["#FF6B6B", "#FFA94D", "#FFD93D", "#6BCB77", "#4D96FF"],
  cool: ["#3D5A80", "#98C1D9", "#E0FBFC", "#EE6C4D", "#293241"],
  mono: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560"],
};

export default function VisualizationBuilder() {
  const [activeTab, setActiveTab] = useState("builder");
  const [config, setConfig] = useState<ChartConfig>({
    name: "",
    chartType: "line",
    dataSource: "time_series",
    indicatorCodes: [],
    config: {
      colors: colorPalettes.yeto,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true,
      stacked: false,
      normalized: false,
    },
    evidencePackEnabled: true,
    confidenceThreshold: "B",
  });

  const [savedCharts, setSavedCharts] = useState<ChartConfig[]>([
    {
      id: 1,
      name: "Exchange Rate Comparison",
      nameAr: "مقارنة سعر الصرف",
      chartType: "line",
      dataSource: "time_series",
      indicatorCodes: ["FX_ADEN", "FX_SANAA"],
      config: { colors: colorPalettes.yeto, showLegend: true, showGrid: true, showTooltip: true, animate: true },
      evidencePackEnabled: true,
      confidenceThreshold: "A",
    },
    {
      id: 2,
      name: "Inflation Trend",
      nameAr: "اتجاه التضخم",
      chartType: "area",
      dataSource: "time_series",
      indicatorCodes: ["INFLATION_YOY"],
      config: { colors: colorPalettes.warm, showLegend: true, showGrid: true, showTooltip: true, animate: true },
      evidencePackEnabled: true,
      confidenceThreshold: "B",
    },
    {
      id: 3,
      name: "Humanitarian Funding Flow",
      nameAr: "تدفق التمويل الإنساني",
      chartType: "sankey",
      dataSource: "humanitarian",
      indicatorCodes: ["HUM_FUNDING"],
      config: { colors: colorPalettes.cool, showLegend: true, showTooltip: true, animate: true },
      evidencePackEnabled: true,
      confidenceThreshold: "A",
    },
  ]);

  const handleSave = () => {
    if (!config.name) {
      toast.error("Please enter a chart name");
      return;
    }
    if (config.indicatorCodes.length === 0) {
      toast.error("Please select at least one indicator");
      return;
    }
    
    const newChart = { ...config, id: Date.now() };
    setSavedCharts([...savedCharts, newChart]);
    toast.success("Visualization saved successfully");
    
    // Reset form
    setConfig({
      name: "",
      chartType: "line",
      dataSource: "time_series",
      indicatorCodes: [],
      config: {
        colors: colorPalettes.yeto,
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        animate: true,
        stacked: false,
        normalized: false,
      },
      evidencePackEnabled: true,
      confidenceThreshold: "B",
    });
  };

  const handleDelete = (id: number) => {
    setSavedCharts(savedCharts.filter(c => c.id !== id));
    toast.success("Visualization deleted");
  };

  const handleDuplicate = (chart: ChartConfig) => {
    const newChart = { ...chart, id: Date.now(), name: `${chart.name} (Copy)` };
    setSavedCharts([...savedCharts, newChart]);
    toast.success("Visualization duplicated");
  };

  const toggleIndicator = (code: string) => {
    setConfig(prev => ({
      ...prev,
      indicatorCodes: prev.indicatorCodes.includes(code)
        ? prev.indicatorCodes.filter(c => c !== code)
        : [...prev.indicatorCodes, code]
    }));
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Visualization Builder</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage data visualizations with evidence packs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="builder">
              <Plus className="w-4 h-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="library">
              <BarChart3 className="w-4 h-4 mr-2" />
              Library ({savedCharts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Chart Name (English)</Label>
                        <Input
                          id="name"
                          value={config.name}
                          onChange={(e) => setConfig({ ...config, name: e.target.value })}
                          placeholder="e.g., Exchange Rate Trend"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nameAr">Chart Name (Arabic)</Label>
                        <Input
                          id="nameAr"
                          value={config.nameAr || ""}
                          onChange={(e) => setConfig({ ...config, nameAr: e.target.value })}
                          placeholder="e.g., اتجاه سعر الصرف"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={config.description || ""}
                        onChange={(e) => setConfig({ ...config, description: e.target.value })}
                        placeholder="Describe what this visualization shows..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Chart Type Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chart Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {chartTypes.map(({ type, label, icon, description }) => (
                        <button
                          key={type}
                          onClick={() => setConfig({ ...config, chartType: type })}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            config.chartType === type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {icon}
                          </div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Data Source */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Source</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data Source</Label>
                        <Select
                          value={config.dataSource}
                          onValueChange={(value) => setConfig({ ...config, dataSource: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time_series">Time Series Data</SelectItem>
                            <SelectItem value="humanitarian">Humanitarian Data</SelectItem>
                            <SelectItem value="banking">Banking Sector</SelectItem>
                            <SelectItem value="trade">Trade Data</SelectItem>
                            <SelectItem value="conflict">Conflict Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Regime Filter</Label>
                        <Select
                          value={config.regimeFilter || "both"}
                          onValueChange={(value: "aden" | "sanaa" | "both") => 
                            setConfig({ ...config, regimeFilter: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="both">Both Regimes</SelectItem>
                            <SelectItem value="aden">Aden (IRG)</SelectItem>
                            <SelectItem value="sanaa">Sana'a (DFA)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Indicators</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {indicators.map(ind => (
                          <button
                            key={ind.code}
                            onClick={() => toggleIndicator(ind.code)}
                            className={`p-2 text-left text-sm rounded border transition-all ${
                              config.indicatorCodes.includes(ind.code)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="font-mono text-xs text-muted-foreground">{ind.code}</span>
                            <p className="font-medium">{ind.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview & Settings Panel */}
              <div className="space-y-6">
                {/* Live Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        {config.indicatorCodes.length > 0 ? (
                          <>
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">{config.chartType.toUpperCase()} Chart</p>
                            <p className="text-xs">{config.indicatorCodes.length} indicator(s)</p>
                          </>
                        ) : (
                          <>
                            <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Select indicators to preview</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Display Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Legend</Label>
                      <Switch
                        checked={config.config.showLegend}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, config: { ...config.config, showLegend: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Grid</Label>
                      <Switch
                        checked={config.config.showGrid}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, config: { ...config.config, showGrid: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Tooltip</Label>
                      <Switch
                        checked={config.config.showTooltip}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, config: { ...config.config, showTooltip: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Animate</Label>
                      <Switch
                        checked={config.config.animate}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, config: { ...config.config, animate: checked } })
                        }
                      />
                    </div>
                    <Separator />
                    <div>
                      <Label className="mb-2 block">Color Palette</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(colorPalettes).map(([name, colors]) => (
                          <button
                            key={name}
                            onClick={() => setConfig({ ...config, config: { ...config.config, colors } })}
                            className={`p-2 rounded border ${
                              JSON.stringify(config.config.colors) === JSON.stringify(colors)
                                ? "border-primary"
                                : "border-border"
                            }`}
                          >
                            <div className="flex gap-1 mb-1">
                              {colors.slice(0, 5).map((color, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <p className="text-xs capitalize">{name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Evidence Pack Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Evidence Pack
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Evidence Pack</Label>
                      <Switch
                        checked={config.evidencePackEnabled}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, evidencePackEnabled: checked })
                        }
                      />
                    </div>
                    <div>
                      <Label>Minimum Confidence</Label>
                      <Select
                        value={config.confidenceThreshold}
                        onValueChange={(value: "A" | "B" | "C" | "D") => 
                          setConfig({ ...config, confidenceThreshold: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Highest Confidence</SelectItem>
                          <SelectItem value="B">B - High Confidence</SelectItem>
                          <SelectItem value="C">C - Moderate Confidence</SelectItem>
                          <SelectItem value="D">D - Low Confidence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Visualization
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCharts.map(chart => (
                <Card key={chart.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {chart.chartType}
                        </Badge>
                        <CardTitle className="text-lg">{chart.name}</CardTitle>
                        {chart.nameAr && (
                          <p className="text-sm text-muted-foreground mt-1" dir="rtl">
                            {chart.nameAr}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Database className="w-4 h-4" />
                      <span>{chart.indicatorCodes.length} indicators</span>
                      {chart.evidencePackEnabled && (
                        <>
                          <span>•</span>
                          <FileText className="w-4 h-4" />
                          <span>Evidence Pack</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicate(chart)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => chart.id && handleDelete(chart.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
