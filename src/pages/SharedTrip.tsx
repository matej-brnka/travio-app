import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockTrips } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import PlaceCard from "@/components/PlaceCard";
import { Button } from "@/components/ui/button";

const SharedTrip = () => {
  const navigate = useNavigate();
  // Mock: always show trip-1
  const trip = useMemo(() => mockTrips[0], []);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-6">
        <div>
          <span className="text-5xl block mb-4">😕</span>
          <h1 className="text-xl font-bold text-foreground mb-2">Tento odkaz není platný</h1>
          <p className="text-muted-foreground text-sm">Odkaz neexistuje nebo vypršel.</p>
        </div>
      </div>
    );
  }

  const isUnassigned = selectedDayIndex === trip.days.length;
  const currentDay = isUnassigned ? null : trip.days[selectedDayIndex];
  const currentPlaces = isUnassigned ? trip.unassigned : currentDay?.places || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="bg-primary/10 px-4 py-2 text-center">
        <p className="text-sm text-primary font-medium">
          👁️ Prohlížíš sdílenou cestu (pouze čtení)
        </p>
      </div>

      {/* Header */}
      <div className="px-4 py-4 bg-card shadow-sm text-center">
        <h1 className="text-xl font-bold text-foreground">
          {trip.emoji} {trip.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(trip.dateFrom), "d. M.", { locale: cs })} –{" "}
          {format(parseISO(trip.dateTo), "d. M. yyyy", { locale: cs })}
        </p>
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

      <div className="px-4 pb-24">
        {currentDay && (
          <p className="text-sm text-muted-foreground mb-3">
            📅 {format(parseISO(currentDay.date), "EEEE d. MMMM", { locale: cs })}
          </p>
        )}

        {currentPlaces.length === 0 ? (
          <div className="bg-card rounded-lg shadow-card p-8 text-center">
            <span className="text-3xl block mb-3">📍</span>
            <p className="text-muted-foreground text-sm">Tento den je prázdný</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onClick={() => {}} readOnly />
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Chceš plánovat vlastní výlet?
        </p>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
          onClick={() => navigate("/")}
        >
          🚀 Vyzkoušej Travio zdarma
        </Button>
      </div>
    </div>
  );
};

export default SharedTrip;
