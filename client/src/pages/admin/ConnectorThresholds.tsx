import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sliders,
  Save,
  RotateCcw,
  AlertTriangle,
  Clock,
  Database,
  CheckCircle2,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Connector metadata for display
const connectorMeta: Record<string, { name: string; description: string; updateFrequency: string }> = {
  world_bank: { name: "World Bank WDI", description: "GDP, poverty, trade, and population indicators", updateFrequency: "Annual" },
  unhcr: { name: "UNHCR", description: "Refugees, IDPs, and asylum seeker data", updateFrequency: "Monthly" },
  who: { name: "WHO GHO", description: "Health indicators and disease statistics", updateFrequency: "Quarterly" },
  ocha_fts: { name: "OCHA FTS", description: "Humanitarian funding flows and appeals", updateFrequency: "Weekly" },
  wfp: { name: "WFP VAM", description: "Food security and market prices", updateFrequency: "Weekly" },
  cby: { name: "Central Bank of Yemen", description: "Exchange rates and monetary data", updateFrequency: "Daily" },
  hdx: { name: "HDX CKAN", description: "Humanitarian datasets and resources", updateFrequency: "Bi-weekly" },
  fews_net: { name: "FEWS NET", description: "Food security early warning data", updateFrequency: "Monthly" },
  reliefweb: { name: "ReliefWeb", description: "Humanitarian reports and updates", updateFrequency: "Daily" },
  sanctions: { name: "Sanctions Lists", description: "OFAC, EU, and UK sanctions data", updateFrequency: "Weekly" },
  unicef: { name: "UNICEF", description: "Child welfare and education data", updateFrequency: "Quarterly" },
  undp: { name: "UNDP HDI", description: "Human development indicators", updateFrequency: "Annual" },
};

