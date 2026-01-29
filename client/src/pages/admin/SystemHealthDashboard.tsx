/**
 * System Health Dashboard
 * Admin page for monitoring evidence coverage, drift metrics, and eval results
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  FileText, 
  RefreshCw,
  TrendingDown,
  TrendingUp,
  XCircle 
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Mock data for demonstration
const EVIDENCE_COVERAGE = {
  overall: 96.2,
  sections: [
    { name: 'Dashboard KPIs', nameAr: 'مؤشرات لوحة المعلومات', coverage: 98, status: 'pass' },
    { name: 'Sector Pages', nameAr: 'صفحات القطاعات', coverage: 96, status: 'pass' },
    { name: 'AI Responses', nameAr: 'ردود الذكاء الاصطناعي', coverage: 94, status: 'warning' },
    { name: 'Reports', nameAr: 'التقارير', coverage: 97, status: 'pass' },
    { name: 'Data Repository', nameAr: 'مستودع البيانات', coverage: 99, status: 'pass' },
  ],
  threshold: 95,
};

const DRIFT_METRICS = {
  retrieval: [
    { name: 'Recall@K', value: 0.83, baseline: 0.85, delta: -0.02, status: 'warning' },
    { name: 'Precision@K', value: 0.79, baseline: 0.80, delta: -0.01, status: 'ok' },
    { name: 'Latency (ms)', value: 250, baseline: 200, delta: 50, status: 'ok' },
  ],
  evidence: [
    { name: 'Coverage', value: 0.94, baseline: 0.95, delta: -0.01, status: 'warning' },
    { name: 'Staleness (days)', value: 5, baseline: 3, delta: 2, status: 'ok' },
    { name: 'Contradiction Rate', value: 0.03, baseline: 0.02, delta: 0.01, status: 'ok' },
  ],
  translation: [
    { name: 'Parity Score', value: 0.96, baseline: 0.98, delta: -0.02, status: 'warning' },
    { name: 'Missing Translations', value: 12, baseline: 5, delta: 7, status: 'warning' },
  ],
  dashboard: [
    { name: 'Load Time (ms)', value: 1500, baseline: 1000, delta: 500, status: 'ok' },
    { name: 'Error Rate', value: 0.008, baseline: 0.005, delta: 0.003, status: 'ok' },
    { name: 'Data Freshness (hrs)', value: 18, baseline: 12, delta: 6, status: 'warning' },
  ],
  model: [
    { name: 'Response Quality', value: 0.88, baseline: 0.90, delta: -0.02, status: 'warning' },
    { name: 'Hallucination Rate', value: 0.015, baseline: 0.01, delta: 0.005, status: 'ok' },
    { name: 'Citation Accuracy', value: 0.93, baseline: 0.95, delta: -0.02, status: 'warning' },
  ],
};

const EVAL_RESULTS = {
  lastRun: '2026-01-29T09:00:00Z',
  overallPassed: true,
  totalTests: 45,
  passedTests: 42,
  failedTests: 3,
  roleEvals: [
    { role: 'Policy Maker', passed: 3, total: 3, status: 'pass' },
    { role: 'Donor', passed: 2, total: 2, status: 'pass' },
    { role: 'Researcher', passed: 2, total: 2, status: 'pass' },
    { role: 'Journalist', passed: 1, total: 1, status: 'pass' },
    { role: 'Private Sector', passed: 1, total: 1, status: 'pass' },
    { role: 'NGO', passed: 0, total: 1, status: 'fail' },
  ],
  sectorEvals: [
    { sector: 'Currency', passed: 1, total: 1, status: 'pass' },
    { sector: 'Prices', passed: 1, total: 1, status: 'pass' },
    { sector: 'Banking', passed: 0, total: 1, status: 'fail' },
    { sector: 'Trade', passed: 1, total: 1, status: 'pass' },
    { sector: 'Fiscal', passed: 1, total: 1, status: 'pass' },
    { sector: 'Aid', passed: 0, total: 1, status: 'fail' },
  ],
  citationGate: {
    passed: true,
    coverage: 0.962,
    threshold: 0.95,
  },
};

export default function SystemHealthDashboard() {
  const { language, t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
      case 'ok':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-black">Warning</Badge>;
      case 'fail':
      case 'critical':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDeltaIcon = (delta: number, isHigherBetter: boolean = true) => {
    const isPositive = isHigherBetter ? delta >= 0 : delta <= 0;
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'ar' ? 'لوحة صحة النظام' : 'System Health Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'مراقبة تغطية الأدلة ومقاييس الانحراف ونتائج التقييم'
              : 'Monitor evidence coverage, drift metrics, and evaluation results'}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh All'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Evidence Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{EVIDENCE_COVERAGE.overall}%</div>
            <Progress value={EVIDENCE_COVERAGE.overall} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Threshold: {EVIDENCE_COVERAGE.threshold}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Drift Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">7</div>
            <p className="text-xs text-muted-foreground mt-1">
              Warnings across 5 dimensions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Eval Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((EVAL_RESULTS.passedTests / EVAL_RESULTS.totalTests) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {EVAL_RESULTS.passedTests}/{EVAL_RESULTS.totalTests} tests passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Eval Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(EVAL_RESULTS.lastRun).toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(EVAL_RESULTS.lastRun).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="evidence" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evidence">Evidence Coverage</TabsTrigger>
          <TabsTrigger value="drift">Drift Monitoring</TabsTrigger>
          <TabsTrigger value="evals">Eval Results</TabsTrigger>
        </TabsList>

        {/* Evidence Coverage Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Coverage by Section</CardTitle>
              <CardDescription>
                Citation coverage across different platform sections. Target: ≥95%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {EVIDENCE_COVERAGE.sections.map((section) => (
                  <div key={section.name} className="flex items-center gap-4">
                    <div className="w-40 font-medium">
                      {language === 'ar' ? section.nameAr : section.name}
                    </div>
                    <div className="flex-1">
                      <Progress value={section.coverage} className="h-2" />
                    </div>
                    <div className="w-16 text-right font-mono">{section.coverage}%</div>
                    <div className="w-20">{getStatusBadge(section.status)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Citation Gate Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {EVAL_RESULTS.citationGate.passed ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <div className="font-medium">
                    {EVAL_RESULTS.citationGate.passed ? 'Gate Passed' : 'Gate Failed'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Coverage: {(EVAL_RESULTS.citationGate.coverage * 100).toFixed(1)}% 
                    (Threshold: {(EVAL_RESULTS.citationGate.threshold * 100)}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drift Monitoring Tab */}
        <TabsContent value="drift" className="space-y-4">
          {Object.entries(DRIFT_METRICS).map(([category, metrics]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category} Drift</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                      <div className="w-40 font-medium">{metric.name}</div>
                      <div className="w-24 font-mono text-right">
                        {typeof metric.value === 'number' && metric.value < 1 
                          ? (metric.value * 100).toFixed(1) + '%'
                          : metric.value}
                      </div>
                      <div className="flex items-center gap-1 w-24">
                        {getDeltaIcon(
                          metric.delta, 
                          !metric.name.includes('Rate') && !metric.name.includes('Latency') && !metric.name.includes('Missing')
                        )}
                        <span className="text-sm font-mono">
                          {metric.delta > 0 ? '+' : ''}{metric.delta}
                        </span>
                      </div>
                      <div className="w-20">{getStatusBadge(metric.status)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Eval Results Tab */}
        <TabsContent value="evals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Role-Based Evaluations</CardTitle>
                <CardDescription>Golden questions per stakeholder role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EVAL_RESULTS.roleEvals.map((eval_) => (
                    <div key={eval_.role} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="font-medium">{eval_.role}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{eval_.passed}/{eval_.total}</span>
                        {getStatusBadge(eval_.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector-Based Evaluations</CardTitle>
                <CardDescription>Golden questions per economic sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EVAL_RESULTS.sectorEvals.map((eval_) => (
                    <div key={eval_.sector} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="font-medium">{eval_.sector}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{eval_.passed}/{eval_.total}</span>
                        {getStatusBadge(eval_.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Failed Tests</CardTitle>
              <CardDescription>Tests requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">NGO Role - Food Security Query</div>
                    <div className="text-sm text-muted-foreground">
                      Insufficient citation coverage (72% vs 80% required)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Banking Sector - Split Status Query</div>
                    <div className="text-sm text-muted-foreground">
                      Missing expected topics: CBY Aden, CBY Sana'a
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="font-medium">Aid Sector - Disbursement Query</div>
                    <div className="text-sm text-muted-foreground">
                      Retrieval recall below threshold (65% vs 70% required)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
