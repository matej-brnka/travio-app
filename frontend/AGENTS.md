# Travio – AGENTS.md (frontend)

## Tech stack
- React 18 + TypeScript
- Vite (dev server, výchozí port 5173, může běžet i na 8080)
- Tailwind CSS + shadcn/ui komponenty
- react-day-picker (výběr dat)
- Routování: react-router-dom

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
│   ├── NewTripModal.tsx      # Modal pro vytvoření cesty
│   ├── PlaceCard.tsx         # Karta místa v seznamu
│   ├── PlaceDetailPanel.tsx  # Desktop panel detailu místa
│   └── TripMapView.tsx       # Pohled mapy s piny a kartami
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
│   └── SharedTrip.tsx   # Read-only sdílená cesta
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
interface Day { id: string; date: string; places: Place[]; }
interface Trip {
  id: string; name: string; emoji: string;
  dateFrom: string; dateTo: string;
  weather?: { temp: number | null; icon: string | null };  // volitelné, lazy load
  days: Day[]; unassigned: Place[];
  interests?: string[];
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
Všechna volání přes `apiFetch()` z `src/api/client.ts`.
Base URL z `VITE_API_URL` (výchozí `http://localhost:3123/api`).

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
