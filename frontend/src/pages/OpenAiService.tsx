import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { getLlmCalls, LlmCall } from "@/api/llm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OpenAiService = () => {
  const [calls, setCalls] = useState<LlmCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLlmCalls(100);
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

  const totals = useMemo(() => {
    return calls.reduce(
      (acc, call) => ({
        prompt: acc.prompt + (call.usage.promptTokens ?? 0),
        completion: acc.completion + (call.usage.completionTokens ?? 0),
        total: acc.total + (call.usage.totalTokens ?? 0),
      }),
      { prompt: 0, completion: 0, total: 0 },
    );
  }, [calls]);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Prompt tokeny</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{totals.prompt}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Completion tokeny</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{totals.completion}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total tokeny</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{totals.total}</p></CardContent>
          </Card>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-4">
          {calls.map((call) => (
            <Card key={call.id}>
              <CardHeader className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">OpenAI</Badge>
                  <Badge variant="secondary">{call.model}</Badge>
                  <Badge variant="outline">total: {call.usage.totalTokens ?? "n/a"}</Badge>
                  <Badge variant="outline">prompt: {call.usage.promptTokens ?? "n/a"}</Badge>
                  <Badge variant="outline">completion: {call.usage.completionTokens ?? "n/a"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(call.createdAt), "d. M. yyyy HH:mm:ss", { locale: cs })}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ai response (1:1)</p>
                  <pre className="text-xs md:text-sm whitespace-pre-wrap break-words bg-muted rounded-md p-3 overflow-auto">
                    {call.responseContent || "(prázdná odpověď)"}
                  </pre>
                </div>
                {call.messages.map((msg, idx) => (
                  <div key={`${call.id}-${idx}`} className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{msg.role}</p>
                    <pre className="text-xs md:text-sm whitespace-pre-wrap break-words bg-muted rounded-md p-3 overflow-auto">
                      {msg.content}
                    </pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          {!loading && !calls.length && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Zatím nejsou k dispozici žádná OpenAI volání.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenAiService;
