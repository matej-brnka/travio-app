import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Place } from "@/data/mockData";
import { useTripContext } from "@/context/TripContext";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical } from "lucide-react";
import PlaceCard from "@/components/PlaceCard";
import AddPlaceSheet from "@/components/AddPlaceSheet";
import MovePlaceModal from "@/components/MovePlaceModal";
import TripMapView from "@/components/TripMapView";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get("view") === "map" ? "map" : "list";
  const { getTrip, addPlaceToDay, movePlace, reorderPlaces } = useTripContext();

  const trip = getTrip(id || "");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [movingPlace, setMovingPlace] = useState<Place | null>(null);

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

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    reorderPlaces(trip.id, currentDayId, index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentPlaces.length - 1) return;
    reorderPlaces(trip.id, currentDayId, index, index + 1);
  };

  /* Shared sub-components */
  const dayPills = (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {trip.days.map((day, i) => (
        <button
          key={day.id}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedDayIndex === i
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setSelectedDayIndex(i)}
        >
          Den {i + 1}
        </button>
      ))}
      <button
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isUnassigned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
        onClick={() => setSelectedDayIndex(trip.days.length)}
      >
        ⚡ Volné
      </button>
    </div>
  );

  const placesList = (
    <div className="pb-24 lg:pb-4">
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
              onClick={() => navigate(`/app/trip/${id}/place/${place.id}`)}
              onMove={() => setMovingPlace(place)}
              onMoveUp={index > 0 ? () => handleMoveUp(index) : undefined}
              onMoveDown={index < currentPlaces.length - 1 ? () => handleMoveDown(index) : undefined}
            />
          ))}
        </div>
      )}

      {currentPlaces.length > 0 && (
        <Button
          variant="outline"
          className="w-full mt-4 border-primary text-primary rounded-md py-5"
          onClick={() => setShowAddPlace(true)}
        >
          + Přidat místo do dne
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card shadow-sm">
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
            <button className="p-1 text-foreground">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Upravit cestu</DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>🔗 Sdílet odkaz</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">🗑️ Smazat cestu</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* MOBILE: toggle + pills + content */}
      <div className="lg:hidden">
        {/* View toggle */}
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

        <div className="px-4 py-3">{dayPills}</div>

        {viewMode === "map" ? (
          <TripMapView
            places={currentPlaces}
            onPlaceClick={(placeId) => navigate(`/app/trip/${id}/place/${placeId}`)}
          />
        ) : (
          <div className="px-4">{placesList}</div>
        )}
      </div>

      {/* DESKTOP: side-by-side list + map */}
      <div className="hidden lg:flex gap-0" style={{ height: "calc(100vh - 70px)" }}>
        {/* Left panel: list */}
        <div className="w-[380px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="px-4 py-3">{dayPills}</div>
          <div className="flex-1 overflow-y-auto px-4">{placesList}</div>
        </div>
        {/* Right panel: map */}
        <div className="flex-1 relative">
          <TripMapView
            places={currentPlaces}
            onPlaceClick={(placeId) => navigate(`/app/trip/${id}/place/${placeId}`)}
            className="h-full"
          />
        </div>
      </div>

      <AddPlaceSheet open={showAddPlace} onClose={() => setShowAddPlace(false)} onAdd={handleAddPlace} />

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
