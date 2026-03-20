import { Place, priorityConfig } from "@/data/mockData";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
  onMove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  readOnly?: boolean;
}

const PlaceCard = ({ place, onClick, onMoveUp, onMoveDown, readOnly }: PlaceCardProps) => {
  const ticketBadge =
    place.ticket === "have"
      ? "🎫 mám"
      : place.ticket === "need"
      ? "🎫 potřeba"
      : null;

  return (
    <div
      className={`w-full bg-card rounded-lg shadow-card p-4 flex items-center gap-2 ${
        place.visited ? "opacity-60" : ""
      }`}
    >
      {/* Reorder buttons */}
      {!readOnly && (
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp?.();
            }}
            disabled={!onMoveUp}
            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <GripVertical className="w-4 h-4 text-muted-foreground/40 mx-auto" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown?.();
            }}
            disabled={!onMoveDown}
            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content - clickable */}
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
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
      </button>
    </div>
  );
};

export default PlaceCard;
