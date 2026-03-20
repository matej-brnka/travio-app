import { Trip } from "@/data/mockData";
import { differenceInDays, format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
}

const TripCard = ({ trip, onClick }: TripCardProps) => {
  const today = new Date();
  const from = parseISO(trip.dateFrom);
  const to = parseISO(trip.dateTo);
  const daysUntil = differenceInDays(from, today);
  const totalDays = differenceInDays(to, from);

  let countdown: string;
  if (daysUntil > 0) {
    countdown = `Za ${daysUntil} dní`;
  } else if (daysUntil >= -totalDays) {
    countdown = "Probíhá";
  } else {
    countdown = "Proběhlo";
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-lg shadow-card p-5 text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{trip.emoji}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground">{trip.name}</h2>
          <p className="text-sm text-muted-foreground">
            {format(from, "d. M.", { locale: cs })} – {format(to, "d. M. yyyy", { locale: cs })}
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>{countdown}</span>
            <span>•</span>
            <span>{totalDays} dní</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {trip.weather?.temp != null
              ? <span>{trip.weather.icon} {trip.weather.temp}°C průměrně</span>
              : <span className="inline-block w-24 h-4 bg-muted animate-pulse rounded" />}
          </div>
        </div>
      </div>
    </button>
  );
};

export default TripCard;
