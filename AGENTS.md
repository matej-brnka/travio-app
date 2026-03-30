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
├── frontend/          # React + Vite (TypeScript)
│   └── src/
│       ├── api/          # API vrstva (trips, days, places, search, weather)
│       ├── components/   # UI komponenty
│       ├── context/      # TripContext – state management
│       ├── data/         # mockData.ts – typy Place, Day, Trip
│       ├── lib/          # supabase.ts – Supabase klient
│       ├── pages/        # Stránky (routy)
│       └── hooks/        # Custom React hooks
├── backend/           # NestJS REST API
│   └── src/
│       ├── trips/        # CRUD cest
│       ├── days/         # CRUD dnů
│       ├── places/       # CRUD míst
│       ├── auth/         # JWT guard (ES256 / JWKS)
│       └── external/     # Integrace yr.no, Google Places, AI, LLM
├── chunks.MD          # Implementační plán (chunky)
└── AGENTS.md          # Tento soubor
```

## Tech stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, react-day-picker, framer-motion
- **Backend**: NestJS 11, TypeScript, pg (přímé PostgreSQL připojení)
- **Databáze**: Supabase (PostgreSQL), connection pooler
- **Auth**: Supabase Auth – Google OAuth, JWT tokeny (ES256, validace přes JWKS)
- **Mapové podklady**: Google Maps (`@vis.gl/react-google-maps`) – CHUNK 13
- **Externí API**: yr.no (počasí), Google Places API, OpenAI (AI generování itineráře)

## Jak spustit celý projekt lokálně

### Frontend
```bash
cd frontend
npm install
cp .env.example .env    # Vyplň hodnoty
npm run dev             # Vite dev server (výchozí port 5173, může být i 8080)
```

### Backend
```bash
cd backend
npm install
cp .env.example .env    # Vyplň hodnoty
npm run start:dev       # NestJS na http://localhost:3123
```

## Environment proměnné

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3123/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_... nebo eyJ...
VITE_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

### Backend (`backend/.env`)
```
PORT=3123
FRONTEND_URL=http://localhost:8080
SUPABASE_URL=aws-1-eu-west-1.pooler.supabase.com
SUPABASE_PORT=6543
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres.your-project-ref
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PROJECT_URL=https://your-project-ref.supabase.co
GOOGLE_PLACES_API_KEY=...
YR_NO_USER_AGENT=travio/1.0 your@email.com
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

## Databázové migrace
Migrace jsou v `backend/supabase/migrations/`. Spouštěj přes node pg skript nebo Supabase SQL Editor:
- `001_initial_schema.sql` – tabulky trips, days, places + RLS policies
- `002_trip_center.sql` – sloupce center_lat, center_lng na trips
- `003_trip_title.sql` – sloupec title na trips (uživatelský název výletu)
- `004_trip_destinations.sql` – sloupec destinations JSONB na trips (pole destinací)
- `005_day_destination_index.sql` – sloupec destination_index INT na days (přiřazení dne k destinaci)
- `006_llm_calls.sql` – tabulka `llm_calls` pro servisní log OpenAI volání (prompty + tokeny)
- TODO: migrace pro viewport_north/south/east/west na trips (zatím jen ve frontend modelu)

## Technické poznámky

### pg DATE sloupce
`pg` defaultně parsuje DATE jako JS `Date` s lokální půlnocí → timezone bug. `SupabaseService` to řeší pomocí `types.setTypeParser(1082, val => val)` – DATE se vrací jako plain string. Viz `backend/src/supabase/supabase.service.ts`.

### AI itinerář – ticket pole
- AI generování míst vrací i `ticket` u každého místa (`need` nebo `none`), které se ukládá do `places.ticket`.

### Servisní log OpenAI volání
- Backend endpoint: `GET /api/llm/calls?limit=500` (aktuálně bez auth guardu pro testování)
- Endpoint vrací poslední volání OpenAI uložená v DB tabulce `llm_calls`:
  - přesný `messages` payload (system/user)
  - `responseContent` (1:1 obsah odpovědi modelu)
  - model + options
  - `usage.promptTokens`, `usage.completionTokens`, `usage.totalTokens`
- Frontend servisní stránka: `/app/service/openai`
  - Filtrování záznamů podle data (Od / Do) klientsky
  - Každý záznam je collapsible ribbon – v základu jen datum, model, provider, tokeny, cena
  - Detail (rozbalitelný): AI Response 1:1, System zpráva, User zpráva
  - Součty tokenů a odhadovaná cena reagují na aktuální filtr
- Ceník modelů: `frontend/src/config/llmPricing.ts` – manuálně udržovaná tabulka cen (USD/1M tokenů), 3 sazby: `inputPer1M`, `cachedInputPer1M`, `outputPer1M`; `calcCost` počítá worst-case (bez cache slevy, DB cached tokeny neukládá zvlášť)
- Migrace: `backend/supabase/migrations/006_llm_calls.sql`
- Migrace: `backend/supabase/migrations/007_llm_response_content.sql`

## Jak spustit testy
```bash
cd frontend && npm run test    # Vitest
cd backend && npm run test     # Jest
```

## Konvence kódu
- TypeScript everywhere
- Komponenty: PascalCase (`TripCard.tsx`)
- Hooky: `use` prefix (`useTrips.ts`)
- API endpointy: REST, prefix `/api/`
- Commit zprávy: `feat:`, `fix:`, `chore:`, `docs:` prefix

## Bezpečnostní pravidla (POVINNÉ)
- **NIKDY necommituj `.env` soubory** – jsou v `.gitignore`
- Všechny tajné hodnoty (API klíče, JWT secret) vždy přes `process.env`
- `.env.example` commituj – bez skutečných hodnot, jen s názvy proměnných
- Supabase `service_role` klíč používej POUZE na backendu, nikdy na frontendu
- Na frontendu používej pouze Supabase `anon` klíč (`VITE_SUPABASE_ANON_KEY`)

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
