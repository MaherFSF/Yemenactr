import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Sliders,
  Save,
  RotateCcw,
  AlertTriangle,
  Clock,
  Database,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface ConnectorThreshold {
  id: string;
  name: string;
  description: string;
  warningDays: number;
  criticalDays: number;
  enabled: boolean;
  updateFrequency: string;
  lastUpdated?: Date;
}

const defaultThresholds: ConnectorThreshold[] = [
  {
    id: "world-bank",
    name: "World Bank WDI",
    description: "GDP, poverty, trade, and population indicators",
    warningDays: 30,
    criticalDays: 90,
    enabled: true,
    updateFrequency: "Annual",
    lastUpdated: new Date(Date.now() - 86400000 * 15),
  },
  {
    id: "unhcr",
    name: "UNHCR",
    description: "Refugees, IDPs, and asylum seeker data",
    warningDays: 14,
    criticalDays: 30,
    enabled: true,
    updateFrequency: "Monthly",
    lastUpdated: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: "who-gho",
    name: "WHO GHO",
    description: "Health indicators and disease statistics",
    warningDays: 30,
    criticalDays: 60,
    enabled: true,
    updateFrequency: "Quarterly",
    lastUpdated: new Date(Date.now() - 86400000 * 20),
  },
  {
    id: "ocha-fts",
    name: "OCHA FTS",
    description: "Humanitarian funding flows and appeals",
    warningDays: 7,
    criticalDays: 14,
    enabled: true,
    updateFrequency: "Weekly",
    lastUpdated: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "wfp-vam",
    name: "WFP VAM",
    description: "Food security and market prices",
    warningDays: 7,
    criticalDays: 14,
    enabled: false,
    updateFrequency: "Weekly",
  },
  {
    id: "cby",
    name: "Central Bank of Yemen",
    description: "Exchange rates and monetary data",
    warningDays: 1,
    criticalDays: 3,
    enabled: true,
    updateFrequency: "Daily",
    lastUpdated: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: "hdx-ckan",
    name: "HDX CKAN",
    description: "Humanitarian datasets and resources",
    warningDays: 14,
    criticalDays: 30,
    enabled: true,
    updateFrequency: "Bi-weekly",
    lastUpdated: new Date(Date.now() - 86400000 * 8),
  },
  {
    id: "fews-net",
    name: "FEWS NET",
    description: "IPC food security classifications",
    warningDays: 30,
    criticalDays: 60,
    enabled: true,
    updateFrequency: "Monthly",
    lastUpdated: new Date(Date.now() - 86400000 * 12),
  },
  {
    id: "reliefweb",
    name: "ReliefWeb",
    description: "Humanitarian reports and updates",
    warningDays: 3,
    criticalDays: 7,
    enabled: false,
    updateFrequency: "Daily",
  },
  {
    id: "sanctions",
    name: "Sanctions Lists",
    description: "OFAC, EU, and UK sanctions data",
    warningDays: 7,
    criticalDays: 14,
    enabled: true,
    updateFrequency: "Weekly",
    lastUpdated: new Date(Date.now() - 86400000 * 4),
  },
  {
    id: "unicef",
    name: "UNICEF",
    description: "Child welfare and education indicators",
    warningDays: 30,
    criticalDays: 60,
    enabled: true,
    updateFrequency: "Quarterly",
    lastUpdated: new Date(Date.now() - 86400000 * 25),
  },
  {
    id: "undp",
    name: "UNDP HDI",
    description: "Human development indicators",
    warningDays: 90,
    criticalDays: 180,
    enabled: false,
    updateFrequency: "Annual",
  },
];

