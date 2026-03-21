import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Trip, Place } from "@/data/mockData";
import * as TripsApi from "@/api/trips";
import * as DaysApi from "@/api/days";
import * as PlacesApi from "@/api/places";
import { getTripWeather } from "@/api/weather";
import { supabase } from "@/lib/supabase";

interface TripContextType {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  loadTrip: (id: string) => Promise<Trip | undefined>;
  getTrip: (id: string) => Trip | undefined;
  addPlaceToDay: (tripId: string, dayId: string | null, place: any) => Promise<void>;
  movePlace: (tripId: string, placeId: string, toDayId: string | null) => Promise<void>;
  reorderPlaces: (tripId: string, dayId: string | null, fromIndex: number, toIndex: number) => Promise<void>;
  updatePlace: (tripId: string, placeId: string, updates: Partial<Place>) => Promise<void>;
  deletePlace: (tripId: string, placeId: string) => Promise<void>;
  addTrip: (data: any) => Promise<Trip>;
  updateTrip: (tripId: string, updates: any) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  addDayToTrip: (tripId: string) => Promise<void>;
  removeDayFromTrip: (tripId: string, dayId: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | null>(null);

export const useTripContext = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTripContext must be used within TripProvider");
  return ctx;
};

function mapTrip(t: any): Trip {
  return {
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    dateFrom: t.dateFrom,
    dateTo: t.dateTo,
    interests: t.interests ?? [],
    weather: t.weather,
    centerLat: t.centerLat ?? null,
    centerLng: t.centerLng ?? null,
    days: (t.days ?? []).map((d: any) => ({
      id: d.id,
      date: d.date,
      places: (d.places ?? []).map(mapPlace),
    })),
    unassigned: (t.unassigned ?? []).map(mapPlace),
  };
}

function mapPlace(p: any): Place {
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji ?? undefined,
    address: p.address ?? undefined,
    website: p.website ?? undefined,
    lat: p.lat ?? undefined,
    lng: p.lng ?? undefined,
    openingHours: p.openingHours ?? undefined,
    ticket: p.ticket ?? null,
    visited: p.visited ?? false,
    note: p.note ?? undefined,
    priority: p.priority ?? null,
    timeFrom: p.timeFrom ?? undefined,
    timeTo: p.timeTo ?? undefined,
  };
}

