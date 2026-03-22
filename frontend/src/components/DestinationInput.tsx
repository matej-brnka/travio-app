import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchDestinations, DestinationResult } from "@/api/search";
import { TripDestination } from "@/data/mockData";
import { X } from "lucide-react";

interface DestinationInputProps {
  value: TripDestination;
  onChange: (v: TripDestination) => void;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
}

const DestinationInput = ({ value, onChange, onRemove, placeholder = "🔍 Kam chceš jet?", className }: DestinationInputProps) => {
  const [suggestions, setSuggestions] = useState<DestinationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value.name.trim() || value.lat != null) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try { setSuggestions(await searchDestinations(value.name)); } catch { setSuggestions([]); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [value.name, value.lat]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="flex items-center gap-1">
        <Input
          placeholder={placeholder}
          value={value.name}
          onChange={(e) => {
            onChange({ name: e.target.value, lat: null, lng: null, viewport: null });
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="flex-1"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-card border border-border rounded-md mt-1 shadow-card max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              onClick={() => {
                onChange({
                  name: s.name,
                  lat: s.lat,
                  lng: s.lng,
                  viewportNorth: s.viewport?.north ?? null,
                  viewportSouth: s.viewport?.south ?? null,
                  viewportEast: s.viewport?.east ?? null,
                  viewportWest: s.viewport?.west ?? null,
                });
                setShowSuggestions(false);
              }}
            >
              <span className="font-medium">📍 {s.name}</span>
              {s.description && <span className="text-muted-foreground ml-1 text-xs">{s.description}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationInput;
