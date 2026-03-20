import { useState, useEffect, useRef } from "react";
import { mockPlaceSuggestions } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setShowManual(false);
      setManualName("");
      setManualAddress("");
    }
  }, [open]);

  const filtered = mockPlaceSuggestions.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="text-foreground">📍 Přidat místo</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          {!showManual ? (
            <>
              <Input
                ref={inputRef}
                placeholder="🔍 Hledat místo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {query && (
                  <p className="text-xs text-muted-foreground">Návrhy:</p>
                )}
                {filtered.map((place) => (
                  <button
                    key={place.name}
                    className="w-full bg-muted rounded-md p-3 text-left hover:bg-muted/80 transition-colors"
                    onClick={() => onAdd(place.name, place.address)}
                  >
                    <p className="text-sm font-medium text-foreground">📍 {place.name}</p>
                    <p className="text-xs text-muted-foreground">{place.address}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Nebo přidat ručně:</p>
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
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Adresa (volitelná)</label>
                <Input
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Champ de Mars, Paříž"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={() => setShowManual(false)}
                >
                  Zpět
                </Button>
                <Button
                  className="flex-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!manualName.trim()}
                  onClick={() => onAdd(manualName, manualAddress || undefined)}
                >
                  Přidat
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
