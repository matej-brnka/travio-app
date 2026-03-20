import { useState } from "react";
import { Trip } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { differenceInDays, parseISO, addDays, format } from "date-fns";
import EmojiPicker from "@/components/EmojiPicker";

const destinations = ["New York", "Praha", "Tokio", "Londýn", "Barcelona", "Řím"];

interface NewTripModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (trip: Trip) => void;
}

const NewTripModal = ({ open, onClose, onCreate }: NewTripModalProps) => {
  const [destination, setDestination] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [emoji, setEmoji] = useState("✈️");
  const [dateTo, setDateTo] = useState("");
  const [aiHelp, setAiHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredDestinations = destinations.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  const totalDays =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) : 0;

  const isValid = destination.trim() && dateFrom && dateTo && totalDays > 0;

  const handleCreate = () => {
    if (!isValid) return;
    const days = Array.from({ length: totalDays }, (_, i) => ({
      id: `new-day-${i}`,
      date: format(addDays(parseISO(dateFrom), i), "yyyy-MM-dd"),
      places: [],
    }));
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      name: destination,
      emoji,
      dateFrom,
      dateTo,
      weather: { temp: 20, icon: "🌤️" },
      days,
      unassigned: [],
    };
    onCreate(trip);
    setDestination("");
    setDateFrom("");
    setDateTo("");
    setAiHelp(false);
    setEmoji("✈️");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">✈️ Nová cesta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Emoji picker */}
          <div>
            <Label className="text-foreground text-sm">Emoji</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`w-9 h-9 rounded-md text-lg flex items-center justify-center transition-colors ${
                    emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Label className="text-foreground text-sm">Destinace</Label>
            <Input
              placeholder="🔍 Kam chceš jet?"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="mt-1"
            />
            {showSuggestions && destination && filteredDestinations.length > 0 && (
              <div className="absolute z-10 w-full bg-card border border-border rounded-md mt-1 shadow-card">
                {filteredDestinations.map((d) => (
                  <button
                    key={d}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    onClick={() => {
                      setDestination(d);
                      setShowSuggestions(false);
                    }}
                  >
                    📍 {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="text-foreground text-sm">Datum cesty</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm"
              />
            </div>
            {totalDays > 0 && (
              <p className="text-sm text-muted-foreground mt-2">📅 {totalDays} dní k plánování</p>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">🤖 Chci pomoc od AI</p>
              <p className="text-xs text-muted-foreground">s plánováním tras</p>
            </div>
            <Switch checked={aiHelp} onCheckedChange={setAiHelp} />
          </div>

          {aiHelp && (
            <p className="text-xs text-muted-foreground bg-muted rounded-md p-3">
              AI navrhne základní itinerář, který pak upravíš dle libosti. ✨
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-md" onClick={onClose}>
              Zrušit
            </Button>
            <Button
              className="flex-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleCreate}
              disabled={!isValid}
            >
              ✅ Vytvořit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTripModal;
