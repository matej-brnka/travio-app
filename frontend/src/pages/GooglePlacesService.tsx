import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { getGooglePlacesCalls, GooglePlacesCall } from "@/api/googlePlaces";
import { calcGoogleCost, GOOGLE_PRICING } from "@/config/googlePlacesPricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const isBillableType = (apiType: string) => (GOOGLE_PRICING[apiType]?.per1000 ?? 0) > 0;

const CallRow = ({ call }: { call: GooglePlacesCall }) => {
  const entry = GOOGLE_PRICING[call.apiType];
  const cost = calcGoogleCost(call.apiType, 1) ?? 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm">
      <span className="text-muted-foreground w-36 shrink-0 text-xs">
        {format(new Date(call.createdAt), "d. M. yyyy HH:mm", { locale: cs })}
      </span>
      <Badge variant="secondary" className="text-xs shrink-0">
        {entry?.label ?? call.apiType}
      </Badge>
      {entry && (
        <span className="text-xs text-muted-foreground shrink-0 hidden md:inline" title="Google ceník SKU">
          {entry.sku}
        </span>
      )}
      {call.query && (
        <span className="text-xs text-muted-foreground truncate max-w-xs" title={call.query}>
          &ldquo;{call.query}&rdquo;
        </span>
      )}
      {call.placeId && !call.query && (
        <span className="text-xs text-muted-foreground font-mono truncate max-w-xs">
          {call.placeId}
        </span>
      )}
      {call.resultCount != null && (
        <span className="text-xs text-muted-foreground ml-1">→ {call.resultCount} výsl.</span>
      )}
      <span className="ml-auto text-xs font-medium shrink-0">
        ${cost.toFixed(4)}
      </span>
    </div>
  );
};

const CallList = ({
  calls,
  loading,
  emptyText,
}: {
  calls: GooglePlacesCall[];
  loading: boolean;
  emptyText: string;
}) => {
  if (!loading && !calls.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {emptyText}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      {calls.map((call) => (
        <CallRow key={call.id} call={call} />
      ))}
    </Card>
  );
};

const GooglePlacesService = () => {
  const [calls, setCalls] = useState<GooglePlacesCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGooglePlacesCalls(500);
      setCalls(data.calls);
    } catch (e: any) {
      setError(e.message ?? "Nepodařilo se načíst servisní data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
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

  const billableCalls = useMemo(() => filtered.filter((c) => isBillableType(c.apiType)), [filtered]);
  const placesCalls = useMemo(() => billableCalls.filter((c) => c.api === 'places'), [billableCalls]);
  const mapsCalls = useMemo(() => billableCalls.filter((c) => c.api === 'maps'), [billableCalls]);

  const totals = useMemo(() => {
    const cost = billableCalls.reduce((acc, c) => acc + (calcGoogleCost(c.apiType, 1) ?? 0), 0);
    return { count: billableCalls.length, cost };
  }, [billableCalls]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Servis: Google Places / Maps</h1>
            <p className="text-sm text-muted-foreground">
              Přehled volání a odhadované náklady dle Google ceníku (USD / 1 000 volání).
            </p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Načítám..." : "Obnovit"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="gp-dateFrom" className="text-xs">Od</Label>
            <Input
              id="gp-dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gp-dateTo" className="text-xs">Do</Label>
            <Input
              id="gp-dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
            />
          </div>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs">
              Zrušit filtr
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {totals.count} účtovaných / {calls.length} celkem
          </span>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Places volání</p>
              <p className="text-xl font-bold">{placesCalls.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Maps volání</p>
              <p className="text-xl font-bold">{mapsCalls.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Odhadovaná cena</p>
              <p className="text-xl font-bold">
                ${totals.cost.toFixed(3)}
              </p>
            </CardContent>
          </Card>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Tabs defaultValue="places">
          <TabsList>
            <TabsTrigger value="places">Places API ({placesCalls.length})</TabsTrigger>
            <TabsTrigger value="maps">Maps API ({mapsCalls.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="places" className="mt-3">
            <CallList
              calls={placesCalls}
              loading={loading}
              emptyText={calls.length ? "Žádná Places volání neodpovídají filtru." : "Zatím nejsou k dispozici žádná Places volání."}
            />
          </TabsContent>
          <TabsContent value="maps" className="mt-3">
            <CallList
              calls={mapsCalls}
              loading={loading}
              emptyText="Zatím nejsou k dispozici žádná Maps API volání."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GooglePlacesService;
