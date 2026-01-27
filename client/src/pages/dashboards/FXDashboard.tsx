/**
 * FX Dashboard - Yemen Exchange Rates Dashboard
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const labels = {
  en: {
    title: "Yemen Exchange Rates Dashboard",
    subtitle: "USD/YER rates across Aden (IRG), Sana'a (DFA), and Parallel markets",
    aden: "Aden (IRG)", sanaa: "Sana'a (DFA)", parallel: "Parallel Market",
    historicalChart: "Historical Chart", gapTickets: "Data Gap Tickets", sourceRegistry: "Source Registry",
    allTime: "All Time (2010-Present)", lastYear: "Last Year", lastMonth: "Last Month",
    noData: "No data available", asOf: "As of", back: "Back",
    splitNote: "Note: The Central Bank of Yemen split in August 2016, creating separate monetary authorities in Aden and Sana'a.",
  },
  ar: {
    title: "لوحة أسعار الصرف اليمنية",
    subtitle: "أسعار الدولار/الريال في عدن وصنعاء والسوق الموازي",
    aden: "عدن (الحكومة المعترف بها)", sanaa: "صنعاء (سلطة الأمر الواقع)", parallel: "السوق الموازي",
    historicalChart: "الرسم البياني التاريخي", gapTickets: "تذاكر فجوات البيانات", sourceRegistry: "سجل المصادر",
    allTime: "كل الفترة (2010-الآن)", lastYear: "السنة الماضية", lastMonth: "الشهر الماضي",
    noData: "لا توجد بيانات", asOf: "حتى", back: "رجوع",
    splitNote: "ملاحظة: انقسم البنك المركزي اليمني في أغسطس 2016.",
  },
};

export default function FXDashboard() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [timeRange, setTimeRange] = useState<"all" | "year" | "month">("all");
  const t = labels[lang];
  const isRTL = lang === "ar";

  const { data: latestRates, isLoading: loadingLatest, refetch } = trpc.fx.getLatestRates.useQuery();
  const { data: chartData, isLoading: loadingChart } = trpc.fx.getChartData.useQuery({
    startDate: timeRange === "month" ? new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0] :
               timeRange === "year" ? new Date(Date.now() - 365*24*60*60*1000).toISOString().split('T')[0] : "2010-01-01",
    regimes: ["IRG", "DFA", "PAR"],
  });
  const { data: gapTickets } = trpc.fx.getGapTickets.useQuery({});
  const { data: sources } = trpc.fx.getSourceRegistry.useQuery();

  const mergedChartData = chartData?.series ? (() => {
    const dateMap = new Map<string, any>();
    chartData.series.forEach(s => {
      s.data.forEach(d => {
        if (!dateMap.has(d.date)) dateMap.set(d.date, { date: d.date });
        dateMap.get(d.date)[s.regime] = d.rate;
      });
    });
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  })() : [];

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(lang === "ar" ? "ar-YE" : "en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`} />{t.back}</Button></Link>
              <div><h1 className="text-2xl font-bold">{t.title}</h1><p className="text-muted-foreground text-sm">{t.subtitle}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")}>{lang === "en" ? "العربية" : "English"}</Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" />{t.aden}</CardTitle></CardHeader>
            <CardContent>
              {loadingLatest ? <Skeleton className="h-12 w-full" /> : latestRates?.aden ? (
                <><div className="text-3xl font-bold">{latestRates.aden.rate.toLocaleString()} YER</div><div className="text-sm text-muted-foreground">{t.asOf} {formatDate(latestRates.aden.date)}</div></>
              ) : <div className="text-muted-foreground">{t.noData}</div>}
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" />{t.sanaa}</CardTitle></CardHeader>
            <CardContent>
              {loadingLatest ? <Skeleton className="h-12 w-full" /> : latestRates?.sanaa ? (
                <><div className="text-3xl font-bold">{latestRates.sanaa.rate.toLocaleString()} YER</div><div className="text-sm text-muted-foreground">{t.asOf} {formatDate(latestRates.sanaa.date)}</div></>
              ) : <div className="text-muted-foreground">{t.noData}</div>}
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" />{t.parallel}</CardTitle></CardHeader>
            <CardContent>
              {loadingLatest ? <Skeleton className="h-12 w-full" /> : latestRates?.parallel ? (
                <><div className="text-3xl font-bold">{latestRates.parallel.rate.toLocaleString()} YER</div><div className="text-sm text-muted-foreground">{t.asOf} {formatDate(latestRates.parallel.date)}</div></>
              ) : <div className="text-muted-foreground">{t.noData}</div>}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50"><CardContent className="py-3"><div className="flex items-start gap-2"><AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-muted-foreground">{t.splitNote}</p></div></CardContent></Card>

        <Tabs defaultValue="chart" className="w-full">
          <TabsList><TabsTrigger value="chart">{t.historicalChart}</TabsTrigger><TabsTrigger value="gaps">{t.gapTickets}</TabsTrigger><TabsTrigger value="sources">{t.sourceRegistry}</TabsTrigger></TabsList>
          <TabsContent value="chart" className="mt-4">
            <Card>
              <CardHeader><div className="flex items-center justify-between"><CardTitle>{t.historicalChart}</CardTitle><div className="flex gap-2">
                <Button variant={timeRange === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("all")}>{t.allTime}</Button>
                <Button variant={timeRange === "year" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("year")}>{t.lastYear}</Button>
                <Button variant={timeRange === "month" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("month")}>{t.lastMonth}</Button>
              </div></div></CardHeader>
              <CardContent>
                {loadingChart ? <Skeleton className="h-[400px] w-full" /> : mergedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={mergedChartData}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={(d) => d.substring(0, 7)} /><YAxis />
                      <Tooltip labelFormatter={(d) => formatDate(d as string)} /><Legend />
                      <Line type="monotone" dataKey="IRG" stroke="#ef4444" name={t.aden} dot={false} />
                      <Line type="monotone" dataKey="DFA" stroke="#3b82f6" name={t.sanaa} dot={false} />
                      <Line type="monotone" dataKey="PAR" stroke="#22c55e" name={t.parallel} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="h-[400px] flex items-center justify-center text-muted-foreground">{t.noData}</div>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gaps" className="mt-4">
            <Card><CardHeader><CardTitle>{t.gapTickets}</CardTitle></CardHeader><CardContent>
              {gapTickets && gapTickets.length > 0 ? (
                <div className="space-y-2">{gapTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><div className="font-medium">{ticket.description}</div><div className="text-sm text-muted-foreground">{ticket.regimeTag} | {ticket.gapType}</div></div>
                    <Badge variant={ticket.status === "open" ? "destructive" : "secondary"}>{ticket.status}</Badge>
                  </div>
                ))}</div>
              ) : <div className="text-center text-muted-foreground py-8">No gap tickets found</div>}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="sources" className="mt-4">
            <Card><CardHeader><CardTitle>{t.sourceRegistry}</CardTitle></CardHeader><CardContent>
              {sources && sources.length > 0 ? (
                <div className="space-y-2">{sources.map((source: any) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div><div className="font-medium">{lang === "ar" && source.nameAr ? source.nameAr : source.name}</div><div className="text-sm text-muted-foreground">{source.sourceCode} | Schedule: {source.schedule}</div></div>
                    <Badge variant={source.isActive ? "default" : "secondary"}>{source.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                ))}</div>
              ) : <div className="text-center text-muted-foreground py-8">No sources registered</div>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
