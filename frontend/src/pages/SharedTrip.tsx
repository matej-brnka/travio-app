import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Trip } from "@/data/mockData";
import { getSharedTrip } from "@/api/trips";
import { format, parseISO, differenceInDays } from "date-fns";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import PlaceCard from "@/components/PlaceCard";
import TripMapView from "@/components/TripMapView";
import { useIsMobile } from "@/hooks/use-mobile";

const SharedTrip = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const viewParam = searchParams.get("view");
  const viewMode =
    viewParam === "list" ? "list" :
    viewParam === "map" ? "map" :
    isMobile ? "map" : "list";

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }
    getSharedTrip(token)
      .then((data) => setTrip(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Načítám cestu…</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-6">
        <div>
          <span className="text-5xl block mb-4">😕</span>
          <h1 className="text-xl font-bold text-foreground mb-2">Tento odkaz není platný</h1>
          <p className="text-muted-foreground text-sm mb-4">Odkaz neexistuje nebo vypršel.</p>
          <Button variant="outline" className="rounded-md" onClick={() => navigate("/")}>
            Zpět na úvod
          </Button>
        </div>
      </div>
    );
  }

  const isUnassigned = selectedDayIndex === trip.days.length;
  const currentDay = isUnassigned ? null : trip.days[selectedDayIndex];
  const currentPlaces = isUnassigned ? trip.unassigned : currentDay?.places || [];
  const totalDays = differenceInDays(parseISO(trip.dateTo), parseISO(trip.dateFrom)) + 1;
  const totalNights = totalDays > 1 ? totalDays - 1 : 0;

  const toggleView = (view: "list" | "map") => setSearchParams({ view });

  /* ─── Read-only banner ─── */
  const readOnlyBanner = (
    <div className="bg-primary/10 px-4 py-1.5 text-center flex-shrink-0">
      <p className="text-xs text-primary font-medium">
        👁️ Sdílená cesta – pouze čtení
      </p>
    </div>
  );

  /* ─── Day pills ─── */
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
          {day.places.length > 0 && (
            <span className="ml-1 opacity-50 font-normal">({day.places.length})</span>
          )}
        </button>
      ))}
      {trip.unassigned.length > 0 && (
        <button
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isUnassigned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
          onClick={() => setSelectedDayIndex(trip.days.length)}
        >
          ⚡ Volné
          <span className="ml-1 opacity-50 font-normal">({trip.unassigned.length})</span>
        </button>
      )}
    </div>
  );

  /* ─── Places list ─── */
  const placesList = (
    <>
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
    </>
  );

  /* ─── CTA ─── */
  const cta = (
    <div className="bg-card border-t border-border p-4 text-center flex-shrink-0">
      <p className="text-sm text-muted-foreground mb-2">Chceš plánovat vlastní výlet?</p>
      <Button
        className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
        onClick={() => navigate("/")}
      >
        🚀 Vyzkoušej Travio zdarma
      </Button>
    </div>
  );

  const mapNode = !import.meta.env.VITE_GOOGLE_MAPS_KEY ? (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Google Maps klíč není nastaven
    </div>
  ) : (
    <TripMapView
      places={currentPlaces}
      onPlaceClick={() => {}}
      className="h-full"
      hideBottomCards
      centerLat={trip.centerLat}
      centerLng={trip.centerLng}
    />
  );

  return (
    <div className={`bg-background ${viewMode === "map" ? "h-screen flex flex-col overflow-hidden lg:block lg:h-auto lg:overflow-auto lg:min-h-screen" : "min-h-screen"}`}>

      {/* ══ MOBILE ══ */}
      <div className="lg:hidden flex flex-col h-full">
        {readOnlyBanner}

        {/* Mobile top bar */}
        <div className="flex items-center px-4 py-3 bg-card shadow-sm flex-shrink-0">
          <div className="flex-1 text-center min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {trip.emoji} {trip.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(trip.dateFrom), "d. M.", { locale: cs })} –{" "}
              {format(parseISO(trip.dateTo), "d. M. yyyy", { locale: cs })} • {totalDays} dní · {totalNights} nocí
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 px-4 pt-3 flex-shrink-0">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            onClick={() => toggleView("map")}
          >
            🗺️ Mapa
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            onClick={() => toggleView("list")}
          >
            📋 Seznam
          </button>
        </div>

        <div className="px-4 py-2 flex-shrink-0">{dayPills}</div>

        {viewMode === "map" ? (
          <div className="flex-1 min-h-0 relative">
            {!import.meta.env.VITE_GOOGLE_MAPS_KEY ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Google Maps klíč není nastaven
              </div>
            ) : (
              <TripMapView
                places={currentPlaces}
                onPlaceClick={() => {}}
                className="w-full h-full"
                centerLat={trip.centerLat}
                centerLng={trip.centerLng}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-4">{placesList}</div>
        )}

        {cta}
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden lg:flex flex-col h-screen">
        {readOnlyBanner}

        {/* Desktop top bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
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
                  {format(parseISO(trip.dateTo), "d. MMMM yyyy", { locale: cs })} · {totalDays} dní · {totalNights} nocí
                </p>
              </div>
            </div>
          </div>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
            onClick={() => navigate("/")}
          >
            🚀 Vyzkoušej Travio zdarma
          </Button>
        </header>

        {/* Desktop body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-[360px] flex-shrink-0 border-r border-border flex flex-col bg-card/50">
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
                      <span className={`ml-auto float-right text-xs px-1.5 py-0.5 rounded-full ${selectedDayIndex === i ? "bg-primary-foreground/20" : "bg-muted"}`}>
                        {day.places.length}
                      </span>
                    )}
                  </button>
                ))}
                {trip.unassigned.length > 0 && (
                  <button
                    className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      isUnassigned ? "bg-primary text-primary-foreground font-medium" : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setSelectedDayIndex(trip.days.length)}
                  >
                    ⚡ Nezařazená místa
                    <span className={`ml-auto float-right text-xs px-1.5 py-0.5 rounded-full ${isUnassigned ? "bg-primary-foreground/20" : "bg-muted"}`}>
                      {trip.unassigned.length}
                    </span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{placesList}</div>
          </aside>

          {/* Map */}
          <main className="flex-1 relative">{mapNode}</main>
        </div>
      </div>
    </div>
  );
};

export default SharedTrip;
