# Travio – AGENTS.md (frontend)

## Tech stack
- React 18 + TypeScript
- Vite (dev server, výchozí port 5173, může běžet i na 8080)
- Tailwind CSS + shadcn/ui komponenty
- react-day-picker (výběr dat)
- Routování: react-router-dom
- `@vis.gl/react-google-maps` – Google Maps (APIProvider, Map, AdvancedMarker, useMapsLibrary)
- `@types/google.maps` – typy pro google.maps namespace

## Jak spustit
```bash
npm install
cp .env.example .env   # Vyplň hodnoty (viz níže)
npm run dev            # http://localhost:5173
npm run build          # produkční build
npm run test           # Vitest testy
```

## Environment proměnné (.env)
```
VITE_API_URL=http://localhost:3123/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key          # sb_publishable_... nebo eyJ...
VITE_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

## Struktura komponent
```
src/
├── components/
│   ├── ui/              # shadcn/ui – NEUPRAVUJ (generované)
│   ├── AddPlaceSheet.tsx     # Sheet pro přidání místa
│   ├── EditTripModal.tsx     # Modal pro editaci cesty
│   ├── EmojiPicker.tsx       # Výběr emoji
│   ├── MovePlaceModal.tsx    # Modal přesunu místa do jiného dne
│   ├── NavLink.tsx           # Navigační odkaz
│   ├── NewTripModal.tsx      # Modal pro vytvoření cesty (ukládá viewport destinace)
│   ├── PlaceCard.tsx         # Karta místa v seznamu
│   ├── PlaceDetailPanel.tsx  # Desktop panel detailu místa
│   └── TripMapView.tsx       # Google mapa s piny, polyline, auto-fit bounds
├── api/
│   ├── client.ts        # apiFetch – přidává Bearer token ze Supabase session
│   ├── trips.ts         # CRUD cest
│   ├── days.ts          # CRUD dnů
│   ├── places.ts        # CRUD míst
│   ├── search.ts        # Vyhledávání míst (Google Places)
│   └── weather.ts       # Počasí
├── context/
│   └── TripContext.tsx  # State management – načítá data z backendu přes API
├── lib/
│   └── supabase.ts      # Supabase klient (auth)
├── data/
│   └── mockData.ts      # Typy Place, Day, Trip + mock data pro dev
├── pages/
│   ├── Dashboard.tsx    # Přehled cest (hlavní stránka po přihlášení)
│   ├── TripDetail.tsx   # Detail cesty (seznam/mapa pohled)
│   ├── PlaceDetail.tsx  # Detail místa (mobilní celá stránka)
│   ├── Landing.tsx      # Veřejná landing page
│   ├── Login.tsx        # Přihlašovací stránka
│   └── SharedTrip.tsx   # Read-only sdílená cesta – fetchuje z API dle tokenu v URL, FullFrame
└── hooks/
    ├── use-mobile.tsx
    └── use-toast.ts
```

## Datové typy (z `src/data/mockData.ts`)
```typescript
interface Place {
  id: string; name: string; emoji?: string;
  address?: string; website?: string;
  lat?: number; lng?: number;
  openingHours?: string[];
  ticket: "none" | "need" | "have" | null;
  visited: boolean; note?: string;
  priority?: "must-see" | "chci-videt" | "mozna" | null;
  timeFrom?: string; timeTo?: string;
}
interface DayWeather { temp: number | null; tempMin?: number | null; icon: string | null; }
interface Day { id: string; date: string; places: Place[]; weather?: DayWeather | null; }
interface Trip {
  id: string; name: string; emoji: string;
  dateFrom: string; dateTo: string;
  weather?: { temp: number | null; icon: string | null; type?: 'forecast' | 'historical' };
  days: Day[]; unassigned: Place[];
  interests?: string[];
  centerLat?: number | null;   // střed destinace (z Google Places)
  centerLng?: number | null;
  viewportNorth?: number | null;  // viewport destinace pro auto-zoom mapy
  viewportSouth?: number | null;
  viewportEast?: number | null;
  viewportWest?: number | null;
}
```

## TripMapView – chování mapy
Props: `places`, `onPlaceClick`, `onAddPlace?`, `className?`, `hideBottomCards?`, `centerLat?`, `centerLng?`, `viewportNorth/South/East/West?`

Auto-zoom priorita (BoundsFitter):
1. ≥2 místa s koordináty v aktuálním dni → `fitBounds` na tato místa
2. 1 místo → střed + zoom 14
3. Žádná místa → `fitBounds` na viewport destinace (stát/město/region)

## DestinationResult (z `src/api/search.ts`)
```typescript
interface DestinationViewport { north: number; south: number; east: number; west: number; }
interface DestinationResult {
  name: string; description: string; placeId: string;
  lat: number | null; lng: number | null;
  viewport: DestinationViewport | null;  // viewport pro auto-zoom, vrací backend
}
```

## Konvence pojmenování
- Komponenty: PascalCase soubory i exporty
- Hooky: `use` prefix
- Styly: Tailwind třídy, žádné CSS moduly
- Barvy definované v Tailwind configu: `primary` (#00798c), `accent` (#edae49), `destructive` (#d1495b)

## Auth
- Přihlášení přes Google OAuth (Supabase)
- `supabase.auth.signInWithOAuth({ provider: 'google' })` v `Login.tsx`
- Token se automaticky přikládá v `api/client.ts` ke každému API volání
- Supabase vydává tokeny s algoritmem **ES256** – backend validuje přes JWKS

## API volání
Většina volání přes `apiFetch()` z `src/api/client.ts` – automaticky přidává Bearer token.
Výjimka: `getSharedTrip(token)` v `api/trips.ts` používá plain `fetch` (bez auth, veřejný endpoint).
Base URL z `VITE_API_URL` (výchozí `http://localhost:3123/api`).

## Počasí
- `TripContext.loadTrips()` – po načtení cest fire-and-forget `getTripWeather` pro každou cestu s coords → nastaví `trip.weather` (summary)
- `TripContext.loadTrip()` – načte weather + nastaví `trip.weather` (summary) i `day.weather` (per-day forecast)
- `TripCard` – zobrazuje `trip.weather.temp` + label „předpověď" / „hist. průměr"
- `TripDetail` + `SharedTrip` – jednotlivé dny zobrazují `max°/min°` pouze pokud `trip.weather.type === 'forecast'`
- Logika forecast vs historical je na backendu: ≤9 dní → yr.no, >9 dní → Open-Meteo archiv (stejné období -1 rok)
- `getTripWeather` v `src/api/weather.ts` – vrací `TripWeatherResult { summary, days }`

## Sdílení cest
- `TripDetail` – tlačítko „Sdílet odkaz" zavolá `GET /api/trips/:id/share`, otevře Dialog modal
- Modal zobrazí URL a tlačítko „Kopírovat odkaz" (`navigator.clipboard` + toast)
- `SharedTrip.tsx` – veřejná stránka na `/share/:token`, čte token z `useParams()`,
  fetchuje `GET /api/shared/:token` (bez autentizace), layout totožný s TripDetail (read-only),
  po načtení cesty fetchuje weather a zobrazuje per-day forecast (max°/min°) stejně jako TripDetail
- Router: `/share/:token` obaleno v `FullFrame` (ne MobileFrame) – plná šířka na desktopu

## Routování (`App.tsx`)
- `MobileFrame` (`max-w-[480px]`) – Login, Dashboard, NotFound
- `FullFrame` (bez omezení šířky) – Landing, TripDetail, PlaceDetail, **SharedTrip**

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
