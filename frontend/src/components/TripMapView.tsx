import { Place, priorityConfig } from "@/data/mockData";
import { useRef, useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

interface TripMapViewProps {
  places: Place[];
  onPlaceClick: (placeId: string) => void;
  onAddPlace?: () => void;
  className?: string;
  hideBottomCards?: boolean;
  centerLat?: number | null;
  centerLng?: number | null;
}

/* ─── Route polyline using Maps library ─── */
const RoutePolyline = ({ places }: { places: Place[] }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary("maps");
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    const path = places
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({ lat: p.lat!, lng: p.lng! }));

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (path.length < 2) return;

    polylineRef.current = new mapsLib.Polyline({
      path,
      map,
      strokeColor: "#00798c",
      strokeWeight: 2,
      strokeOpacity: 0.7,
      icons: [
        {
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
          offset: "0",
          repeat: "15px",
        },
      ],
    });

    return () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [map, mapsLib, places]);

  return null;
};

/* ─── Bounds fitter ─── */
const BoundsFitter = ({ places }: { places: Place[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const withCoords = places.filter((p) => p.lat != null && p.lng != null);
    if (withCoords.length === 0) return;

    if (withCoords.length === 1) {
      map.setCenter({ lat: withCoords[0].lat!, lng: withCoords[0].lng! });
      map.setZoom(14);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    withCoords.forEach((p) => bounds.extend({ lat: p.lat!, lng: p.lng! }));
    map.fitBounds(bounds, 60);
  }, [map, places]);

  return null;
};

/* ─── Inner map content ─── */
const MapContent = ({
  places,
  onPlaceClick,
  onAddPlace,
  hideBottomCards,
  centerLat,
  centerLng,
}: Omit<TripMapViewProps, "className">) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveId(null);
  }, [places.length]);

  const handleMarkerClick = (place: Place, index: number) => {
    setActiveId(place.id);
    onPlaceClick(place.id);

    // Scroll bottom strip to show the card
    if (scrollRef.current) {
      const card = scrollRef.current.children[index] as HTMLElement | undefined;
      card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

  return (
    <>
      <Map
        mapId="trip-map"
        defaultZoom={centerLat && centerLng ? 12 : 4}
        defaultCenter={
          centerLat && centerLng
            ? { lat: centerLat, lng: centerLng }
            : { lat: 48.5, lng: 14.5 }
        }
        disableDefaultUI={false}
        gestureHandling="greedy"
        style={{ width: "100%", height: "100%" }}
      >
        <BoundsFitter places={places} />
        <RoutePolyline places={places} />

        {places.map((place, i) => {
          if (place.lat == null || place.lng == null) return null;
          const pCfg = place.priority ? priorityConfig[place.priority] : null;
          const bgColor = pCfg ? pCfg.color : "hsl(var(--primary))";
          const isActive = activeId === place.id;

          return (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => handleMarkerClick(place, i)}
              zIndex={isActive ? 20 : 10}
            >
              <div
                style={{ opacity: place.visited ? 0.5 : 1 }}
                className="flex flex-col items-center cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform ${
                    isActive ? "scale-125 ring-2 ring-white ring-offset-1" : ""
                  }`}
                  style={{ backgroundColor: bgColor }}
                >
                  {place.emoji || i + 1}
                </div>
                <div className="w-0.5 h-2 bg-current opacity-60" style={{ color: bgColor }} />
                <div className="w-1.5 h-1.5 rounded-full opacity-40" style={{ backgroundColor: bgColor }} />
                {isActive && (
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 shadow-lg rounded px-2 py-1 whitespace-nowrap z-30 border border-border">
                    <p className="text-xs font-medium text-foreground">{place.name}</p>
                  </div>
                )}
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Bottom card strip – mobile/tablet */}
      {!hideBottomCards && (places.length > 0 || onAddPlace) && (
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 pointer-events-auto"
          >
            {places.map((place, i) => {
              const pCfg = place.priority ? priorityConfig[place.priority] : null;
              const isActive = activeId === place.id;
              const circleBg = pCfg ? "" : "bg-primary text-primary-foreground";
              const circleStyle = pCfg
                ? { backgroundColor: pCfg.color, color: "white" }
                : undefined;

              return (
                <button
                  key={place.id}
                  className={`flex-shrink-0 bg-card rounded-xl shadow-card w-[130px] text-left transition-all ${
                    place.visited ? "opacity-60" : ""
                  } ${isActive ? "ring-2 ring-primary" : ""}`}
                  onClick={() => handleMarkerClick(place, i)}
                >
                  {pCfg && (
                    <div
                      className="h-1 rounded-t-xl"
                      style={{ backgroundColor: pCfg.color }}
                    />
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${circleBg}`}
                        style={circleStyle}
                      >
                        {i + 1}
                      </span>
                    </div>
                    {place.emoji && (
                      <span className="text-lg block mb-1">{place.emoji}</span>
                    )}
                    <span
                      className={`text-sm font-bold text-foreground block truncate ${
                        place.visited ? "line-through" : ""
                      }`}
                    >
                      {place.name}
                    </span>
                    {place.timeFrom && (
                      <p className="text-xs text-primary mt-1">
                        {place.timeFrom}
                        {place.timeTo ? ` – ${place.timeTo}` : ""}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
            {onAddPlace && (
              <button
                className="flex-shrink-0 bg-card rounded-xl shadow-card w-[130px] flex items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors"
                onClick={onAddPlace}
              >
                <span className="text-3xl text-primary/50 hover:text-primary transition-colors">
                  +
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Public component ─── */
const TripMapView = ({
  places,
  onPlaceClick,
  onAddPlace,
  className = "",
  hideBottomCards = false,
  centerLat,
  centerLng,
}: TripMapViewProps) => {
  return (
    <div className={`relative w-full h-full min-h-0 ${className}`}>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ""}>
        <MapContent
          places={places}
          onPlaceClick={onPlaceClick}
          onAddPlace={onAddPlace}
          hideBottomCards={hideBottomCards}
          centerLat={centerLat}
          centerLng={centerLng}
        />
      </APIProvider>
    </div>
  );
};

export default TripMapView;
