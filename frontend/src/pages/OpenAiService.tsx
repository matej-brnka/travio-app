import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getLlmCalls, LlmCall } from "@/api/llm";
import { calcCost } from "@/config/llmPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const OpenAiService = () => {
  const [calls, setCalls] = useState<LlmCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLlmCalls(500);
      setCalls(data.calls);
    } catch (e: any) {
      setError(e.message ?? "Nepodařilo se načíst servisní data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      const d = new Date(call.createdAt);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }
      return true;
    });
  }, [calls, dateFrom, dateTo]);

  const totals = useMemo(() => {
    return filteredCalls.reduce(
      (acc, call) => {
        const cost = calcCost(call.model, call.usage.promptTokens, call.usage.completionTokens);
        return {
          prompt: acc.prompt + (call.usage.promptTokens ?? 0),
          completion: acc.completion + (call.usage.completionTokens ?? 0),
          total: acc.total + (call.usage.totalTokens ?? 0),
          cost: acc.cost + (cost ?? 0),
          hasUnknownCost: acc.hasUnknownCost || cost === null,
        };
      },
      { prompt: 0, completion: 0, total: 0, cost: 0, hasUnknownCost: false },
    );
  }, [filteredCalls]);

  const toggleOpen = (id: number) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Servis: OpenAI volání</h1>
            <p className="text-sm text-muted-foreground">
              Přehled volání, přesné prompty a spotřeba tokenů.
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Načítám..." : "Obnovit"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="dateFrom" className="text-xs">Od</Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dateTo" className="text-xs">Do</Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="text-xs"
            >
              Zrušit filtr
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredCalls.length} / {calls.length} volání
          </span>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Prompt tokeny</p>
              <p className="text-xl font-bold">{totals.prompt.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Completion tokeny</p>
              <p className="text-xl font-bold">{totals.completion.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Total tokeny</p>
              <p className="text-xl font-bold">{totals.total.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Odhadovaná cena</p>
              <p className="text-xl font-bold">
                ${totals.cost.toFixed(4)}
                {totals.hasUnknownCost && (
                  <span className="text-xs font-normal text-muted-foreground ml-1" title="Některá volání nemají cenu v ceníku">+?</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Call list */}
        <div className="space-y-2">
          {filteredCalls.map((call) => {
            const isOpen = openIds.has(call.id);
            const cost = calcCost(call.model, call.usage.promptTokens, call.usage.completionTokens);
            return (
              <Collapsible key={call.id} open={isOpen} onOpenChange={() => toggleOpen(call.id)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors rounded-t-lg">
                      <span className="text-muted-foreground">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                      <span className="text-sm text-muted-foreground w-36 shrink-0">
                        {format(new Date(call.createdAt), "d. M. yyyy HH:mm", { locale: cs })}
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">OpenAI</Badge>
                      <Badge variant="secondary" className="text-xs shrink-0">{call.model}</Badge>
                      <div className="flex gap-2 ml-auto shrink-0 flex-wrap justify-end">
                        <Badge variant="outline" className="text-xs">P: {call.usage.promptTokens ?? "–"}</Badge>
                        <Badge variant="outline" className="text-xs">C: {call.usage.completionTokens ?? "–"}</Badge>
                        <Badge variant="outline" className="text-xs">T: {call.usage.totalTokens ?? "–"}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {cost != null ? `$${cost.toFixed(4)}` : "cena –"}
                        </Badge>
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-3 border-t pt-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Response (1:1)</p>
                        <pre className="text-xs whitespace-pre-wrap break-words bg-muted rounded-md p-3 overflow-auto max-h-64">
                          {call.responseContent || "(prázdná odpověď)"}
                        </pre>
                      </div>
                      {call.messages.map((msg, idx) => (
                        <div key={`${call.id}-${idx}`} className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{msg.role}</p>
                          <pre className="text-xs whitespace-pre-wrap break-words bg-muted rounded-md p-3 overflow-auto max-h-64">
                            {msg.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
          {!loading && !filteredCalls.length && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                {calls.length ? "Žádná volání neodpovídají filtru." : "Zatím nejsou k dispozici žádná OpenAI volání."}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenAiService;
