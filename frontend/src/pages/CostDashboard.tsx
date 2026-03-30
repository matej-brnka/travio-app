import { useEffect, useMemo, useState } from "react";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getCostSummary, CostSummary } from "@/api/costs";
import { LLM_PRICING, calcCost } from "@/config/llmPricing";
import { GOOGLE_PLACES_PRICING } from "@/config/googlePlacesPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PERIODS = [
  { label: "7 dní", days: 7 },
  { label: "30 dní", days: 30 },
  { label: "90 dní", days: 90 },
];

const GP_LABELS: Record<string, string> = {
  text_search:   "Text Search",
  place_details: "Place Details",
  place_photo:   "Place Photo",
};

const fmt = (n: number) => `$${n.toFixed(4)}`;

// ── helpers ────────────────────────────────────────────────────────────────

function calcLlmCost(model: string, prompt: number, completion: number): number {
  return calcCost(model, prompt, completion) ?? 0;
}

function calcGpCost(apiType: string, calls: number): number {
  return (GOOGLE_PLACES_PRICING[apiType] ?? 0) * calls;
}

// ── Trend badge ─────────────────────────────────────────────────────────────

const Trend = ({ current, previous }: { current: number; previous: number }) => {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const up = pct > 1;
  const down = pct < -1;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? "text-destructive" : down ? "text-green-600" : "text-muted-foreground"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : down ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {pct > 0 ? "+" : ""}{pct.toFixed(0)} %
    </span>
  );
};

// ── Main component ──────────────────────────────────────────────────────────

