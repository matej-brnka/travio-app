# Travio – AGENTS.md (kořen projektu)

## Přehled projektu
Travio je webová aplikace pro tvorbu cestovních itinerářů. Primárně navržena pro mobilní zařízení.

Uživatel může:
- Vytvářet cesty s termíny (dateFrom / dateTo), aplikace automaticky počítá počet dní
- Přidávat místa do jednotlivých dnů nebo do „Volných" (unassigned)
- Přesouvat a řadit místa drag & dropem
- Sdílet cestu anonymním odkazem (read-only)
- Přihlásit se přes Google OAuth

## Struktura repozitáře
```
/
├── frontend/          # React + Vite (TypeScript), generovaný v Lovable
│   └── src/
│       ├── components/   # UI komponenty
│       ├── pages/        # Stránky (routy)
│       ├── context/      # TripContext – state management
│       ├── data/         # mockData.ts – mock data (bude nahrazena API voláními)
│       └── hooks/        # Custom React hooks
├── backend/           # NestJS REST API
│   └── src/
│       ├── trips/        # CRUD cest
│       ├── days/         # CRUD dnů
│       ├── places/       # CRUD míst
│       ├── auth/         # Google OAuth + JWT
│       └── external/     # Integrace yr.no, Google Places, AI
├── docs/              # Dokumentace, popis projektu, chunky
└── AGENTS.md          # Tento soubor
```

## Tech stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, react-day-picker
- **Backend**: NestJS 10, TypeScript, Supabase (PostgreSQL + Auth)
- **Databáze**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth – Google OAuth, JWT tokeny
- **Mapové podklady**: Mapbox (bude integrováno)
- **Externí API**: yr.no (počasí), Google Places API, AI model (TBA)

## Jak spustit celý projekt lokálně

### Frontend
```bash
cd frontend
npm install
npm run dev         # Vite dev server na http://localhost:5173
```

### Backend
```bash
cd backend
npm install
cp .env.example .env    # Vyplň skutečné hodnoty
npm run start:dev   # NestJS na http://localhost:3123
```

## Jak spustit testy
```bash
cd frontend && npm run test    # Vitest
cd backend && npm run test     # Jest
```

## Konvence kódu
- TypeScript everywhere – žádný `any` bez komentáře
- Komponenty: PascalCase (`TripCard.tsx`)
- Hooky: `use` prefix (`useTrips.ts`)
- API endpointy: REST, prefixovány `/api/`, snake_case v JSON
- Commit zprávy: `feat:`, `fix:`, `chore:`, `docs:` prefix

## Bezpečnostní pravidla (POVINNÉ)
- **NIKDY necommituj `.env` soubory** – jsou v `.gitignore`
- Všechny tajné hodnoty (API klíče, JWT secret) vždy přes `process.env`
- `.env.example` commituj – bez skutečných hodnot, jen s názvy proměnných
- Supabase `service_role` klíč používej POUZE na backendu, nikdy na frontendu
- Na frontendu používej pouze Supabase `anon` klíč

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