export const TripProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TripsApi.getTrips();
      setTrips(data.map(mapTrip));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadTrips();
      else setTrips([]);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadTrips();
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadTrip = useCallback(async (id: string): Promise<Trip | undefined> => {
    try {
      const data = await TripsApi.getTrip(id);
      const trip = mapTrip(data);

      // Prefer trip center coords, fall back to first place with coords
      const lat = trip.centerLat ?? trip.days.flatMap(d => d.places).concat(trip.unassigned).find(p => p.lat)?.lat ?? null;
      const lng = trip.centerLng ?? trip.days.flatMap(d => d.places).concat(trip.unassigned).find(p => p.lng)?.lng ?? null;

      if (lat && lng) {
        try {
          const w = await getTripWeather(lat, lng, trip.dateFrom, trip.dateTo);
          trip.weather = { temp: w.summary.temp, icon: w.summary.icon, type: w.summary.type };
          // Attach per-day weather
          trip.days = trip.days.map(day => {
            const dw = w.days.find(d => d.date === day.date);
            return dw ? { ...day, weather: { temp: dw.temp, icon: dw.icon } } : day;
          });
        } catch {}
      }

      setTrips(prev => {
        const idx = prev.findIndex(t => t.id === id);
        if (idx >= 0) { const next = [...prev]; next[idx] = trip; return next; }
        return [...prev, trip];
      });
      return trip;
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const addTrip = useCallback(async (data: any): Promise<Trip> => {
    const created = await TripsApi.createTrip(data);
    const trip = mapTrip(created);
    setTrips(prev => [...prev, trip]);
    return trip;
  }, []);

  const updateTrip = useCallback(async (tripId: string, updates: any) => {
    await TripsApi.updateTrip(tripId, updates);
    const refreshed = await TripsApi.getTrip(tripId);
    const trip = mapTrip(refreshed);
    setTrips(prev => prev.map(t => t.id === tripId ? { ...trip, weather: t.weather } : t));
  }, []);

  const deleteTrip = useCallback(async (tripId: string) => {
    await TripsApi.deleteTrip(tripId);
    setTrips(prev => prev.filter(t => t.id !== tripId));
  }, []);

  const addPlaceToDay = useCallback(async (tripId: string, dayId: string | null, placeData: any) => {
    const created = await PlacesApi.createPlace(tripId, { ...placeData, dayId });
    const place = mapPlace(created);
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      if (!dayId) return { ...trip, unassigned: [...trip.unassigned, place] };
      return { ...trip, days: trip.days.map(d => d.id === dayId ? { ...d, places: [...d.places, place] } : d) };
    }));
  }, []);

  const movePlace = useCallback(async (tripId: string, placeId: string, toDayId: string | null) => {
    await PlacesApi.movePlace(tripId, placeId, toDayId);
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      let found: Place | null = null;
      const newDays = trip.days.map(d => {
        const idx = d.places.findIndex(p => p.id === placeId);
        if (idx !== -1) { found = d.places[idx]; return { ...d, places: d.places.filter(p => p.id !== placeId) }; }
        return d;
      });
      let newUnassigned = [...trip.unassigned];
      if (!found) {
        const idx = newUnassigned.findIndex(p => p.id === placeId);
        if (idx !== -1) { found = newUnassigned[idx]; newUnassigned = newUnassigned.filter(p => p.id !== placeId); }
      }
      if (!found) return trip;
      if (!toDayId) return { ...trip, days: newDays, unassigned: [...newUnassigned, found] };
      return { ...trip, days: newDays.map(d => d.id === toDayId ? { ...d, places: [...d.places, found!] } : d), unassigned: newUnassigned };
    }));
  }, []);

  const reorderPlaces = useCallback(async (tripId: string, dayId: string | null, fromIndex: number, toIndex: number) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      if (!dayId) {
        const items = [...trip.unassigned];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        PlacesApi.reorderPlaces(tripId, null, items.map(p => p.id));
        return { ...trip, unassigned: items };
      }
      return {
        ...trip,
        days: trip.days.map(d => {
          if (d.id !== dayId) return d;
          const items = [...d.places];
          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          PlacesApi.reorderPlaces(tripId, dayId, items.map(p => p.id));
          return { ...d, places: items };
        }),
      };
    }));
  }, []);

  const updatePlace = useCallback(async (tripId: string, placeId: string, updates: Partial<Place>) => {
    await PlacesApi.updatePlace(tripId, placeId, updates);
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        days: trip.days.map(d => ({ ...d, places: d.places.map(p => p.id === placeId ? { ...p, ...updates } : p) })),
        unassigned: trip.unassigned.map(p => p.id === placeId ? { ...p, ...updates } : p),
      };
    }));
  }, []);

  const deletePlace = useCallback(async (tripId: string, placeId: string) => {
    await PlacesApi.deletePlace(tripId, placeId);
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      return {
        ...trip,
        days: trip.days.map(d => ({ ...d, places: d.places.filter(p => p.id !== placeId) })),
        unassigned: trip.unassigned.filter(p => p.id !== placeId),
      };
    }));
  }, []);

  const addDayToTrip = useCallback(async (tripId: string) => {
    const newDay = await DaysApi.addDay(tripId);
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      return { ...trip, days: [...trip.days, { id: newDay.id, date: newDay.date, places: [] }] };
    }));
  }, []);

  const removeDayFromTrip = useCallback(async (tripId: string, dayId: string) => {
    await DaysApi.removeDay(tripId, dayId);
    setTrips(prev => prev.map(trip => {
      if (trip.id !== tripId) return trip;
      const day = trip.days.find(d => d.id === dayId);
      return {
        ...trip,
        days: trip.days.filter(d => d.id !== dayId),
        unassigned: [...trip.unassigned, ...(day?.places ?? [])],
      };
    }));
  }, []);

  return (
    <TripContext.Provider value={{
      trips, loading, error, setTrips,
      loadTrip, getTrip,
      addPlaceToDay, movePlace, reorderPlaces, updatePlace, deletePlace,
      addTrip, updateTrip, deleteTrip,
      addDayToTrip, removeDayFromTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
};
