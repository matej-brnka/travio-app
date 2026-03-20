import { useMemo, useState, useEffect } from "react";
import { Place, Trip } from "@/data/mockData";
import { useTripContext } from "@/context/TripContext";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { X, StickyNote } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import MovePlaceModal from "@/components/MovePlaceModal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlaceDetailPanelProps {
  trip: Trip;
  placeId: string;
  onClose: () => void;
  /** Navigate to another place in the panel */
  onNavigatePlace?: (placeId: string) => void;
}

/** Auto-saving note field with debounce */
const NoteField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), 500);
    return () => clearTimeout(t);
  }, [local]);
  return (
    <Textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder="Přidej poznámku k tomuto místu…"
      className="min-h-[80px] text-sm resize-none"
    />
  );
};

const PlaceDetailPanel = ({ trip, placeId, onClose, onNavigatePlace }: PlaceDetailPanelProps) => {
  const { updatePlace, deletePlace, movePlace } = useTripContext();

  const allPlaces = useMemo(() => {
    return [...trip.days.flatMap((d) => d.places), ...trip.unassigned];
  }, [trip]);

  const placeIndex = allPlaces.findIndex((p) => p.id === placeId);
  const place = allPlaces[placeIndex];

  const currentDayInfo = useMemo(() => {
    if (!place) return null;
    for (let i = 0; i < trip.days.length; i++) {
      if (trip.days[i].places.some((p) => p.id === place.id)) {
        return { dayId: trip.days[i].id, dayIndex: i, date: trip.days[i].date };
      }
    }
    return null;
  }, [trip, place]);

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!place) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Místo nenalezeno 😕</p>
      </div>
    );
  }

  const prevPlace = placeIndex > 0 ? allPlaces[placeIndex - 1] : null;
  const nextPlace = placeIndex < allPlaces.length - 1 ? allPlaces[placeIndex + 1] : null;

  const googleMapsUrl = place.address
    ? `https://maps.google.com/?q=${encodeURIComponent(place.address)}`
    : place.lat && place.lng
    ? `https://maps.google.com/?q=${place.lat},${place.lng}`
    : null;

  const handleTicketChange = (ticket: Place["ticket"]) => {
    updatePlace(trip.id, place.id, { ticket });
  };

  const handleVisitedToggle = () => {
    updatePlace(trip.id, place.id, { visited: !place.visited });
  };

  const handleDelete = () => {
    deletePlace(trip.id, place.id);
    toast.success("Místo smazáno 🗑️");
    onClose();
  };

  const navigateTo = (p: Place | null) => {
    if (p && onNavigatePlace) onNavigatePlace(p.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="text-base font-bold text-foreground truncate flex-1 pr-2">{place.name}</h2>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-4">
          {/* Mini map placeholder */}
          <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <span className="text-2xl block">🗺️</span>
              <p className="text-xs mt-1">Mapbox (TODO)</p>
            </div>
          </div>

          {place.address && (
            <p className="text-sm text-foreground">📍 {place.address}</p>
          )}

          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline block"
            >
              🌐 {new URL(place.website).hostname} →
            </a>
          )}

          {place.openingHours && place.openingHours.length > 0 && (
            <div>
              {place.openingHours.map((h, i) => (
                <p key={i} className="text-sm text-muted-foreground">🕘 {h}</p>
              ))}
            </div>
          )}

          {googleMapsUrl && (
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full rounded-md border-primary text-primary py-4">
                🗺️ Navigovat (Google Maps)
              </Button>
            </a>
          )}

          <hr className="border-border" />

          {/* Move to day */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">📅 Zařazení do dne</p>
            <div className="bg-card rounded-lg border border-border p-3">
              <p className="text-sm text-muted-foreground mb-2">
                {currentDayInfo
                  ? `Den ${currentDayInfo.dayIndex + 1} – ${format(parseISO(currentDayInfo.date), "EE d. MMMM", { locale: cs })}`
                  : "⚡ Nezařazené"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-primary text-primary"
                onClick={() => setShowMoveModal(true)}
              >
                Přesunout do jiného dne
              </Button>
            </div>
          </div>

          <hr className="border-border" />

          {/* Ticket */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">🎫 Vstupenka</p>
            <div className="flex gap-2">
              {(["none", "need", "have"] as const).map((t) => (
                <button
                  key={t}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    place.ticket === t || (t === "none" && place.ticket === null)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => handleTicketChange(t)}
                >
                  {t === "none" ? "Není třeba" : t === "need" ? "Potřeba" : "Mám"}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          {/* Visited */}
          <button
            className={`w-full py-3 rounded-lg text-center font-bold text-sm transition-all flex items-center justify-center gap-3 ${
              place.visited
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            onClick={handleVisitedToggle}
          >
            <span
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                place.visited
                  ? "border-primary-foreground bg-primary-foreground/20"
                  : "border-muted-foreground/40"
              }`}
            >
              {place.visited && (
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {place.visited ? "Navštíveno ✨" : "Označit jako navštíveno"}
          </button>

          {/* Note */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">📝 Poznámka</p>
            <NoteField
              value={place.note || ""}
              onChange={(note) => updatePlace(trip.id, place.id, { note })}
            />
          </div>

          <hr className="border-border" />

          {/* Pager */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-md"
              size="sm"
              disabled={!prevPlace}
              onClick={() => navigateTo(prevPlace)}
            >
              ← Předchozí
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-md"
              size="sm"
              disabled={!nextPlace}
              onClick={() => navigateTo(nextPlace)}
            >
              Další →
            </Button>
          </div>

          {/* Delete */}
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-md text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setShowDeleteDialog(true)}
          >
            🗑️ Smazat místo
          </Button>
        </div>
      </ScrollArea>

      {/* Modals */}
      {showMoveModal && (
        <MovePlaceModal
          place={place}
          days={trip.days}
          onClose={() => setShowMoveModal(false)}
          onMove={(dayId) => {
            movePlace(trip.id, place.id, dayId === "unassigned" ? null : dayId);
            toast.success("Přesunuto ✅");
            setShowMoveModal(false);
          }}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chceš smazat {place.name}?</AlertDialogTitle>
            <AlertDialogDescription>Tuto akci nelze vrátit zpět.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              🗑️ Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlaceDetailPanel;
