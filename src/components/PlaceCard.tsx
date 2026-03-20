import { Place } from "@/data/mockData";
import { GripVertical } from "lucide-react";

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
  onMove?: () => void;
  readOnly?: boolean;
}

const PlaceCard = ({ place, onClick, readOnly }: PlaceCardProps) => {
  const ticketBadge = place.ticket === "have"
    ? "🎫 mám"
    : place.ticket === "need"
    ? "🎫 potřeba"
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full bg-card rounded-lg shadow-card p-4 text-left flex items-center gap-3 hover:shadow-md transition-shadow ${
        place.visited ? "opacity-60" : ""
      }`}
    >
      {!readOnly && (
        <span className="text-muted-foreground cursor-grab flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {place.visited && <span className="text-primary">✅</span>}
          <h3
            className={`font-bold text-foreground text-sm truncate ${
              place.visited ? "line-through" : ""
            }`}
          >
            📍 {place.name}
          </h3>
        </div>
        {place.time && (
          <p className="text-xs text-muted-foreground mt-0.5">🕘 {place.time}</p>
        )}
        {place.address && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{place.address}</p>
        )}
        {ticketBadge && (
          <span className="inline-block mt-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {ticketBadge}
          </span>
        )}
      </div>
    </button>
  );
};

export default PlaceCard;
