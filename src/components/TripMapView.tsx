import { Place } from "@/data/mockData";
import { useRef, useState } from "react";

interface TripMapViewProps {
  places: Place[];
  onPlaceClick: (placeId: string) => void;
}

const TripMapView = ({ places, onPlaceClick }: TripMapViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const placesWithCoords = places.filter((p) => p.lat && p.lng);

  return (
    <div className="relative flex-1" style={{ minHeight: "50vh" }}>
      {/* Mock map background */}
      <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <span className="text-5xl block mb-2">🗺️</span>
          <p className="text-sm">Mapbox mapa</p>
          <p className="text-xs">(TODO: napojit Mapbox GL JS)</p>

          {/* Mock pins */}
          <div className="flex gap-4 mt-6 justify-center flex-wrap px-4">
            {placesWithCoords.map((place, i) => (
              <button
                key={place.id}
                className={`w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md ${
                  activeIndex === i ? "ring-2 ring-accent ring-offset-2" : ""
                }`}
                onClick={() => {
                  setActiveIndex(i);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom card strip */}
      {placesWithCoords.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
          >
            {placesWithCoords.map((place, i) => (
              <button
                key={place.id}
                className={`flex-shrink-0 bg-card rounded-lg shadow-card p-3 min-w-[200px] text-left transition-all ${
                  activeIndex === i
                    ? "border-2 border-primary"
                    : "border border-transparent"
                }`}
                onClick={() => {
                  setActiveIndex(i);
                  onPlaceClick(place.id);
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-foreground truncate">
                    {place.name}
                  </span>
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