const CostDashboard = () => {
  const [data, setData] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const load = async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      setData(await getCostSummary(d));
    } catch (e: any) {
      setError(e.message ?? "Nepodařilo se načíst data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(days); }, [days]);

  // ── Derived numbers ──────────────────────────────────────────────────────

  const { llmTotal, gpTotal, dailyChart, llmBreakdown, gpBreakdown, llmPrev, gpPrev } = useMemo(() => {
    if (!data) return { llmTotal: 0, gpTotal: 0, dailyChart: [], llmBreakdown: [], gpBreakdown: [], llmPrev: 0, gpPrev: 0 };

    const halfDays = Math.ceil(days / 2);
    const splitDate = format(subDays(new Date(), halfDays), "yyyy-MM-dd");

    // Build day-indexed maps
    const llmByDay: Record<string, number> = {};
    const gpByDay: Record<string, number> = {};
    let llmTotal = 0, gpTotal = 0, llmPrev = 0, gpPrev = 0;

    data.llm.forEach(({ date, model, promptTokens, completionTokens }) => {
      const cost = calcLlmCost(model, promptTokens, completionTokens);
      llmByDay[date] = (llmByDay[date] ?? 0) + cost;
      llmTotal += cost;
      if (date < splitDate) llmPrev += cost;
    });

    data.googlePlaces.forEach(({ date, apiType, calls }) => {
      const cost = calcGpCost(apiType, calls);
      gpByDay[date] = (gpByDay[date] ?? 0) + cost;
      gpTotal += cost;
      if (date < splitDate) gpPrev += cost;
    });

    // Fill every day in range for the chart
    const allDays = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
    const dailyChart = allDays.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      return {
        date: format(d, "d.M.", { locale: cs }),
        openai: +(llmByDay[key] ?? 0).toFixed(5),
        google: +(gpByDay[key] ?? 0).toFixed(5),
      };
    });

    // LLM breakdown by model
    const llmMap: Record<string, { calls: number; promptTokens: number; completionTokens: number; cost: number }> = {};
    data.llm.forEach(({ model, calls, promptTokens, completionTokens }) => {
      if (!llmMap[model]) llmMap[model] = { calls: 0, promptTokens: 0, completionTokens: 0, cost: 0 };
      llmMap[model].calls += calls;
      llmMap[model].promptTokens += promptTokens;
      llmMap[model].completionTokens += completionTokens;
      llmMap[model].cost += calcLlmCost(model, promptTokens, completionTokens);
    });
    const llmBreakdown = Object.entries(llmMap).sort((a, b) => b[1].cost - a[1].cost);

    // Google Places breakdown by api_type
    const gpMap: Record<string, { calls: number; cost: number }> = {};
    data.googlePlaces.forEach(({ apiType, calls }) => {
      if (!gpMap[apiType]) gpMap[apiType] = { calls: 0, cost: 0 };
      gpMap[apiType].calls += calls;
      gpMap[apiType].cost += calcGpCost(apiType, calls);
    });
    const gpBreakdown = Object.entries(gpMap).sort((a, b) => b[1].cost - a[1].cost);

    const llmCurr = llmTotal - llmPrev;
    const gpCurr = gpTotal - gpPrev;

    return { llmTotal, gpTotal, dailyChart, llmBreakdown, gpBreakdown, llmPrev, gpPrev, llmCurr: llmCurr, gpCurr: gpCurr } as any;
  }, [data, days]);

  const total = llmTotal + gpTotal;
  const llmCurr = (data?.llm ?? []).reduce((s, r) => {
    const key = format(subDays(new Date(), Math.ceil(days / 2)), "yyyy-MM-dd");
    return r.date >= key ? s + calcLlmCost(r.model, r.promptTokens, r.completionTokens) : s;
  }, 0);
  const gpCurr = (data?.googlePlaces ?? []).reduce((s, r) => {
    const key = format(subDays(new Date(), Math.ceil(days / 2)), "yyyy-MM-dd");
    return r.date >= key ? s + calcGpCost(r.apiType, r.calls) : s;
  }, 0);

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Náklady na provoz</h1>
            <p className="text-sm text-muted-foreground">OpenAI + Google Places – odhadované náklady v USD</p>
          </div>
          <div className="flex items-center gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.days}
                variant={days === p.days ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => load(days)} disabled={loading}>
              {loading ? "…" : "↺"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="md:col-span-2">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Celkem za {days} dní</p>
              <p className="text-3xl font-bold">{fmt(total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">OpenAI</p>
              <p className="text-xl font-bold">{fmt(llmTotal)}</p>
              <Trend current={llmCurr} previous={llmPrev} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">Google Places</p>
              <p className="text-xl font-bold">{fmt(gpTotal)}</p>
              <Trend current={gpCurr} previous={gpPrev} />
            </CardContent>
          </Card>
        </div>

        {/* Daily chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Denní náklady</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={days <= 7 ? 0 : Math.floor(days / 10)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toFixed(3)}`} width={60} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(5)}`, undefined]} />
                <Legend />
                <Bar dataKey="openai" name="OpenAI" stackId="a" fill="#00798c" radius={[0, 0, 0, 0]} />
                <Bar dataKey="google" name="Google Places" stackId="a" fill="#edae49" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* OpenAI breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OpenAI – podle modelu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {llmBreakdown.length === 0 && (
                <p className="text-xs text-muted-foreground">Žádná data</p>
              )}
              {llmBreakdown.map(([model, s]) => (
                <div key={model} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs shrink-0">{model}</Badge>
                  <span className="text-xs text-muted-foreground">{s.calls}× volání</span>
                  <span className="text-xs text-muted-foreground">{(s.promptTokens + s.completionTokens).toLocaleString()} tok.</span>
                  <span className="ml-auto font-medium text-xs">{fmt(s.cost)}</span>
                  {!LLM_PRICING[model] && <span className="text-xs text-destructive" title="Model není v ceníku">!</span>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Google Places breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Google Places – podle typu volání</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {gpBreakdown.length === 0 && (
                <p className="text-xs text-muted-foreground">Žádná data</p>
              )}
              {gpBreakdown.map(([apiType, s]) => (
                <div key={apiType} className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs shrink-0">{GP_LABELS[apiType] ?? apiType}</Badge>
                  <span className="text-xs text-muted-foreground">{s.calls}× volání</span>
                  <span className="ml-auto font-medium text-xs">{fmt(s.cost)}</span>
                </div>
              ))}
              {gpBreakdown.length > 0 && (
                <p className="text-xs text-muted-foreground pt-1">
                  Google poskytuje $200 kredit/měsíc.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Links to detail pages */}
        <div className="flex gap-3 text-xs text-muted-foreground">
          <a href="/app/service/openai" className="underline hover:text-foreground">→ Detail OpenAI volání</a>
          <a href="/app/service/google-places" className="underline hover:text-foreground">→ Detail Google Places volání</a>
        </div>
      </div>
    </div>
  );
};

export default CostDashboard;
