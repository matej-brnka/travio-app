import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockTrips, Place } from "@/data/mockData";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PlaceDetail = () => {
  const { id, placeId } = useParams();
  const navigate = useNavigate();

  const trip = useMemo(() => mockTrips.find((t) => t.id === id), [id]);

  const allPlaces = useMemo(() => {
    if (!trip) return [];
    const dayPlaces = trip.days.flatMap((d) => d.places);
    return [...dayPlaces, ...trip.unassigned];
  }, [trip]);

  const placeIndex = allPlaces.findIndex((p) => p.id === placeId);
  const place = allPlaces[placeIndex];

  const [ticket, setTicket] = useState<Place["ticket"]>(place?.ticket ?? null);
  const [visited, setVisited] = useState(place?.visited ?? false);

  if (!trip || !place) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Místo nenalezeno 😕</p>
      </div>
    );
  }

  const prevPlace = placeIndex > 0 ? allPlaces[placeIndex - 1] : null;
  const nextPlace = placeIndex < allPlaces.length - 1 ? allPlaces[placeIndex + 1] : null;

  const googleMapsUrl = place.address
    ? `https://maps.google.com/?q=${encodeURIComponent(place.address)}`
    : place.lat && place.lng
    ? `https://maps.google.com/?q=${place.lat},${place.lng}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card shadow-sm">
        <button onClick={() => navigate(`/app/trip/${id}`)} className="p-1 text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground truncate flex-1 text-center px-2">
          {place.name}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 text-foreground">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Přesunout do dne</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">🗑️ Smazat místo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-5 pb-24">
        {/* Mini map placeholder */}
        <div className="bg-muted rounded-lg h-40 flex items-center justify-center mt-4 mb-5">
          <div className="text-center text-muted-foreground">
            <span className="text-3xl block">🗺️</span>
            <p className="text-xs mt-1">Mapbox static (TODO)</p>
          </div>
        </div>

        {/* Address */}
        {place.address && (
          <p className="text-sm text-foreground mb-3">📍 {place.address}</p>
        )}

        {/* Website */}
        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline mb-3 block"
          >
            🌐 {new URL(place.website).hostname} →
          </a>
        )}

        {/* Opening hours */}
        {place.openingHours && place.openingHours.length > 0 && (
          <div className="mb-5">
            {place.openingHours.map((h, i) => (
              <p key={i} className="text-sm text-muted-foreground">🕘 {h}</p>
            ))}
          </div>
        )}

        <hr className="border-border my-5" />

        {/* Ticket */}
        <div className="mb-5">
          <p className="text-sm font-bold text-foreground mb-3">🎫 Vstupenka</p>
          <div className="flex gap-2">
            {(["none", "need", "have"] as const).map((t) => (
              <button
                key={t}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  ticket === t || (t === "none" && ticket === null)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setTicket(t)}
              >
                {t === "none" ? "Není třeba" : t === "need" ? "Potřeba" : "Mám"}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-border my-5" />

        {/* Visited */}
        <button
          className={`w-full py-4 rounded-lg text-center font-bold text-sm transition-colors ${
            visited
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
          onClick={() => setVisited(!visited)}
        >
          {visited ? "✅ Navštíveno" : "☐ Označit jako navštíveno"}
        </button>

        <hr className="border-border my-5" />

        {/* Pager */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-md"
            disabled={!prevPlace}
            onClick={() =>
              prevPlace && navigate(`/app/trip/${id}/place/${prevPlace.id}`)
            }
          >
            ← Předchozí
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-md"
            disabled={!nextPlace}
            onClick={() =>
              nextPlace && navigate(`/app/trip/${id}/place/${nextPlace.id}`)
            }
          >
            Další →
          </Button>
        </div>

        {/* Google Maps */}
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4"
          >
            <Button
              variant="outline"
              className="w-full rounded-md border-primary text-primary py-5"
            >
              🗺️ Navigovat (Google Maps)
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;