export default function ConnectorThresholds() {
  const [thresholds, setThresholds] = useState<ConnectorThreshold[]>(defaultThresholds);
  const [hasChanges, setHasChanges] = useState(false);

  const updateThreshold = (id: string, field: keyof ConnectorThreshold, value: any) => {
    setThresholds(thresholds.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In production, this would save to the database
    toast.success("Thresholds saved successfully");
    setHasChanges(false);
  };

  const handleReset = () => {
    setThresholds(defaultThresholds);
    setHasChanges(false);
    toast.info("Thresholds reset to defaults");
  };

  const getDataAge = (lastUpdated?: Date) => {
    if (!lastUpdated) return null;
    const days = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusColor = (connector: ConnectorThreshold) => {
    if (!connector.enabled) return "gray";
    const age = getDataAge(connector.lastUpdated);
    if (age === null) return "gray";
    if (age >= connector.criticalDays) return "red";
    if (age >= connector.warningDays) return "yellow";
    return "green";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <h1 className="text-3xl font-bold">Connector Thresholds</h1>
                </div>
                <p className="text-white/80 max-w-2xl">
                  Customize stale data thresholds for each connector based on their 
                  expected update frequency. Different data sources update at different rates.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  className="bg-white text-teal-600 hover:bg-white/90"
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-400">How thresholds work</p>
              <p className="text-blue-600/80 dark:text-blue-300/80">
                <strong>Warning threshold:</strong> Days after which data is considered stale and a warning is triggered.
                <br />
                <strong>Critical threshold:</strong> Days after which data is critically outdated and requires immediate attention.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Threshold Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {thresholds.map((connector) => {
            const age = getDataAge(connector.lastUpdated);
            const statusColor = getStatusColor(connector);
            
            return (
              <Card 
                key={connector.id} 
                className={`transition-all ${!connector.enabled ? "opacity-60" : ""} ${
                  statusColor === "red" ? "border-l-4 border-l-red-500" :
                  statusColor === "yellow" ? "border-l-4 border-l-yellow-500" :
                  statusColor === "green" ? "border-l-4 border-l-green-500" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        statusColor === "red" ? "bg-red-100 dark:bg-red-900/30" :
                        statusColor === "yellow" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                        statusColor === "green" ? "bg-green-100 dark:bg-green-900/30" :
                        "bg-gray-100 dark:bg-gray-800"
                      }`}>
                        <Database className={`w-5 h-5 ${
                          statusColor === "red" ? "text-red-600" :
                          statusColor === "yellow" ? "text-yellow-600" :
                          statusColor === "green" ? "text-green-600" :
                          "text-gray-500"
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{connector.name}</CardTitle>
                        <CardDescription>{connector.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={connector.enabled}
                      onCheckedChange={(checked) => updateThreshold(connector.id, "enabled", checked)}
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updates: {connector.updateFrequency}</span>
                    </div>
                    {age !== null ? (
                      <Badge variant={
                        statusColor === "red" ? "destructive" :
                        statusColor === "yellow" ? "outline" :
                        "default"
                      } className={
                        statusColor === "green" ? "bg-green-100 text-green-700 border-green-200" :
                        statusColor === "yellow" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : ""
                      }>
                        {age === 0 ? "Updated today" : `${age} days old`}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No data</Badge>
                    )}
                  </div>

                  {/* Warning Threshold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                        Warning after
                      </Label>
                      <span className="text-sm font-medium">{connector.warningDays} days</span>
                    </div>
                    <Slider
                      value={[connector.warningDays]}
                      onValueChange={([value]) => updateThreshold(connector.id, "warningDays", value)}
                      max={90}
                      min={1}
                      step={1}
                      className="[&_[role=slider]]:bg-yellow-500"
                      disabled={!connector.enabled}
                    />
                  </div>

                  {/* Critical Threshold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        Critical after
                      </Label>
                      <span className="text-sm font-medium">{connector.criticalDays} days</span>
                    </div>
                    <Slider
                      value={[connector.criticalDays]}
                      onValueChange={([value]) => updateThreshold(connector.id, "criticalDays", value)}
                      max={180}
                      min={connector.warningDays + 1}
                      step={1}
                      className="[&_[role=slider]]:bg-red-500"
                      disabled={!connector.enabled}
                    />
                  </div>

                  {/* Visual Timeline */}
                  <div className="pt-2">
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 h-full bg-green-500" 
                        style={{ width: `${(connector.warningDays / 180) * 100}%` }}
                      />
                      <div 
                        className="absolute h-full bg-yellow-500" 
                        style={{ 
                          left: `${(connector.warningDays / 180) * 100}%`,
                          width: `${((connector.criticalDays - connector.warningDays) / 180) * 100}%` 
                        }}
                      />
                      <div 
                        className="absolute h-full bg-red-500" 
                        style={{ 
                          left: `${(connector.criticalDays / 180) * 100}%`,
                          width: `${((180 - connector.criticalDays) / 180) * 100}%` 
                        }}
                      />
                      {age !== null && (
                        <div 
                          className="absolute w-1 h-4 bg-black dark:bg-white -top-1 rounded-full"
                          style={{ left: `${Math.min((age / 180) * 100, 100)}%` }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0 days</span>
                      <span className="text-yellow-600">{connector.warningDays}d</span>
                      <span className="text-red-600">{connector.criticalDays}d</span>
                      <span>180 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Threshold Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {thresholds.filter(t => t.enabled && getStatusColor(t) === "green").length}
                </p>
                <p className="text-sm text-muted-foreground">Healthy</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {thresholds.filter(t => t.enabled && getStatusColor(t) === "yellow").length}
                </p>
                <p className="text-sm text-muted-foreground">Warning</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {thresholds.filter(t => t.enabled && getStatusColor(t) === "red").length}
                </p>
                <p className="text-sm text-muted-foreground">Critical</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  {thresholds.filter(t => !t.enabled).length}
                </p>
                <p className="text-sm text-muted-foreground">Disabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
