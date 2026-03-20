import { Place, priorityConfig } from "@/data/mockData";
import { useRef, useState, useEffect } from "react";

interface TripMapViewProps {
  places: Place[];
  onPlaceClick: (placeId: string) => void;
  className?: string;
  hideBottomCards?: boolean;
}

const TripMapView = ({
  places,
  onPlaceClick,
  className = "",
  hideBottomCards = false,
}: TripMapViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [places.length]);

  return (
    <div className={`relative w-full h-full min-h-0 ${className}`}>
      {/* Mock map – will be replaced by Mapbox GL JS */}
      <div className="absolute inset-0 bg-[hsl(var(--muted))] flex items-center justify-center rounded-lg overflow-hidden">
        {places.length > 0 ? (
          <div className="w-full h-full relative">
            {/* Simulated map area with route line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-xs absolute top-3 right-3 bg-card/80 px-2 py-1 rounded text-[10px]">
                TODO: Mapbox GL JS
              </p>

              {/* Simulated pins placed in a pattern */}
              <div className="relative w-full h-full">
                {places.map((place, i) => {
                  // Distribute pins in a pattern across the map area
                  const angle = (i / Math.max(places.length, 1)) * Math.PI * 1.2 - 0.3;
                  const radiusX = 25 + (i % 2) * 8;
                  const radiusY = 20 + (i % 3) * 5;
                  const left = 50 + Math.cos(angle) * radiusX;
                  const top = 50 + Math.sin(angle) * radiusY;

                  return (
                    <button
                      key={place.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-full transition-all ${
                        activeIndex === i ? "z-20 scale-110" : "z-10"
                      }`}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      onClick={() => {
                        setActiveIndex(i);
                        onPlaceClick(place.id);
                      }}
                    >
                      {/* Pin shape */}
                        <div
                          className={`flex flex-col items-center ${
                            activeIndex === i ? "text-accent" : "text-primary"
                          }`}
                        >
                          {(() => {
                            const pCfg = place.priority ? priorityConfig[place.priority] : null;
                            const pinBg = activeIndex === i
                              ? "bg-accent text-accent-foreground ring-2 ring-accent/30 ring-offset-1"
                              : pCfg
                              ? ""
                              : "bg-primary text-primary-foreground";
                            const pinStyle = (!activeIndex || activeIndex !== i) && pCfg
                              ? { backgroundColor: pCfg.color, color: "white" }
                              : undefined;
                            return (
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${pinBg}`}
                                style={pinStyle}
                              >
                                {i + 1}
                              </div>
                            );
                          })()}
                          <div className="w-0.5 h-2 bg-current" />
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                        </div>
                      {/* Label on hover / active */}
                      {activeIndex === i && (
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-card shadow-card rounded px-2 py-1 whitespace-nowrap z-30">
                          <p className="text-xs font-medium text-foreground">{place.name}</p>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Dashed route line connecting pins (SVG overlay) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {places.length > 1 &&
                    places.slice(0, -1).map((_, i) => {
                      const a1 = (i / Math.max(places.length, 1)) * Math.PI * 1.2 - 0.3;
                      const a2 = ((i + 1) / Math.max(places.length, 1)) * Math.PI * 1.2 - 0.3;
                      const r1x = 25 + (i % 2) * 8;
                      const r1y = 20 + (i % 3) * 5;
                      const r2x = 25 + ((i + 1) % 2) * 8;
                      const r2y = 20 + ((i + 1) % 3) * 5;
                      return (
                        <line
                          key={i}
                          x1={`${50 + Math.cos(a1) * r1x}%`}
                          y1={`${50 + Math.sin(a1) * r1y}%`}
                          x2={`${50 + Math.cos(a2) * r2x}%`}
                          y2={`${50 + Math.sin(a2) * r2y}%`}
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          opacity="0.3"
                        />
                      );
                    })}
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <span className="text-4xl block mb-2">🗺️</span>
            <p className="text-sm">Žádná místa k zobrazení</p>
          </div>
        )}
      </div>

      {/* Bottom card strip – mobile/tablet */}
      {!hideBottomCards && places.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {places.map((place, i) => {
              const pCfg = place.priority ? priorityConfig[place.priority] : null;
              const isActive = activeIndex === i;
              const circleBg = pCfg ? "" : "bg-primary text-primary-foreground";
              const circleStyle = pCfg ? { backgroundColor: pCfg.color, color: "white" } : undefined;

              return (
                <button
                  key={place.id}
                  className={`flex-shrink-0 bg-card rounded-xl shadow-card min-w-[160px] text-left transition-all ${
                    isActive && !pCfg ? "ring-2 ring-primary" : isActive && pCfg ? "ring-2" : ""
                  }`}
                  style={isActive && pCfg ? { boxShadow: `0 0 0 2px ${pCfg.color}` } : undefined}
                  onClick={() => {
                    setActiveIndex(i);
                    onPlaceClick(place.id);
                  }}
                >
                  {/* Colored top bar for priority */}
                  {pCfg && (
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: pCfg.color }} />
                  )}
                  <div className="p-3.5">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${circleBg}`}
                        style={circleStyle}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {place.emoji && <span className="text-lg block mb-0.5">{place.emoji}</span>}
                        <span className="text-sm font-bold text-foreground block truncate">{place.name}</span>
                        {place.timeFrom && place.timeTo && (
                          <p className="text-xs text-primary mt-0.5">
                            {place.timeFrom} – {place.timeTo}
                          </p>
                        )}
                        {place.timeFrom && !place.timeTo && (
                          <p className="text-xs text-primary mt-0.5">od {place.timeFrom}</p>
                        )}
                        {!place.timeFrom && place.timeTo && (
                          <p className="text-xs text-primary mt-0.5">do {place.timeTo}</p>
                        )}
                        {place.address && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{place.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMapView;
