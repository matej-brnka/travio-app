import { useState } from "react";
import { Trip, TripDestination } from "@/data/mockData";
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
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/EmojiPicker";
import DestinationInput from "@/components/DestinationInput";

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
  onCreate: (trip: Trip & { useAi?: boolean }) => Promise<void>;
}

const emptyDest = (): TripDestination => ({ name: "", lat: null, lng: null });

const NewTripModal = ({ open, onClose, onCreate }: NewTripModalProps) => {
  const [destinations, setDestinations] = useState<TripDestination[]>([emptyDest()]);
  const [title, setTitle] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [emoji, setEmoji] = useState("✈️");
  const [dateTo, setDateTo] = useState("");
  const [aiHelp, setAiHelp] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // +1 to include the last day
  const totalDays =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) + 1 : 0;
  const totalNights =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) : 0;

  const isValid = destinations[0]?.name.trim() && dateFrom && dateTo && totalDays > 0;

  const updateDest = (i: number, v: TripDestination) =>
    setDestinations((prev) => prev.map((d, idx) => (idx === i ? v : d)));
  const removeDest = (i: number) =>
    setDestinations((prev) => prev.filter((_, idx) => idx !== i));

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!isValid || creating) return;
    const primary = destinations[0];
    const days = Array.from({ length: totalDays }, (_, i) => ({
      id: `new-day-${i}`,
      date: format(addDays(parseISO(dateFrom), i), "yyyy-MM-dd"),
      places: [],
    }));
    const trip: Trip & { useAi?: boolean } = {
      id: `trip-${Date.now()}`,
      name: primary.name,
      title: title.trim() || null,
      emoji,
      dateFrom,
      dateTo,
      weather: { temp: 20, icon: "🌤️" },
      days,
      unassigned: [],
      interests: aiHelp ? selectedInterests : undefined,
      centerLat: primary.lat,
      centerLng: primary.lng,
      viewportNorth: primary.viewportNorth ?? null,
      viewportSouth: primary.viewportSouth ?? null,
      viewportEast: primary.viewportEast ?? null,
      viewportWest: primary.viewportWest ?? null,
      destinations,
      useAi: aiHelp,
    };
    setCreating(true);
    try {
      console.log("[AI TRIP] Creating trip payload", {
        useAi: trip.useAi,
        name: trip.name,
        dateFrom: trip.dateFrom,
        dateTo: trip.dateTo,
        interests: trip.interests ?? [],
      });
      await onCreate(trip);
      console.log("[AI TRIP] Trip creation completed");
      setDestinations([emptyDest()]);
      setTitle("");
      setDateFrom("");
      setDateTo("");
      setAiHelp(false);
      setEmoji("✈️");
      setSelectedInterests([]);
      setCalendarOpen(false);
    } finally {
      setCreating(false);
    }
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

          <div>
            <Label className="text-foreground text-sm">Název výletu <span className="text-muted-foreground text-xs">(nepovinné)</span></Label>
            <Input
              placeholder="Např. Líbánky v Paříži"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-foreground text-sm">Destinace</Label>
            <div className="mt-1 space-y-2">
              {destinations.map((dest, i) => (
                <DestinationInput
                  key={i}
                  value={dest}
                  onChange={(v) => updateDest(i, v)}
                  onRemove={i > 0 ? () => removeDest(i) : undefined}
                  placeholder={i === 0 ? "🔍 Kam chceš jet?" : "🔍 Další destinace..."}
                />
              ))}
              <button
                type="button"
                onClick={() => setDestinations((prev) => [...prev, emptyDest()])}
                className="text-xs text-primary hover:underline"
              >
                + Přidat další destinaci
              </button>
            </div>
          </div>

          <div>
            <Label className="text-foreground text-sm">Datum cesty</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal mt-1 text-sm", !dateFrom && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom && dateTo
                    ? `${format(parseISO(dateFrom), "d. M. yyyy")} – ${format(parseISO(dateTo), "d. M. yyyy")}`
                    : dateFrom
                    ? `${format(parseISO(dateFrom), "d. M. yyyy")} – vyber konec`
                    : "Vyber termín cesty"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateFrom ? parseISO(dateFrom) : undefined,
                    to: dateTo ? parseISO(dateTo) : undefined,
                  }}
                  onSelect={(range: DateRange | undefined) => {
                    setDateFrom(range?.from ? format(range.from, "yyyy-MM-dd") : "");
                    setDateTo(range?.to ? format(range.to, "yyyy-MM-dd") : "");
                    if (range?.from && range?.to) setCalendarOpen(false);
                  }}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  locale={cs}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
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
              disabled={!isValid || creating}
            >
              {creating ? "Vytvářím..." : "✅ Vytvořit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTripModal;
