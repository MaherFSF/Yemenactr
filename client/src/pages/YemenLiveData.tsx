/**
 * Yemen Live Data Dashboard
 * Displays REAL data fetched live from World Bank Open Data API
 * No mock data - everything here is sourced from api.worldbank.org
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Loader2, Globe, TrendingUp, TrendingDown, AlertCircle, ExternalLink } from "lucide-react";

// ── World Bank indicator codes for Yemen ──────────────────────────────────────
const WB_INDICATORS = [
  { code: "NY.GDP.MKTP.KD.ZG", label: "GDP Growth Rate", unit: "% annual", color: "#4ade80" },
  { code: "FP.CPI.TOTL.ZG",    label: "Inflation Rate",  unit: "% annual", color: "#f59e0b" },
  { code: "SL.UEM.TOTL.ZS",    label: "Unemployment",    unit: "% of labour force", color: "#f87171" },
  { code: "BX.TRF.PWKR.DT.GD.ZS", label: "Remittances",  unit: "% of GDP", color: "#60a5fa" },
];

// ── Custom tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2e1a] border border-[#3a5a3a] rounded-lg px-4 py-3 shadow-xl text-sm">
      <p className="text-[#C9A961] font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value?.toFixed(2)}</span> {unit}
        </p>
      ))}
    </div>
  );
}

// ── Single indicator chart card ────────────────────────────────────────────────
function IndicatorCard({
  indicator,
  data,
  isLoading,
}: {
  indicator: typeof WB_INDICATORS[0];
  data: { year: number; value: number }[];
  isLoading: boolean;
}) {
  const latest = data[data.length - 1];
  const prev   = data[data.length - 2];
  const change = latest && prev ? latest.value - prev.value : null;
  const isPositive = change !== null && change >= 0;

  return (
    <div className="bg-[#1a2e1a]/80 border border-[#3a5a3a] rounded-2xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-base">{indicator.label}</h3>
          <p className="text-[#8aab8a] text-xs mt-0.5">{indicator.unit}</p>
        </div>
        {latest && (
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: indicator.color }}>
              {latest.value.toFixed(1)}
              <span className="text-sm font-normal text-[#8aab8a] ml-1">%</span>
            </p>
            <p className="text-xs text-[#8aab8a]">{latest.year}</p>
          </div>
        )}
      </div>

      {/* Change badge */}
      {change !== null && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? "+" : ""}{change.toFixed(2)} pp vs {prev?.year}
        </div>
      )}

      {/* Chart */}
      <div className="h-40">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#C9A961]" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8aab8a] text-sm">
            <AlertCircle className="h-4 w-4 mr-2" /> No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id={`grad-${indicator.code}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={indicator.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={indicator.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a4a2a" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#8aab8a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#8aab8a", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toFixed(0)}
              />
              <Tooltip content={<CustomTooltip unit={indicator.unit} />} />
              <ReferenceLine y={0} stroke="#4a6a4a" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="value"
                name={indicator.label}
                stroke={indicator.color}
                strokeWidth={2}
                fill={`url(#grad-${indicator.code})`}
                dot={{ fill: indicator.color, r: 2 }}
                activeDot={{ r: 5, fill: indicator.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data points count */}
      {!isLoading && data.length > 0 && (
        <p className="text-[#6a8a6a] text-xs">
          {data.length} data points · {data[0]?.year}–{data[data.length - 1]?.year}
        </p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function YemenLiveData() {
  const indicatorInput = useMemo(
    () => WB_INDICATORS.map((i) => ({ code: i.code, label: i.label, unit: i.unit })),
    []
  );

  const { data, isLoading, error, dataUpdatedAt } = trpc.sectors.getLiveWorldBankData.useQuery(
    { indicators: indicatorInput, fromYear: 2010 },
    {
      staleTime: 1000 * 60 * 30, // cache 30 min
      retry: 2,
    }
  );

  const fetchedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : null;

  return (
    <div className="min-h-screen bg-[#111e11] text-white">
      {/* ── Header ── */}
      <div className="border-b border-[#2a4a2a] bg-[#0d1a0d]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-[#C9A961]" />
                <span className="text-[#C9A961] text-sm font-medium uppercase tracking-wider">
                  Live Data · World Bank API
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Yemen Economic Indicators
              </h1>
              <p className="text-[#8aab8a] mt-2 max-w-xl">
                Real data fetched directly from the{" "}
                <a
                  href="https://data.worldbank.org/country/YE"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#C9A961] underline underline-offset-2 hover:text-yellow-300 inline-flex items-center gap-1"
                >
                  World Bank Open Data API
                  <ExternalLink className="h-3 w-3" />
                </a>
                . No mock data.
              </p>
            </div>

            <div className="text-right text-xs text-[#6a8a6a] space-y-1">
              {isLoading && (
                <div className="flex items-center gap-2 text-[#C9A961]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Fetching from World Bank…
                </div>
              )}
              {error && (
                <div className="text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> API error
                </div>
              )}
              {fetchedAt && !isLoading && (
                <div>Updated: {fetchedAt}</div>
              )}
              <div>Source: api.worldbank.org/v2/country/YE</div>
              <div>Country code: YEM · ISO 3166-1 alpha-2: YE</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Row ── */}
      {data && !isLoading && (
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {WB_INDICATORS.map((ind) => {
              const series = data.data[ind.code] ?? [];
              const latest = series[series.length - 1];
              return (
                <div key={ind.code} className="bg-[#1a2e1a]/60 border border-[#2a4a2a] rounded-xl px-5 py-4">
                  <p className="text-[#8aab8a] text-xs mb-1">{ind.label}</p>
                  {latest ? (
                    <>
                      <p className="text-2xl font-bold" style={{ color: ind.color }}>
                        {latest.value.toFixed(1)}%
                      </p>
                      <p className="text-[#6a8a6a] text-xs mt-1">{latest.year}</p>
                    </>
                  ) : (
                    <p className="text-[#6a8a6a] text-sm">No data</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Charts Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WB_INDICATORS.map((ind) => (
              <IndicatorCard
                key={ind.code}
                indicator={ind}
                data={data.data[ind.code] ?? []}
                isLoading={false}
              />
            ))}
          </div>

          {/* ── Source Attribution ── */}
          <div className="mt-8 p-4 bg-[#1a2e1a]/40 border border-[#2a4a2a] rounded-xl text-xs text-[#6a8a6a]">
            <p className="font-medium text-[#8aab8a] mb-1">Data Attribution</p>
            <p>
              All data sourced from the World Bank Open Data API (
              <a href="https://data.worldbank.org" target="_blank" rel="noreferrer" className="text-[#C9A961] hover:underline">
                data.worldbank.org
              </a>
              ) under the{" "}
              <a href="https://datacatalog.worldbank.org/public-licenses" target="_blank" rel="noreferrer" className="text-[#C9A961] hover:underline">
                Creative Commons Attribution 4.0 license
              </a>
              . Data represents official national statistics as reported to the World Bank. Some years may have gaps due to conflict-related reporting disruptions in Yemen.
            </p>
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#C9A961]" />
          <p className="text-[#8aab8a]">Fetching real Yemen data from World Bank API…</p>
          <p className="text-[#6a8a6a] text-sm">api.worldbank.org/v2/country/YE/indicator/…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {error && !isLoading && (
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-white font-medium">Could not reach World Bank API</p>
          <p className="text-[#8aab8a] text-sm max-w-md text-center">
            {error.message}. Please check your connection and try again.
          </p>
        </div>
      )}
    </div>
  );
}
