import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { mockTrips, Place } from "@/data/mockData";
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

  const trip = useMemo(() => mockTrips.find((t) => t.id === id), [id]);
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
  const currentPlaces = isUnassigned
    ? trip.unassigned
    : currentDay?.places || [];

  const totalDays = trip.days.length;

  const toggleView = (view: "list" | "map") => {
    if (view === "map") {
      setSearchParams({ view: "map" });
    } else {
      setSearchParams({});
    }
  };

  const handleShare = () => {
    toast.success("Odkaz zkopírován! 🎉", {
      description: "https://travio.app/share/abc123",
    });
  };

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

      {/* View toggle */}
      <div className="flex gap-2 px-4 pt-3">
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => toggleView("list")}
        >
          📋 Seznam
        </button>
        <button
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "map"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => toggleView("map")}
        >
          🗺️ Mapa
        </button>
      </div>

      {/* Day pills */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
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
            isUnassigned
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setSelectedDayIndex(trip.days.length)}
        >
          ⚡ Volné
        </button>
      </div>

      {viewMode === "map" ? (
        <TripMapView
          places={currentPlaces}
          onPlaceClick={(placeId) => navigate(`/app/trip/${id}/place/${placeId}`)}
        />
      ) : (
        <div className="px-4 pb-24">
          {/* Day date */}
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

          {/* Places */}
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
              {currentPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onClick={() => navigate(`/app/trip/${id}/place/${place.id}`)}
                  onMove={() => setMovingPlace(place)}
                />
              ))}
            </div>
          )}

          {/* Add place button */}
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
      )}

      <AddPlaceSheet
        open={showAddPlace}
        onClose={() => setShowAddPlace(false)}
        onAdd={() => {
          setShowAddPlace(false);
          toast.success("Místo přidáno! 📍");
        }}
      />

      {movingPlace && trip && (
        <MovePlaceModal
          place={movingPlace}
          days={trip.days}
          onClose={() => setMovingPlace(null)}
          onMove={(dayId) => {
            toast.success(`Přesunuto do ${dayId === "unassigned" ? "Volných" : "dne"} ✅`);
            setMovingPlace(null);
          }}
        />
      )}
    </div>
  );
};

export default TripDetail;
