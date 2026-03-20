import { Place } from "@/data/mockData";
import { useRef, useState, useEffect } from "react";

interface TripMapViewProps {
  places: Place[];
  onPlaceClick: (placeId: string) => void;
  className?: string;
  /** Hide the bottom card strip (used on desktop where list is visible alongside) */
  hideBottomCards?: boolean;
  /** Externally controlled active pin index */
  activePin?: number;
  onPinClick?: (index: number) => void;
}

const TripMapView = ({
  places,
  onPlaceClick,
  className = "",
  hideBottomCards = false,
  activePin,
  onPinClick,
}: TripMapViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [internalActive, setInternalActive] = useState(0);
  const activeIndex = activePin ?? internalActive;

  useEffect(() => {
    setInternalActive(0);
  }, [places.length]);

  const handlePinClick = (i: number) => {
    setInternalActive(i);
    onPinClick?.(i);
  };

  return (
    <div className={`relative flex-1 ${className}`} style={{ minHeight: "50vh" }}>
      <div className="absolute inset-0 bg-muted flex items-center justify-center rounded-lg overflow-hidden">
        <div className="text-center text-muted-foreground">
          <span className="text-5xl block mb-2">🗺️</span>
          <p className="text-sm">Mapbox mapa</p>
          <p className="text-xs">(TODO: napojit Mapbox GL JS)</p>

          {places.length > 0 && (
            <div className="flex gap-3 mt-6 justify-center flex-wrap px-4">
              {places.map((place, i) => (
                <button
                  key={place.id}
                  className={`w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md transition-transform ${
                    activeIndex === i ? "ring-2 ring-accent ring-offset-2 scale-110" : ""
                  }`}
                  onClick={() => handlePinClick(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {places.length === 0 && (
            <p className="text-xs mt-4">Žádná místa k zobrazení</p>
          )}
        </div>
      </div>

      {/* Bottom card strip – mobile only */}
      {!hideBottomCards && places.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {places.map((place, i) => (
              <button
                key={place.id}
                className={`flex-shrink-0 bg-card rounded-lg shadow-card p-3 min-w-[180px] text-left transition-all ${
                  activeIndex === i ? "border-2 border-primary" : "border border-transparent"
                }`}
                onClick={() => {
                  handlePinClick(i);
                  onPlaceClick(place.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground truncate">{place.name}</span>
                </div>
                {place.address && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{place.address}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMapView;
