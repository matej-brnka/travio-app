import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Place } from "@/data/mockData";
import { useTripContext } from "@/context/TripContext";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import MovePlaceModal from "@/components/MovePlaceModal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const PlaceDetail = () => {
  const { id, placeId } = useParams();
  const navigate = useNavigate();
  const { getTrip, updatePlace, deletePlace, movePlace } = useTripContext();

  const trip = getTrip(id || "");

  const allPlaces = useMemo(() => {
    if (!trip) return [];
    return [...trip.days.flatMap((d) => d.places), ...trip.unassigned];
  }, [trip]);

  const placeIndex = allPlaces.findIndex((p) => p.id === placeId);
  const place = allPlaces[placeIndex];

  // Find which day this place belongs to
  const currentDayInfo = useMemo(() => {
    if (!trip || !place) return null;
    for (let i = 0; i < trip.days.length; i++) {
      if (trip.days[i].places.some((p) => p.id === place.id)) {
        return { dayId: trip.days[i].id, dayIndex: i, date: trip.days[i].date };
      }
    }
    return null; // unassigned
  }, [trip, place]);

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!trip || !place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Místo nenalezeno 😕</p>
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
    navigate(`/app/trip/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card shadow-sm">
        <button onClick={() => navigate(`/app/trip/${id}`)} className="p-1 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground truncate flex-1 text-center px-2">
          {place.name}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-foreground">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              🗑️ Smazat místo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-5 pb-24">
        {/* Mini map placeholder */}
        <div className="bg-muted rounded-lg h-40 flex items-center justify-center mt-4 mb-5">
          <div className="text-center text-muted-foreground">
            <span className="text-3xl block">🗺️</span>
            <p className="text-xs mt-1">Mapbox static (TODO)</p>
          </div>
        </div>

        {place.address && (
          <p className="text-sm text-foreground mb-3">📍 {place.address}</p>
        )}

        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline mb-3 block"
          >
            🌐 {new URL(place.website).hostname} →
          </a>
        )}

        {place.openingHours && place.openingHours.length > 0 && (
          <div className="mb-5">
            {place.openingHours.map((h, i) => (
              <p key={i} className="text-sm text-muted-foreground">🕘 {h}</p>
            ))}
          </div>
        )}

        <hr className="border-border my-5" />

        {/* Move to day - INLINE */}
        <div className="mb-5">
          <p className="text-sm font-bold text-foreground mb-3">📅 Zařazení do dne</p>
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

        <hr className="border-border my-5" />

        {/* Ticket */}
        <div className="mb-5">
          <p className="text-sm font-bold text-foreground mb-3">🎫 Vstupenka</p>
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

        <hr className="border-border my-5" />

        {/* Visited */}
        <button
          className={`w-full py-4 rounded-lg text-center font-bold text-sm transition-all flex items-center justify-center gap-3 ${
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

        <hr className="border-border my-5" />

        {/* Pager */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-md"
            disabled={!prevPlace}
            onClick={() => prevPlace && navigate(`/app/trip/${id}/place/${prevPlace.id}`)}
          >
            ← Předchozí
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-md"
            disabled={!nextPlace}
            onClick={() => nextPlace && navigate(`/app/trip/${id}/place/${nextPlace.id}`)}
          >
            Další →
          </Button>
        </div>

        {googleMapsUrl && (
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
            <Button variant="outline" className="w-full rounded-md border-primary text-primary py-5">
              🗺️ Navigovat (Google Maps)
            </Button>
          </a>
        )}
      </div>

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
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět.
            </AlertDialogDescription>
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

export default PlaceDetail;
