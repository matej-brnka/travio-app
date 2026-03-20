import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Trip, Place, mockTrips } from "@/data/mockData";
import { differenceInDays, parseISO, addDays, format } from "date-fns";

interface TripContextType {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  getTrip: (id: string) => Trip | undefined;
  addPlaceToDay: (tripId: string, dayId: string | null, place: Place) => void;
  movePlace: (tripId: string, placeId: string, toDayId: string | null) => void;
  reorderPlaces: (tripId: string, dayId: string | null, fromIndex: number, toIndex: number) => void;
  updatePlace: (tripId: string, placeId: string, updates: Partial<Place>) => void;
  deletePlace: (tripId: string, placeId: string) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (tripId: string, updates: Partial<Pick<Trip, "name" | "emoji" | "dateFrom" | "dateTo">>) => void;
}

const TripContext = createContext<TripContextType | null>(null);

export const useTripContext = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTripContext must be used within TripProvider");
  return ctx;
};

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const addTrip = useCallback((trip: Trip) => {
    setTrips((prev) => [...prev, trip]);
  }, []);

  const addPlaceToDay = useCallback(
    (tripId: string, dayId: string | null, place: Place) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== tripId) return trip;
          if (!dayId) {
            return { ...trip, unassigned: [...trip.unassigned, place] };
          }
          return {
            ...trip,
            days: trip.days.map((d) =>
              d.id === dayId ? { ...d, places: [...d.places, place] } : d
            ),
          };
        })
      );
    },
    []
  );

  const movePlace = useCallback(
    (tripId: string, placeId: string, toDayId: string | null) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== tripId) return trip;

          // Find and remove place from current location
          let foundPlace: Place | null = null;
          let newDays = trip.days.map((d) => {
            const idx = d.places.findIndex((p) => p.id === placeId);
            if (idx !== -1) {
              foundPlace = d.places[idx];
              return { ...d, places: d.places.filter((p) => p.id !== placeId) };
            }
            return d;
          });
          let newUnassigned = [...trip.unassigned];
          if (!foundPlace) {
            const idx = newUnassigned.findIndex((p) => p.id === placeId);
            if (idx !== -1) {
              foundPlace = newUnassigned[idx];
              newUnassigned = newUnassigned.filter((p) => p.id !== placeId);
            }
          }
          if (!foundPlace) return trip;

          // Add to new location
          if (!toDayId) {
            newUnassigned = [...newUnassigned, foundPlace];
          } else {
            newDays = newDays.map((d) =>
              d.id === toDayId ? { ...d, places: [...d.places, foundPlace!] } : d
            );
          }

          return { ...trip, days: newDays, unassigned: newUnassigned };
        })
      );
    },
    []
  );

  const reorderPlaces = useCallback(
    (tripId: string, dayId: string | null, fromIndex: number, toIndex: number) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== tripId) return trip;
          if (!dayId) {
            const items = [...trip.unassigned];
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);
            return { ...trip, unassigned: items };
          }
          return {
            ...trip,
            days: trip.days.map((d) => {
              if (d.id !== dayId) return d;
              const items = [...d.places];
              const [moved] = items.splice(fromIndex, 1);
              items.splice(toIndex, 0, moved);
              return { ...d, places: items };
            }),
          };
        })
      );
    },
    []
  );

  const updatePlace = useCallback(
    (tripId: string, placeId: string, updates: Partial<Place>) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== tripId) return trip;
          return {
            ...trip,
            days: trip.days.map((d) => ({
              ...d,
              places: d.places.map((p) =>
                p.id === placeId ? { ...p, ...updates } : p
              ),
            })),
            unassigned: trip.unassigned.map((p) =>
              p.id === placeId ? { ...p, ...updates } : p
            ),
          };
        })
      );
    },
    []
  );

  const deletePlace = useCallback((tripId: string, placeId: string) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id !== tripId) return trip;
        return {
          ...trip,
          days: trip.days.map((d) => ({
            ...d,
            places: d.places.filter((p) => p.id !== placeId),
          })),
          unassigned: trip.unassigned.filter((p) => p.id !== placeId),
        };
      })
    );
  }, []);

  const updateTrip = useCallback(
    (tripId: string, updates: Partial<Pick<Trip, "name" | "emoji" | "dateFrom" | "dateTo">>) => {
      setTrips((prev) =>
        prev.map((trip) => {
          if (trip.id !== tripId) return trip;
          const updated = { ...trip, ...updates };
          // Recalculate days if dates changed
          if (updates.dateFrom || updates.dateTo) {
            const from = updated.dateFrom;
            const to = updated.dateTo;
            const newTotalDays = differenceInDays(parseISO(to), parseISO(from)) + 1;
            if (newTotalDays > 0 && newTotalDays !== trip.days.length) {
              const newDays = Array.from({ length: newTotalDays }, (_, i) => {
                const date = format(addDays(parseISO(from), i), "yyyy-MM-dd");
                // Preserve existing day data if available
                const existing = trip.days[i];
                if (existing) return { ...existing, date };
                return { id: `day-${Date.now()}-${i}`, date, places: [] };
              });
              // Move places from removed days to unassigned
              const removedPlaces = trip.days.slice(newTotalDays).flatMap((d) => d.places);
              updated.days = newDays;
              updated.unassigned = [...updated.unassigned, ...removedPlaces];
            }
          }
          return updated;
        })
      );
    },
    []
  );

  return (
    <TripContext.Provider
      value={{
        trips,
        setTrips,
        getTrip,
        addPlaceToDay,
        movePlace,
        reorderPlaces,
        updatePlace,
        deletePlace,
        addTrip,
        updateTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
