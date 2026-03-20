import { useState, useEffect, useRef } from "react";
import { mockPlaceSuggestions } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X } from "lucide-react";

interface AddPlaceSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, address?: string) => void;
}

const AddPlaceSheet = ({ open, onClose, onAdd }: AddPlaceSheetProps) => {
  const [query, setQuery] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setShowManual(false);
      setManualName("");
      setManualAddress("");
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const filtered = query.trim()
    ? mockPlaceSuggestions.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.address.toLowerCase().includes(query.toLowerCase())
      )
    : mockPlaceSuggestions;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-foreground text-lg font-bold">📍 Přidat místo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
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
                  {query.trim() ? "Výsledky:" : "Návrhy:"}
                </p>
                {filtered.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <span className="text-2xl block mb-2">🔍</span>
                    <p className="text-sm">Nic nenalezeno</p>
                    <p className="text-xs mt-1">Zkus jiný výraz nebo přidej ručně</p>
                  </div>
                ) : (
                  filtered.map((place) => (
                    <button
                      key={place.name}
                      className="w-full bg-card border border-border rounded-lg p-3 text-left hover:border-primary/50 transition-colors"
                      onClick={() => onAdd(place.name, place.address)}
                    >
                      <p className="text-sm font-medium text-foreground">📍 {place.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{place.address}</p>
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
                <Button
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={() => setShowManual(false)}
                >
                  ← Zpět
                </Button>
                <Button
                  className="flex-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!manualName.trim()}
                  onClick={() => onAdd(manualName, manualAddress || undefined)}
                >
                  ✅ Přidat
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
