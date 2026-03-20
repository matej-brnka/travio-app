import { useState } from "react";
import { Trip } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { differenceInDays, parseISO, addDays, format } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/EmojiPicker";

const destinations = ["New York", "Praha", "Tokio", "Londýn", "Barcelona", "Řím"];

const interestCategories = [
  {
    title: "🎯 Aktivity",
    tags: [
      { id: "culture", label: "🎭 Kultura" },
      { id: "museums", label: "🏛️ Muzea" },
      { id: "sport", label: "⚽ Sport" },
      { id: "nature", label: "🌿 Příroda" },
      { id: "adventure", label: "🧗 Dobrodružství" },
      { id: "hiking", label: "🥾 Turistika" },
      { id: "beaches", label: "🏖️ Pláže" },
      { id: "nightlife", label: "🌙 Noční život" },
    ],
  },
  {
    title: "🍽️ Jídlo & pití",
    tags: [
      { id: "food", label: "🍽️ Gastronomie" },
      { id: "streetfood", label: "🌮 Street food" },
      { id: "wine", label: "🍷 Víno & degustace" },
      { id: "cafes", label: "☕ Kavárny" },
    ],
  },
  {
    title: "✨ Zážitky",
    tags: [
      { id: "history", label: "📜 Historie" },
      { id: "architecture", label: "🏗️ Architektura" },
      { id: "photography", label: "📸 Fotogenická místa" },
      { id: "art", label: "🎨 Umění & galerie" },
      { id: "music", label: "🎵 Hudba & koncerty" },
      { id: "viewpoints", label: "🌅 Vyhlídky" },
      { id: "markets", label: "🧺 Trhy & bleší trhy" },
      { id: "local", label: "🏘️ Lokální zážitky" },
      { id: "shopping", label: "🛍️ Nákupy" },
    ],
  },
  {
    title: "🧳 Styl cesty",
    tags: [
      { id: "budget", label: "💰 Budget friendly" },
      { id: "luxury", label: "💎 Luxus" },
      { id: "romantic", label: "💕 Romantika" },
      { id: "family", label: "👨‍👩‍👧 S dětmi" },
      { id: "solo", label: "🎒 Sólo" },
      { id: "offbeat", label: "🗺️ Off the beaten path" },
      { id: "relax", label: "🧘 Relax & wellness" },
    ],
  },
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
  const totalNights =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) : 0;

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
              <div>
                <span className="text-xs text-muted-foreground">Datum odjezdu</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-0.5 text-sm", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(parseISO(dateFrom), "d. M. yyyy") : "Vyber datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom ? parseISO(dateFrom) : undefined}
                      onSelect={(d) => d && setDateFrom(format(d, "yyyy-MM-dd"))}
                      locale={cs}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Datum příjezdu</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-0.5 text-sm", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(parseISO(dateTo), "d. M. yyyy") : "Vyber datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo ? parseISO(dateTo) : undefined}
                      onSelect={(d) => d && setDateTo(format(d, "yyyy-MM-dd"))}
                      disabled={(d) => dateFrom ? d < parseISO(dateFrom) : false}
                      locale={cs}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {totalDays > 0 && (
              <p className="text-sm text-muted-foreground mt-2">📅 {totalDays} dní · {totalNights} nocí k plánování</p>
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
              <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
                {interestCategories.map((cat) => (
                  <div key={cat.title}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{cat.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.tags.map((tag) => {
                        const isSelected = selectedInterests.includes(tag.id);
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer select-none transition-all text-xs px-2.5 py-1 ${
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
                ))}
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
