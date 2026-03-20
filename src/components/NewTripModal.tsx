import { useState } from "react";
import { Trip } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO, addDays, format } from "date-fns";
import EmojiPicker from "@/components/EmojiPicker";

const destinations = ["New York", "Praha", "Tokio", "Londýn", "Barcelona", "Řím"];

const interestTags = [
  { id: "culture", label: "🎭 Kultura", emoji: "🎭" },
  { id: "museums", label: "🏛️ Muzea", emoji: "🏛️" },
  { id: "sport", label: "⚽ Sport", emoji: "⚽" },
  { id: "food", label: "🍽️ Jídlo", emoji: "🍽️" },
  { id: "nature", label: "🌿 Příroda", emoji: "🌿" },
  { id: "nightlife", label: "🌙 Noční život", emoji: "🌙" },
  { id: "shopping", label: "🛍️ Nákupy", emoji: "🛍️" },
  { id: "history", label: "📜 Historie", emoji: "📜" },
  { id: "architecture", label: "🏗️ Architektura", emoji: "🏗️" },
  { id: "adventure", label: "🧗 Dobrodružství", emoji: "🧗" },
  { id: "relax", label: "🧘 Relax", emoji: "🧘" },
  { id: "family", label: "👨‍👩‍👧 Rodina", emoji: "👨‍👩‍👧" },
];

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
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredDestinations = destinations.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  // +1 to include the last day
  const totalDays =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) + 1 : 0;

  const isValid = destination.trim() && dateFrom && dateTo && totalDays > 0;

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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
      interests: aiHelp ? selectedInterests : undefined,
    };
    onCreate(trip);
    setDestination("");
    setDateFrom("");
    setDateTo("");
    setAiHelp(false);
    setEmoji("✈️");
    setSelectedInterests([]);
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
            <div className="mt-1">
              <EmojiPicker value={emoji} onChange={setEmoji} />
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
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground bg-muted rounded-md p-3">
                AI navrhne základní itinerář, který pak upravíš dle libosti. ✨
              </p>
              <Label className="text-foreground text-sm">Co tě zajímá?</Label>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((tag) => {
                  const isSelected = selectedInterests.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer select-none transition-all text-xs px-3 py-1.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleInterest(tag.id)}
                    >
                      {tag.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
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
