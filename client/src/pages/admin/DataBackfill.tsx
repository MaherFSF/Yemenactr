import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function DataBackfill() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const backfillMutation = trpc.admin.backfillBankingData.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsRunning(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      setIsRunning(false);
    },
  });

  const handleBackfill = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    backfillMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Backfill Management</h1>
        <p className="text-muted-foreground mt-2">
          Populate historical data (2023-2026) for all economic sectors
        </p>
      </div>

      {/* Banking Sector Backfill */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Banking Sector Backfill
          </CardTitle>
          <CardDescription>
            Populate 2023-2026 banking indicators including NPL ratio, deposit growth, credit-to-GDP, capital adequacy, and liquidity ratios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Indicators</div>
              <div className="text-2xl font-bold">5</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Data Points</div>
              <div className="text-2xl font-bold">55</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Years</div>
              <div className="text-2xl font-bold">2023-2026</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground">Source</div>
              <div className="text-sm font-medium mt-1">Central Bank</div>
            </div>
          </div>

          <Button
            onClick={handleBackfill}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Backfill...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Run Banking Backfill
              </>
            )}
          </Button>

          {/* Success Result */}
          {result && result.success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="font-semibold mb-2">Backfill completed successfully!</div>
                <div className="space-y-1 text-sm">
                  <div>📈 Records inserted: <span className="font-bold">{result.recordsInserted}</span></div>
                  <div>📊 Indicators processed: <span className="font-bold">{result.indicatorsProcessed}</span></div>
                  <div>✅ Banking sector data is now available for 2023-2026</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-1">Backfill failed</div>
                <div className="text-sm">{error}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Important Notes</div>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>This will insert/update 55 data points across 5 indicators</li>
                <li>Existing data will be updated with new values</li>
                <li>Process typically takes 5-10 seconds</li>
                <li>Data will immediately appear in Banking sector dashboard</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Coming Soon - Other Sectors */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Trade Sector Backfill
          </CardTitle>
          <CardDescription>
            Coming soon - Import/export volumes, trade balance, port throughput
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full" size="lg">
            Coming Soon
          </Button>
        </CardContent>
      </Card>

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Energy Sector Backfill
          </CardTitle>
          <CardDescription>
            Coming soon - Oil production, electricity generation, fuel prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full" size="lg">
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