export default function ConnectorThresholds() {
  const utils = trpc.useUtils();
  
  // Fetch thresholds from backend
  // @ts-ignore
  const { data: thresholds, isLoading } = trpc.admin.getConnectorThresholds.useQuery();
  // @ts-ignore
  const { data: connectorStatus } = trpc.admin.getConnectorStatus.useQuery();

  // Local state for editing
  const [localThresholds, setLocalThresholds] = useState<Record<string, { warningDays: number; criticalDays: number; enabled: boolean }>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [savingConnector, setSavingConnector] = useState<string | null>(null);

  // Initialize local state from fetched data
  useEffect(() => {
    if (thresholds) {
      const initial: Record<string, any> = {};
      thresholds.forEach((t: any) => {
        initial[t.connectorCode] = {
          warningDays: t.warningDays,
          criticalDays: t.criticalDays,
          enabled: t.enabled,
        };
      });
      setLocalThresholds(initial);
    }
  }, [thresholds]);

  // Mutations
  // @ts-ignore
  const updateThreshold = trpc.admin.updateConnectorThreshold.useMutation({
    onSuccess: () => {
      toast.success("Threshold updated");
      // @ts-ignore
      utils.admin.getConnectorThresholds.invalidate();
      setSavingConnector(null);
    },
    onError: (error: any) => {
      toast.error("Failed to update threshold", { description: error.message });
      setSavingConnector(null);
    },
  });

  // @ts-ignore
  const resetThresholds = trpc.admin.resetConnectorThresholds.useMutation({
    onSuccess: () => {
      toast.success("All thresholds reset to defaults");
      // @ts-ignore
      utils.admin.getConnectorThresholds.invalidate();
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error("Failed to reset thresholds", { description: error.message });
    },
  });

  const handleThresholdChange = (connectorCode: string, field: "warningDays" | "criticalDays", value: number) => {
    setLocalThresholds(prev => ({
      ...prev,
      [connectorCode]: {
        ...prev[connectorCode],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleToggleEnabled = (connectorCode: string) => {
    const current = localThresholds[connectorCode];
    if (!current) return;
    
    setSavingConnector(connectorCode);
    updateThreshold.mutate({
      connectorCode,
      warningDays: current.warningDays,
      criticalDays: current.criticalDays,
      enabled: !current.enabled,
    });
    
    setLocalThresholds(prev => ({
      ...prev,
      [connectorCode]: {
        ...prev[connectorCode],
        enabled: !prev[connectorCode].enabled,
      },
    }));
  };

  const handleSaveThreshold = (connectorCode: string) => {
    const current = localThresholds[connectorCode];
    if (!current) return;
    
    setSavingConnector(connectorCode);
    updateThreshold.mutate({
      connectorCode,
      warningDays: current.warningDays,
      criticalDays: current.criticalDays,
      enabled: current.enabled,
    });
  };

  const handleResetAll = () => {
    if (confirm("Are you sure you want to reset all thresholds to their default values?")) {
      resetThresholds.mutate();
    }
  };

  const getDataAge = (connectorCode: string): number | null => {
    const connector = (connectorStatus || []).find((c: any) => 
      c.id.replace(/-/g, '_') === connectorCode || c.id === connectorCode
    );
    if (!connector?.lastFetch) return null;
    const lastFetch = new Date(connector.lastFetch);
    return Math.floor((Date.now() - lastFetch.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (connectorCode: string) => {
    const threshold = localThresholds[connectorCode];
    const dataAge = getDataAge(connectorCode);
    
    if (!threshold?.enabled) return "gray";
    if (dataAge === null) return "gray";
    if (dataAge >= threshold.criticalDays) return "red";
    if (dataAge >= threshold.warningDays) return "yellow";
    return "green";
  };

  // Calculate summary stats
  const stats = {
    healthy: Object.keys(localThresholds).filter(c => getStatusColor(c) === "green").length,
    warning: Object.keys(localThresholds).filter(c => getStatusColor(c) === "yellow").length,
    critical: Object.keys(localThresholds).filter(c => getStatusColor(c) === "red").length,
    disabled: Object.keys(localThresholds).filter(c => !localThresholds[c]?.enabled).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sliders className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Connector Thresholds</h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Configure data freshness thresholds for each connector. Set warning and critical 
              levels to receive alerts when data becomes stale.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">{stats.healthy}</div>
                <div className="text-sm text-green-600">Healthy</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-700">{stats.warning}</div>
                <div className="text-sm text-yellow-600">Warning</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Database className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold text-gray-700">{stats.disabled}</div>
                <div className="text-sm text-gray-600">Disabled</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleResetAll}
            disabled={resetThresholds.isPending}
          >
            {resetThresholds.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Reset to Defaults
          </Button>
        </div>

        {/* Threshold Cards */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {(thresholds || []).map((threshold: any) => {
              const meta = connectorMeta[threshold.connectorCode] || {
                name: threshold.connectorCode,
                description: "Data connector",
                updateFrequency: "Unknown",
              };
              const local = localThresholds[threshold.connectorCode] || threshold;
              const dataAge = getDataAge(threshold.connectorCode);
              const statusColor = getStatusColor(threshold.connectorCode);

              return (
                <Card key={threshold.connectorCode} className={`transition-all ${!local.enabled ? "opacity-60" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Connector Info */}
                      <div className="lg:w-1/4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            statusColor === "green" ? "bg-green-500" :
                            statusColor === "yellow" ? "bg-yellow-500" :
                            statusColor === "red" ? "bg-red-500" :
                            "bg-gray-400"
                          }`} />
                          <h3 className="font-semibold">{meta.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{meta.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {meta.updateFrequency}
                          </Badge>
                          {dataAge !== null && (
                            <Badge variant={statusColor === "green" ? "default" : statusColor === "yellow" ? "secondary" : "destructive"} className="text-xs">
                              {dataAge}d old
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Threshold Sliders */}
                      <div className="lg:w-1/2 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              Warning Threshold
                            </label>
                            <span className="text-sm font-mono bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                              {local.warningDays} days
                            </span>
                          </div>
                          <Slider
                            value={[local.warningDays]}
                            onValueChange={([value]) => handleThresholdChange(threshold.connectorCode, "warningDays", value)}
                            min={1}
                            max={180}
                            step={1}
                            disabled={!local.enabled}
                            className="[&_[role=slider]]:bg-yellow-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              Critical Threshold
                            </label>
                            <span className="text-sm font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              {local.criticalDays} days
                            </span>
                          </div>
                          <Slider
                            value={[local.criticalDays]}
                            onValueChange={([value]) => handleThresholdChange(threshold.connectorCode, "criticalDays", value)}
                            min={1}
                            max={365}
                            step={1}
                            disabled={!local.enabled}
                            className="[&_[role=slider]]:bg-red-500"
                          />
                        </div>

                        {/* Visual Timeline */}
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 h-full bg-green-500"
                            style={{ width: `${(local.warningDays / 365) * 100}%` }}
                          />
                          <div
                            className="absolute h-full bg-yellow-500"
                            style={{
                              left: `${(local.warningDays / 365) * 100}%`,
                              width: `${((local.criticalDays - local.warningDays) / 365) * 100}%`,
                            }}
                          />
                          <div
                            className="absolute h-full bg-red-500"
                            style={{
                              left: `${(local.criticalDays / 365) * 100}%`,
                              width: `${((365 - local.criticalDays) / 365) * 100}%`,
                            }}
                          />
                          {dataAge !== null && (
                            <div
                              className="absolute top-0 w-1 h-4 bg-black -mt-1 rounded"
                              style={{ left: `${Math.min((dataAge / 365) * 100, 100)}%` }}
                              title={`Current: ${dataAge} days`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:w-1/4 flex items-center justify-end gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Enabled</span>
                          <Switch
                            checked={local.enabled}
                            onCheckedChange={() => handleToggleEnabled(threshold.connectorCode)}
                            disabled={savingConnector === threshold.connectorCode}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSaveThreshold(threshold.connectorCode)}
                          disabled={savingConnector === threshold.connectorCode || !local.enabled}
                        >
                          {savingConnector === threshold.connectorCode ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">How Thresholds Work</h4>
              <p className="text-sm text-blue-700 mt-1">
                When data from a connector exceeds the <strong>warning threshold</strong>, you'll receive 
                a warning notification. If it exceeds the <strong>critical threshold</strong>, you'll receive 
                a critical alert. Disabled connectors won't trigger any alerts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
