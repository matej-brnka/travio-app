import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Place } from "@/data/mockData";
import { useTripContext } from "@/context/TripContext";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Share2, Trash2, Pencil, Plus } from "lucide-react";
import PlaceCard from "@/components/PlaceCard";
import AddPlaceSheet from "@/components/AddPlaceSheet";
import MovePlaceModal from "@/components/MovePlaceModal";
import EditTripModal from "@/components/EditTripModal";
import TripMapView from "@/components/TripMapView";
import PlaceDetailPanel from "@/components/PlaceDetailPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion } from "framer-motion";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get("view") === "map" ? "map" : "list";
  const { getTrip, addPlaceToDay, movePlace, reorderPlaces, updateTrip } = useTripContext();

  const trip = getTrip(id || "");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [movingPlace, setMovingPlace] = useState<Place | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cesta nenalezena 😕</p>
      </div>
    );
  }

  const isUnassigned = selectedDayIndex === trip.days.length;
  const currentDay = isUnassigned ? null : trip.days[selectedDayIndex];
  const currentPlaces = isUnassigned ? trip.unassigned : currentDay?.places || [];
  const totalDays = trip.days.length;
  const currentDayId = isUnassigned ? null : currentDay?.id || null;

  const toggleView = (view: "list" | "map") => {
    if (view === "map") setSearchParams({ view: "map" });
    else setSearchParams({});
  };

  const handleShare = () => {
    toast.success("Odkaz zkopírován! 🎉", { description: "https://travio.app/share/abc123" });
  };

  const handleAddPlace = (name: string, address?: string) => {
    const newPlace: Place = {
      id: `place-${Date.now()}`,
      name,
      address,
      visited: false,
      ticket: null,
    };
    addPlaceToDay(trip.id, currentDayId, newPlace);
    setShowAddPlace(false);
    toast.success("Místo přidáno! 📍");
  };

  const handlePlaceClick = (placeId: string) => {
    if (isMobile) {
      navigate(`/app/trip/${id}/place/${placeId}`);
    } else {
      setSelectedPlaceId(placeId);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    reorderPlaces(trip.id, currentDayId, index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentPlaces.length - 1) return;
    reorderPlaces(trip.id, currentDayId, index, index + 1);
  };

  /* ─── Day pills (shared) ─── */
  const dayPills = (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {trip.days.map((day, i) => (
        <button
          key={day.id}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedDayIndex === i
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setSelectedDayIndex(i)}
        >
          Den {i + 1}
        </button>
      ))}
      <button
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isUnassigned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        onClick={() => setSelectedDayIndex(trip.days.length)}
      >
        ⚡ Volné
      </button>
    </div>
  );

  /* ─── Places list content (shared) ─── */
  const placesListContent = (
    <>
      {currentDay && (
        <p className="text-sm text-muted-foreground mb-3">
          📅 {format(parseISO(currentDay.date), "EEEE d. MMMM", { locale: cs })}
        </p>
      )}
      {isUnassigned && (
        <p className="text-xs text-muted-foreground mb-3">
          Sem přidávej místa, která ještě nejsou v žádném dni 📌
        </p>
      )}

      {currentPlaces.length === 0 ? (
        <motion.div
          className="bg-card rounded-lg shadow-card p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-3xl block mb-3">📍</span>
          <p className="text-foreground font-bold mb-1">
            {isUnassigned ? "Žádná volná místa" : "Tento den je zatím prázdný"}
          </p>
          <Button
            variant="outline"
            className="mt-3 border-primary text-primary rounded-md"
            onClick={() => setShowAddPlace(true)}
          >
            + Přidat {isUnassigned ? "místo" : "první místo"}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {currentPlaces.map((place, index) => (
            <PlaceCard
              key={place.id}
              place={place}
              onClick={() => handlePlaceClick(place.id)}
              onMove={() => setMovingPlace(place)}
              onMoveUp={index > 0 ? () => handleMoveUp(index) : undefined}
              onMoveDown={index < currentPlaces.length - 1 ? () => handleMoveDown(index) : undefined}
            />
          ))}
        </div>
      )}

      <Button
        variant="outline"
        className="w-full mt-4 border-primary text-primary rounded-md py-5 lg:py-3"
        onClick={() => setShowAddPlace(true)}
      >
        <Plus className="w-4 h-4 mr-1" /> Přidat místo
      </Button>
    </>
  );

  return (
    <div className={`bg-background ${viewMode === "map" ? "h-screen flex flex-col lg:block lg:h-auto lg:min-h-screen" : "min-h-screen"}`}>

      {/* ══════════════════════════════════════════
          MOBILE TOP BAR
         ══════════════════════════════════════════ */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card shadow-sm">
        <button onClick={() => navigate("/app")} className="p-1 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1 min-w-0 px-2">
          <h1 className="text-lg font-bold text-foreground truncate">
            {trip.emoji} {trip.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(trip.dateFrom), "d. M.", { locale: cs })} –{" "}
            {format(parseISO(trip.dateTo), "d. M. yyyy", { locale: cs })} • {totalDays} dní
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-foreground"><MoreVertical className="w-5 h-5" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowEditTrip(true)}>Upravit cestu</DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>🔗 Sdílet odkaz</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">🗑️ Smazat cestu</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE CONTENT
         ══════════════════════════════════════════ */}
      <div className={`lg:hidden ${viewMode === "map" ? "flex flex-col flex-1" : ""}`}>
        <div className="flex gap-2 px-4 pt-3">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => toggleView("list")}
          >
            📋 Seznam
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => toggleView("map")}
          >
            🗺️ Mapa
          </button>
        </div>
        <div className="px-4 py-2">{dayPills}</div>
        {viewMode === "map" ? (
          <div className="flex-1 relative">
            <TripMapView
              places={currentPlaces}
              onPlaceClick={handlePlaceClick}
              className="absolute inset-0"
            />
          </div>
        ) : (
          <div className="px-4 pb-24">{placesListContent}</div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LAYOUT
         ══════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col h-screen">
        {/* Desktop top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/app")}
              className="text-sm text-primary hover:underline font-medium"
            >
              ✈️ Travio
            </button>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{trip.emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-foreground">{trip.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(trip.dateFrom), "d. MMMM", { locale: cs })} –{" "}
                  {format(parseISO(trip.dateTo), "d. MMMM yyyy", { locale: cs })} · {totalDays} dní
                </p>
              </div>
            </div>
          </div>

          {/* Desktop action buttons – all visible */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-md" onClick={() => setShowEditTrip(true)}>
              <Pencil className="w-4 h-4 mr-1.5" />
              Upravit
            </Button>
            <Button variant="outline" size="sm" className="rounded-md" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1.5" />
              Sdílet
            </Button>
            <Button variant="outline" size="sm" className="rounded-md text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Smazat
            </Button>
          </div>
        </header>

        {/* Desktop body: sidebar + map */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar: day navigation + place list */}
          <aside className="w-[360px] flex-shrink-0 border-r border-border flex flex-col bg-card/50">
            {/* Day tabs – vertical list */}
            <div className="px-4 py-4 border-b border-border">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Dny cesty
              </h2>
              <div className="flex flex-col gap-1">
                {trip.days.map((day, i) => (
                  <button
                    key={day.id}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedDayIndex === i
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setSelectedDayIndex(i)}
                  >
                    <span className="font-medium">Den {i + 1}</span>
                    <span className={`ml-2 text-xs ${selectedDayIndex === i ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {format(parseISO(day.date), "EE d. M.", { locale: cs })}
                    </span>
                    {day.places.length > 0 && (
                      <span className={`ml-auto float-right text-xs px-1.5 py-0.5 rounded-full ${
                        selectedDayIndex === i ? "bg-primary-foreground/20" : "bg-muted"
                      }`}>
                        {day.places.length}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    isUnassigned
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSelectedDayIndex(trip.days.length)}
                >
                  ⚡ Nezařazená místa
                  {trip.unassigned.length > 0 && (
                    <span className={`ml-auto float-right text-xs px-1.5 py-0.5 rounded-full ${
                      isUnassigned ? "bg-primary-foreground/20" : "bg-muted"
                    }`}>
                      {trip.unassigned.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Place list for selected day */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {placesListContent}
            </div>
          </aside>

          {/* Right: full map */}
          <main className="flex-1 relative">
            <TripMapView
              places={currentPlaces}
              onPlaceClick={(placeId) => navigate(`/app/trip/${id}/place/${placeId}`)}
              className="h-full"
              hideBottomCards
            />
          </main>
        </div>
      </div>

      {/* Modals (shared) */}
      <AddPlaceSheet open={showAddPlace} onClose={() => setShowAddPlace(false)} onAdd={handleAddPlace} />

      {trip && (
        <EditTripModal
          open={showEditTrip}
          trip={trip}
          onClose={() => setShowEditTrip(false)}
          onSave={(updates) => {
            updateTrip(trip.id, updates);
            setShowEditTrip(false);
            toast.success("Cesta upravena ✅");
          }}
        />
      )}

      {movingPlace && trip && (
        <MovePlaceModal
          place={movingPlace}
          days={trip.days}
          onClose={() => setMovingPlace(null)}
          onMove={(dayId) => {
            movePlace(trip.id, movingPlace.id, dayId === "unassigned" ? null : dayId);
            toast.success("Přesunuto ✅");
            setMovingPlace(null);
          }}
        />
      )}
    </div>
  );
};

export default TripDetail;
