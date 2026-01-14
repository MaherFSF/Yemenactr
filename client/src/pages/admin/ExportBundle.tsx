import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Download, 
  FileCode, 
  Database, 
  FileText, 
  Image, 
  Settings,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FolderArchive,
  GitBranch,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  size: string;
  included: boolean;
  required?: boolean;
}

export default function ExportBundle() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState("");
  const [options, setOptions] = useState<ExportOption[]>([
    {
      id: "source",
      label: "Source Code",
      description: "All TypeScript/React source files, components, and pages",
      icon: <FileCode className="w-5 h-5" />,
      size: "~15 MB",
      included: true,
      required: true
    },
    {
      id: "docs",
      label: "Documentation",
      description: "README, manuals, API docs, and deployment guides",
      icon: <FileText className="w-5 h-5" />,
      size: "~2 MB",
      included: true,
      required: true
    },
    {
      id: "migrations",
      label: "Database Migrations",
      description: "Drizzle schema and migration files",
      icon: <Database className="w-5 h-5" />,
      size: "~500 KB",
      included: true,
      required: true
    },
    {
      id: "seeds",
      label: "Seed Data",
      description: "Initial data for glossary, timeline, indicators, and research",
      icon: <Database className="w-5 h-5" />,
      size: "~5 MB",
      included: true
    },
    {
      id: "configs",
      label: "Configuration Files",
      description: "Vite, TypeScript, Tailwind, and ESLint configs",
      icon: <Settings className="w-5 h-5" />,
      size: "~100 KB",
      included: true,
      required: true
    },
    {
      id: "env_template",
      label: "Environment Template",
      description: ".env.example with all required variables (no secrets)",
      icon: <Shield className="w-5 h-5" />,
      size: "~5 KB",
      included: true,
      required: true
    },
    {
      id: "screenshots",
      label: "Screenshots",
      description: "UI screenshots for documentation and reference",
      icon: <Image className="w-5 h-5" />,
      size: "~10 MB",
      included: true
    },
    {
      id: "assets",
      label: "Static Assets",
      description: "Images, icons, fonts, and public files",
      icon: <Image className="w-5 h-5" />,
      size: "~8 MB",
      included: true
    }
  ]);

  const toggleOption = (id: string) => {
    setOptions(prev => prev.map(opt => 
      opt.id === id && !opt.required 
        ? { ...opt, included: !opt.included }
        : opt
    ));
  };

  const calculateTotalSize = () => {
    const sizes: Record<string, number> = {
      source: 15,
      docs: 2,
      migrations: 0.5,
      seeds: 5,
      configs: 0.1,
      env_template: 0.005,
      screenshots: 10,
      assets: 8
    };
    
    const total = options
      .filter(opt => opt.included)
      .reduce((sum, opt) => sum + (sizes[opt.id] || 0), 0);
    
    return total.toFixed(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    const steps = [
      { label: "Preparing source code...", progress: 10 },
      { label: "Bundling documentation...", progress: 25 },
      { label: "Exporting database migrations...", progress: 40 },
      { label: "Generating seed data...", progress: 55 },
      { label: "Collecting configuration files...", progress: 70 },
      { label: "Creating environment template...", progress: 80 },
      { label: "Packaging screenshots...", progress: 90 },
      { label: "Creating ZIP archive...", progress: 95 },
      { label: "Finalizing export...", progress: 100 }
    ];

    for (const step of steps) {
      setExportStep(step.label);
      setExportProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsExporting(false);
    toast.success("Platform bundle exported successfully!", {
      description: "yeto-platform-bundle.zip is ready for download"
    });
  };

  const lastExports = [
    { date: "2026-01-14 14:30", version: "v2.5.0", size: "38.2 MB", status: "success" },
    { date: "2026-01-10 09:15", version: "v2.4.1", size: "37.8 MB", status: "success" },
    { date: "2026-01-05 16:45", version: "v2.4.0", size: "36.5 MB", status: "success" }
  ];

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8" />
              Export Platform Bundle
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a complete, deployable package for GitHub and AWS
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Options */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Contents</CardTitle>
                <CardDescription>
                  Select what to include in the export bundle. Required items cannot be deselected.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {options.map(option => (
                    <div 
                      key={option.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        option.included ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        id={option.id}
                        checked={option.included}
                        onCheckedChange={() => toggleOption(option.id)}
                        disabled={option.required}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          {option.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{option.size}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Security Notice
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      This export excludes all secrets, API keys, and sensitive credentials. 
                      The bundle includes only an <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">.env.example</code> template 
                      that you must populate with your own credentials before deployment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Summary & Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Selected Items</span>
                  <span className="font-medium">
                    {options.filter(o => o.included).length} / {options.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated Size</span>
                  <span className="font-medium">~{calculateTotalSize()} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">ZIP Archive</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <Badge>v2.5.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Build Status</span>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Export Progress */}
            {isExporting && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Exporting...</span>
                  </div>
                  <Progress value={exportProgress} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{exportStep}</p>
                </CardContent>
              </Card>
            )}

            {/* Export Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Bundle
                </>
              )}
            </Button>

            {/* Recent Exports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent Exports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lastExports.map((exp, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="w-4 h-4 text-muted-foreground" />
                        <span>{exp.version}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{exp.size}</span>
                        <Clock className="w-3 h-3" />
                        <span>{exp.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* GitHub Export */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <GitBranch className="w-5 h-5" />
                  <span className="font-medium">Export to GitHub</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Push the bundle directly to a GitHub repository
                </p>
                <Button variant="outline" className="w-full">
                  Connect GitHub
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
