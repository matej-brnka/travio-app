import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { searchPlaces } from "@/api/search";

export interface PlaceData {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  website?: string;
  openingHours?: string[];
  googlePlaceId?: string;
}

interface AddPlaceSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (place: PlaceData) => Promise<void>;
  centerLat?: number | null;
  centerLng?: number | null;
}

const AddPlaceSheet = ({ open, onClose, onAdd, centerLat, centerLng }: AddPlaceSheetProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceData[]>([]);
  const [searching, setSearching] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setShowManual(false);
      setManualName("");
      setManualAddress("");
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPlaces(query, centerLat, centerLng);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] p-0 lg:rounded-2xl lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-md">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-foreground text-lg font-bold">📍 Přidat místo</h2>
        </div>

        <div className="px-5 pb-6 space-y-4">
          {!showManual ? (
            <>
              <Input
                ref={inputRef}
                placeholder="🔍 Hledat místo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-base"
              />

              <div className="space-y-2 max-h-[45vh] overflow-y-auto">
                <p className="text-xs text-muted-foreground font-medium">
                  {searching ? "Hledám..." : query.trim() ? "Výsledky:" : "Zadej název místa pro vyhledání"}
                </p>
                {!searching && results.length === 0 && query.trim() ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <span className="text-2xl block mb-2">🔍</span>
                    <p className="text-sm">Nic nenalezeno</p>
                    <p className="text-xs mt-1">Zkus jiný výraz nebo přidej ručně</p>
                  </div>
                ) : (
                  results.map((place) => (
                    <button
                      key={place.googlePlaceId ?? place.name}
                      className="w-full bg-card border border-border rounded-lg p-3 text-left hover:border-primary/50 transition-colors disabled:opacity-50"
                      disabled={adding}
                      onClick={async () => { setAdding(true); try { await onAdd(place); onClose(); } finally { setAdding(false); } }}
                    >
                      <p className="text-sm font-medium text-foreground">📍 {place.name}</p>
                      {place.address && <p className="text-xs text-muted-foreground mt-0.5">{place.address}</p>}
                    </button>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full rounded-md border-primary text-primary"
                  onClick={() => setShowManual(true)}
                >
                  + Přidat bez vyhledávání
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground">Název místa *</label>
                <Input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Např. Eiffelova věž"
                  className="mt-1 text-base"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Adresa (volitelná)</label>
                <Input
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Champ de Mars, Paříž"
                  className="mt-1 text-base"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-md" onClick={() => setShowManual(false)}>
                  ← Zpět
                </Button>
                <Button
                  className="flex-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!manualName.trim() || adding}
                  onClick={async () => {
                    setAdding(true);
                    try { await onAdd({ name: manualName, address: manualAddress || undefined }); onClose(); }
                    finally { setAdding(false); }
                  }}
                >
                  {adding ? "Přidávám..." : "✅ Přidat"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddPlaceSheet;
