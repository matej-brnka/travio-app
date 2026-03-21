export type PlacePriority = "must-see" | "chci-videt" | "mozna" | null;

export const priorityConfig: Record<string, { label: string; emoji: string; color: string; bgClass: string }> = {
  "must-see": { label: "Must see!", emoji: "🔥", color: "hsl(var(--destructive))", bgClass: "bg-destructive/10 text-destructive" },
  "chci-videt": { label: "Chci vidět", emoji: "⭐", color: "hsl(var(--accent))", bgClass: "bg-accent/20 text-accent-foreground" },
  "mozna": { label: "Když zbyde čas", emoji: "🤷", color: "hsl(var(--muted-foreground))", bgClass: "bg-muted text-muted-foreground" },
};

export interface Place {
  id: string;
  name: string;
  emoji?: string;
  address?: string;
  website?: string;
  lat?: number;
  lng?: number;
  openingHours?: string[];
  ticket: "none" | "need" | "have" | null;
  visited: boolean;
  note?: string;
  priority?: PlacePriority;
  time?: string;
  timeFrom?: string;
  timeTo?: string;
}

export interface Day {
  id: string;
  date: string;
  places: Place[];
}

export interface Trip {
  id: string;
  name: string;
  emoji: string;
  dateFrom: string;
  dateTo: string;
  weather?: { temp: number | null; icon: string | null };
  days: Day[];
  unassigned: Place[];
  interests?: string[];
  centerLat?: number | null;
  centerLng?: number | null;
  viewportNorth?: number | null;
  viewportSouth?: number | null;
  viewportEast?: number | null;
  viewportWest?: number | null;
}

export const mockTrips: Trip[] = [
  {
    id: "trip-1",
    name: "New York",
    emoji: "🗽",
    dateFrom: "2026-04-15",
    dateTo: "2026-04-22",
    weather: { temp: 14, icon: "⛅" },
    days: [
      {
        id: "day-1",
        date: "2026-04-15",
        places: [
          {
            id: "p1",
            name: "Central Park",
            visited: false,
            ticket: null,
            address: "Central Park West, New York, NY 10024",
            website: "https://www.centralparknyc.org",
            lat: 40.7851,
            lng: -73.9683,
            openingHours: ["Po–Pá: 06:00–23:00", "So–Ne: 06:00–24:00"],
            time: "09:00–12:00",
          },
          {
            id: "p2",
            name: "MoMA",
            visited: true,
            ticket: "have",
            address: "11 W 53rd St, New York, NY 10019",
            website: "https://www.moma.org",
            lat: 40.7614,
            lng: -73.9776,
            openingHours: ["Po–Ne: 10:30–17:30"],
            time: "13:00–16:00",
          },
        ],
      },
      {
        id: "day-2",
        date: "2026-04-16",
        places: [
          {
            id: "p3",
            name: "Statue of Liberty",
            visited: false,
            ticket: "need",
            address: "Liberty Island, New York, NY 10004",
            website: "https://www.nps.gov/stli",
            lat: 40.6892,
            lng: -74.0445,
            openingHours: ["Po–Ne: 09:00–17:00"],
            time: "09:00–13:00",
          },
        ],
      },
      {
        id: "day-3",
        date: "2026-04-17",
        places: [],
      },
      {
        id: "day-4",
        date: "2026-04-18",
        places: [
          {
            id: "p4",
            name: "Brooklyn Bridge",
            visited: false,
            ticket: null,
            address: "Brooklyn Bridge, New York, NY 10038",
            lat: 40.7061,
            lng: -73.9969,
            time: "10:00–11:30",
          },
        ],
      },
      {
        id: "day-5",
        date: "2026-04-19",
        places: [],
      },
      {
        id: "day-6",
        date: "2026-04-20",
        places: [],
      },
      {
        id: "day-7",
        date: "2026-04-21",
        places: [],
      },
    ],
    unassigned: [
      {
        id: "p10",
        name: "Times Square",
        visited: false,
        ticket: null,
        address: "Manhattan, NY 10036",
        lat: 40.758,
        lng: -73.9855,
      },
      {
        id: "p11",
        name: "Empire State Building",
        visited: false,
        ticket: "need",
        address: "20 W 34th St, New York, NY 10001",
        lat: 40.7484,
        lng: -73.9857,
      },
    ],
  },
  {
    id: "trip-2",
    name: "Alpy",
    emoji: "🏔️",
    dateFrom: "2026-07-10",
    dateTo: "2026-07-17",
    weather: { temp: 22, icon: "🌤️" },
    days: [
      { id: "day-a1", date: "2026-07-10", places: [] },
      { id: "day-a2", date: "2026-07-11", places: [] },
      { id: "day-a3", date: "2026-07-12", places: [] },
      { id: "day-a4", date: "2026-07-13", places: [] },
      { id: "day-a5", date: "2026-07-14", places: [] },
      { id: "day-a6", date: "2026-07-15", places: [] },
      { id: "day-a7", date: "2026-07-16", places: [] },
    ],
    unassigned: [],
  },
];

export const mockPlaceSuggestions = [
  { name: "Times Square", address: "Manhattan, NY 10036" },
  { name: "Brooklyn Bridge", address: "Brooklyn, New York, NY" },
  { name: "Empire State Building", address: "20 W 34th St, New York" },
  { name: "High Line", address: "New York, NY 10011" },
  { name: "Grand Central Terminal", address: "89 E 42nd St, New York" },
  { name: "One World Observatory", address: "285 Fulton St, New York" },
];
