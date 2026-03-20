# Travio – AGENTS.md (frontend)

## Tech stack
- React 18 + TypeScript
- Vite (dev server na portu 5173)
- Tailwind CSS + shadcn/ui komponenty
- react-day-picker (výběr dat)
- Routování: react-router-dom

## Jak spustit
```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # produkční build
npm run test    # Vitest testy
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
├── context/
│   └── TripContext.tsx  # Hlavní state management (zatím mock data)
├── data/
│   └── mockData.ts      # Mock data – ZDE jsou typy Place, Day, Trip
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
  weather: { temp: number; icon: string };
  days: Day[]; unassigned: Place[];
  interests?: string[];
}
```

## Konvence pojmenování
- Komponenty: PascalCase soubory i exporty
- Hooky: `use` prefix
- Styly: Tailwind třídy, žádné CSS moduly
- Barvy definované v Tailwind configu: `primary` (#00798c), `accent` (#edae49), `destructive` (#d1495b)

## Mock data
Viz `src/data/mockData.ts` – obsahuje `mockTrips` a `mockPlaceSuggestions`.
State management je v `src/context/TripContext.tsx` – momentálně pracuje s mock daty v paměti.
Po implementaci backendu bude nahrazen skutečnými API voláními.

## Kde napsat API volání
Při propojení s backendem vytvoř `src/api/` složku se soubory:
- `trips.ts` – CRUD cest
- `places.ts` – CRUD míst
- `days.ts` – CRUD dnů
- `auth.ts` – přihlášení

API base URL bere z `import.meta.env.VITE_API_URL` (výchozí `http://localhost:3123/api`).

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
