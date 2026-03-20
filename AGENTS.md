# AGENTS.md – Travio

## Purpose

This file provides concrete, copy-pastable instructions for AI coding agents and human contributors working in this repository. It covers setup, development workflows, testing, and validation steps specific to this codebase.

---

## Repo map

```
/
├── frontend/                  # React 18 + Vite (TypeScript) – mobile-first web app
│   ├── src/
│   │   ├── components/        # UI komponenty
│   │   │   └── ui/            # shadcn/ui primitives – NEUPRAVUJ ručně (generované)
│   │   ├── pages/             # Stránky (react-router-dom routes)
│   │   ├── context/
│   │   │   └── TripContext.tsx  # Globální state management (zatím in-memory mock)
│   │   ├── data/
│   │   │   └── mockData.ts    # Mock data + sdílené TypeScript typy (Place, Day, Trip)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility funkce (cn, supabase client, …)
│   │   └── api/               # API klient – vznikne při propojení s backendem
│   ├── .env.example
│   └── package.json
├── backend/                   # NestJS 10 (TypeScript) – REST API
│   ├── src/
│   │   ├── trips/             # CRUD cest
│   │   ├── days/              # CRUD dnů
│   │   ├── places/            # CRUD míst, přesun, řazení
│   │   ├── auth/              # JWT guard, @CurrentUser() dekorátor
│   │   ├── supabase/          # Sdílený Supabase klient (globální modul)
│   │   └── external/
│   │       ├── weather/       # yr.no integrace
│   │       ├── google-places/ # Google Places autocomplete
│   │       └── ai/            # OpenAI – generování itineráře
│   ├── supabase/
│   │   └── migrations/        # SQL migrace (spouštět v Supabase SQL editoru)
│   ├── .env.example
│   └── package.json
└── docs/                      # Popis projektu, implementační chunky
```

---

## Quickstart

Prerequisites (Node.js 20 LTS+, npm 9+):

```bash
# 1. Frontend
cd frontend
npm install
cp .env.example .env        # vyplň VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev                 # http://localhost:5173

# 2. Backend (v druhém terminálu)
cd backend
npm install
cp .env.example .env        # vyplň SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, …
npm run start:dev           # http://localhost:3000
```

Frontend běží na `http://localhost:5173`, backend na `http://localhost:3000`.

---

## Common commands

### Install

```bash
cd frontend && npm install
cd backend && npm install
```

### Dev

```bash
cd frontend && npm run dev          # Vite dev server – http://localhost:5173
cd backend && npm run start:dev     # NestJS watch mode – http://localhost:3000
```

### Build

```bash
cd frontend && npm run build
cd backend && npm run build
```

### Lint / Format

```bash
cd frontend && npm run lint
cd backend && npm run lint
```

### Typecheck

```bash
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

### Test

```bash
# Frontend – Vitest
cd frontend && npm run test          # single run
cd frontend && npm run test:watch    # watch mode
cd frontend && npx playwright test   # E2E (vyžaduje běžící dev server)

# Backend – Jest
cd backend && npm run test
```

### Database

```bash
# Spustit migrace přes Supabase CLI
supabase db push

# Vytvoření nové migrace
# → přidej soubor do backend/supabase/migrations/NNN_popis.sql
# → spusť v Supabase SQL editoru nebo přes `supabase db push`

# Health check backendu
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}
```

---

## Testing & TDD workflow

Follow **Red → Green → Refactor**:

1. **Red** — napiš selhávající test popisující očekávané chování
2. **Green** — implementuj minimum kódu pro průchod testu
3. **Refactor** — vyčisti kód, testy musí zůstat zelené

### Bug fixes

Vždy začni reprodukčním testem, který bug zachytí, a teprve pak piš opravu.

### Test locations

| Vrstva | Umístění | Runner | Příkaz |
|--------|----------|--------|--------|
| Frontend unit | `frontend/src/**/*.test.ts(x)` | Vitest | `cd frontend && npm run test` |
| Frontend E2E | `frontend/src/test/*.spec.ts` | Playwright | `cd frontend && npx playwright test` |
| Backend unit | `backend/src/**/*.spec.ts` | Jest | `cd backend && npm run test` |

### Running a targeted test

```bash
# Backend – jeden modul
cd backend && npm run test -- --testPathPattern=trips.service.spec

# Frontend – jeden soubor
cd frontend && npm run test -- TripCard.test.tsx

# Playwright – jeden scénář
cd frontend && npx playwright test --grep="vytvoření cesty"
```

---

## Code quality rules

- **Žádný `any`** – použij `unknown` s type guard nebo konkrétní typ
- **Žádný `console.log`** v commitnutém kódu – backend používá NestJS `Logger`, frontend odstraň před PR
- **Funkcionální React komponenty** – žádné class komponenty
- **Sdílené typy** žijí v `frontend/src/data/mockData.ts`. Backend musí vracet JSON strukturu kompatibilní s těmito typy. Typy neduplikuj.
- **`shadcn/ui` komponenty** v `frontend/src/components/ui/` neupravuj ručně – jsou generované nástrojem shadcn
- **Žádné breaking změny API** bez synchronní úpravy frontendu. Pokud se změní tvar odpovědi, uprav typy v `mockData.ts` a konzumenty zároveň.

### Code style

- Dvojité uvozovky, středníky, 2-mezerová odsazení (Prettier)
- Arrow functions preferovány
- Strict equality (`===`)
- Singular naming pro DB tabulky (`trip`, `day`, `place`)
- Commit zprávy: `feat:`, `fix:`, `chore:`, `docs:` prefix

---

## Frontend (React + Vite) agent guidance

### Structure

```
frontend/src/
├── components/
│   ├── ui/                  # shadcn/ui primitives (Button, Sheet, Dialog, …) – negeneruj ručně
│   ├── AddPlaceSheet.tsx    # Sheet pro přidání místa (Google Places autocomplete)
│   ├── EditTripModal.tsx    # Modal editace cesty
│   ├── EmojiPicker.tsx      # Výběr emoji
│   ├── MovePlaceModal.tsx   # Modal přesunu místa do jiného dne
│   ├── NewTripModal.tsx     # Modal vytvoření cesty (datum, emoji, AI volba)
│   ├── PlaceCard.tsx        # Karta místa v seznamu (priority border, visited stav)
│   ├── PlaceDetailPanel.tsx # Desktop pravý panel detailu místa
│   └── TripMapView.tsx      # Mock mapa s piny a horizontálními kartami
├── pages/
│   ├── Landing.tsx          # Veřejná landing page  → /
│   ├── Login.tsx            # Přihlášení (Google OAuth)  → /login
│   ├── Dashboard.tsx        # Přehled cest  → /app
│   ├── TripDetail.tsx       # Detail cesty (Seznam / Mapa toggle)  → /app/trip/:id
│   ├── PlaceDetail.tsx      # Mobilní celostránkový detail místa  → /app/trip/:id/place/:placeId
│   └── SharedTrip.tsx       # Read-only sdílená cesta  → /share/:token
├── context/
│   └── TripContext.tsx      # Globální store; akce: addTrip, updateTrip, addPlaceToDay,
│                            #   movePlace, reorderPlaces, updatePlace, deletePlace,
│                            #   addDayToTrip, removeDayFromTrip
├── data/
│   └── mockData.ts          # Typy Place / Day / Trip + mock data (bude nahrazeno API)
├── hooks/                   # Custom hooks (use-mobile, use-toast)
├── lib/                     # cn(), supabase client
└── api/                     # API funkce (vznikne při propojení s backendem)
```

Layouts definované v `App.tsx`:
- `MobileFrame` – `max-w-[480px] mx-auto` (Dashboard, Login, SharedTrip)
- `FullFrame` – full-width (TripDetail, PlaceDetail, Landing)

### Patterns

- **State**: Veškerý stav cest přes `useTripContext()`. Nikdy nevolej setter přímo z komponenty – použij akce z contextu.
- **Data fetching**: Po propojení s backendem používej `@tanstack/react-query` (již nainstalovaný) s API funkcemi z `src/api/`.
- **Routing**: `react-router-dom` v6. Nové stránky přidávej do `src/App.tsx` jako `<Route>`.
- **Formuláře**: `react-hook-form` + `zod` (oboje nainstalováno).
- **Styling**: Tailwind CSS utility třídy. Žádné custom CSS soubory pokud se dá vyhnout.
- **Nová stránka**: vytvoř `src/pages/MyPage.tsx` → přidej `<Route>` do `App.tsx` → zvol `MobileFrame` nebo `FullFrame`.
- **Nové API volání**: vytvoř soubor v `src/api/`. Klient (`src/api/client.ts`) automaticky přidává JWT token z Supabase session. Base URL bere z `import.meta.env.VITE_API_URL`.

### Validating UI changes

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run test
npm run build           # odhalí SSR/bundle chyby
# pokud se mění user flows:
npx playwright test
```

---

## Backend (NestJS) agent guidance

### Structure

```
backend/src/
├── trips/
│   ├── trips.controller.ts
│   ├── trips.service.ts
│   ├── trips.module.ts
│   └── dto/
├── days/
│   ├── days.controller.ts
│   ├── days.service.ts
│   └── days.module.ts
├── places/
│   ├── places.controller.ts
│   ├── places.service.ts
│   ├── places.module.ts
│   └── dto/
├── auth/
│   ├── auth.controller.ts    # GET /api/auth/me
│   ├── jwt.strategy.ts       # validace Supabase JWT
│   ├── jwt-auth.guard.ts     # @UseGuards(JwtAuthGuard)
│   └── current-user.decorator.ts  # @CurrentUser()
├── supabase/
│   ├── supabase.module.ts    # @Global() – inject všude
│   ├── supabase.service.ts   # this.supabase.db → SupabaseClient
│   └── database.types.ts     # DB row typy
├── external/
│   ├── weather/              # yr.no – GET /api/weather
│   ├── google-places/        # autocomplete – GET /api/places/search
│   └── ai/                   # OpenAI – POST /api/trips/:id/ai-generate
└── main.ts                   # CORS, global prefix /api, port z env
```

### Adding an endpoint

1. Najdi nebo vytvoř modul v `src/<domain>/`
2. Přidej DTO do `src/<domain>/dto/` s `class-validator` dekorátory
3. Implementuj metodu v service; napiš unit test (`.spec.ts` vedle souboru)
4. Přidej route do controlleru (`@Get`, `@Post`, `@Patch`, `@Delete`)
5. Chráněné endpointy: `@UseGuards(JwtAuthGuard)` + čti user přes `@CurrentUser()`
6. Přistupuj k DB přes injektovaný `SupabaseService`:
   ```typescript
   const { data, error } = await this.supabase.db
     .from('trips')
     .select('*, days(*, places(*))')
     .eq('user_id', userId);
   ```
7. Napiš integrační test přes Supertest
8. **Aktualizuj tabulku API endpointů** níže v tomto souboru

### Testing approach

- **Services**: mockuj `SupabaseService`. Testuj business logiku v izolaci.
- **Controllers**: testuj přes `@nestjs/testing` + Supertest (integrační testy).
- **Guards / Decorators**: unit testuj samostatně.

```bash
# Cílený test jednoho modulu
cd backend && npm run test -- --testPathPattern=trips.service.spec
```

---

## Database (Supabase) guidance

### Schéma

```sql
-- Uživatelé spravováni přes Supabase Auth (auth.users)

trips   (id uuid PK, user_id uuid FK→auth.users, name, emoji,
         date_from date, date_to date, interests text[], share_token text unique)

days    (id uuid PK, trip_id uuid FK→trips, date date, position int)

places  (id uuid PK, trip_id uuid FK→trips,
         day_id uuid FK→days nullable,   -- NULL = volné (unassigned)
         name, emoji, address, website, lat, lng, opening_hours text[],
         ticket text, visited bool, note, priority text,
         time_from, time_to, position int, google_place_id)
```

### Migrace

Migrace jsou v `backend/supabase/migrations/` jako číslovené SQL soubory (`001_initial_schema.sql`, …).

```bash
supabase db push                          # aplikuj všechny pending migrace
# nová migrace → přidej soubor NNN_popis.sql a spusť db push
```

### Pravidla

- Nikdy neupravuj migraci, která je již mergnutá do `main`
- Jedna migrace = jedna logická změna
- RLS (Row Level Security) musí být zapnuté na všech tabulkách
- Sdílená cesta (`share_token IS NOT NULL`) je přístupná read-only i bez autentizace přes RLS policy

---

## API endpoints

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/api/health` | – | Health check |
| GET | `/api/auth/me` | JWT | Info o přihlášeném uživateli |
| GET | `/api/trips` | JWT | Seznam cest uživatele |
| POST | `/api/trips` | JWT | Vytvoření cesty |
| GET | `/api/trips/:id` | JWT | Detail cesty (s dny a místy) |
| PATCH | `/api/trips/:id` | JWT | Editace cesty |
| DELETE | `/api/trips/:id` | JWT | Smazání cesty |
| GET | `/api/trips/:id/share` | JWT | Vygenerovat / vrátit share token |
| GET | `/api/shared/:token` | – | Read-only sdílená cesta |
| POST | `/api/trips/:id/days` | JWT | Přidání dne |
| DELETE | `/api/trips/:id/days/:dayId` | JWT | Smazání dne (místa → volná) |
| POST | `/api/trips/:id/places` | JWT | Přidání místa |
| PATCH | `/api/trips/:id/places/:placeId` | JWT | Editace místa |
| DELETE | `/api/trips/:id/places/:placeId` | JWT | Smazání místa |
| PATCH | `/api/trips/:id/places/:placeId/move` | JWT | Přesun místa do jiného dne |
| PATCH | `/api/trips/:id/days/:dayId/reorder` | JWT | Změna pořadí míst |
| GET | `/api/places/search?q=` | JWT | Google Places autocomplete |
| GET | `/api/weather?lat=&lng=&date=` | – | Počasí z yr.no |
| POST | `/api/trips/:id/ai-generate` | JWT | AI návrh itineráře |

---

## Environment variables & secrets

- Šablony: `frontend/.env.example` a `backend/.env.example`
- **Nikdy necommituj `.env`** – je v `.gitignore`
- `SUPABASE_SERVICE_ROLE_KEY` patří **pouze na backend** – nikdy do `frontend/`
- Na frontendu používej výhradně `VITE_SUPABASE_ANON_KEY`

### Adding a new env var

1. Přidej do příslušného `.env.example` s placeholder hodnotou a komentářem
2. Backend: přidej `config.getOrThrow('VARIABLE_NAME')` nebo validaci v `src/config/`
3. Frontend: prefix `VITE_` pro proměnné čitelné v kódu prohlížeče
4. Aktualizuj tabulku níže

### Key variables

| Proměnná | Kde | Popis |
|----------|-----|-------|
| `VITE_API_URL` | frontend | URL backendu, výchozí `http://localhost:3000/api` |
| `VITE_SUPABASE_URL` | frontend | URL Supabase projektu |
| `VITE_SUPABASE_ANON_KEY` | frontend | Supabase anon (public) klíč |
| `PORT` | backend | Port serveru, výchozí `3000` |
| `FRONTEND_URL` | backend | URL frontendu – CORS + share linky |
| `SUPABASE_URL` | backend | URL Supabase projektu |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Service role klíč (**tajný – pouze backend!**) |
| `JWT_SECRET` | backend | Supabase JWT secret pro validaci tokenů |
| `GOOGLE_PLACES_API_KEY` | backend | Google Places API klíč |
| `YR_NO_USER_AGENT` | backend | User-Agent pro yr.no API (povinný dle jejich podmínek) |
| `OPENAI_API_KEY` | backend | OpenAI API klíč pro AI generování itineráře |
| `OPENAI_MODEL` | backend | Model, výchozí `gpt-4o-mini` |

---

## Change validation checklist

Spusť před každým PR. Všechny příkazy musí skončit exit code 0.

```bash
# Frontend
cd frontend && npm run lint
cd frontend && npx tsc --noEmit
cd frontend && npm run test
cd frontend && npm run build

# Backend
cd backend && npm run lint
cd backend && npx tsc --noEmit
cd backend && npm run test
cd backend && npm run build

# Bezpečnostní check – service_role klíč nesmí být ve frontendu
grep -r "service_role" frontend/src/ && echo "CHYBA!" || echo "OK"

# .env soubory nesmí být commitnuty
git ls-files "*.env" | grep -v ".example" && echo "CHYBA: .env je v gitu!" || echo "OK"

# pokud se mění user flows:
cd frontend && npx playwright test
```

---

## Documentation hygiene

- **`README.md`** — pro lidi: přehled projektu, setup pro nováčky, architektonická rozhodnutí
- **`AGENTS.md`** (tento soubor) — pro agenty: přesné příkazy, cesty k souborům, pravidla chování

**Pravidlo: Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.**

---

## Troubleshooting

### Port je obsazený

```bash
cd frontend && VITE_PORT=5174 npm run dev
cd backend && PORT=3001 npm run start:dev
```

### Supabase JWT secret

Najdeš ho v Supabase Dashboard → Project Settings → API → JWT Secret. Zkopíruj do `backend/.env` jako `JWT_SECRET`.

### Backend testy selžou bez `.env`

Unit testy nemusí mít Supabase – mockuj `SupabaseService` v `.spec.ts`. Integrační testy vyžadují `SUPABASE_URL` a `SUPABASE_SERVICE_ROLE_KEY`.

### Vite HMR nefunguje přes síť (devcontainer, WSL)

Přidej do `frontend/vite.config.ts`:
```typescript
server: { host: '0.0.0.0' }
```

### `supabase db push` selže – klíč nenalezen

```bash
supabase login          # přihlásí tě do Supabase CLI
supabase link           # propojí lokální projekt se Supabase projektem
supabase db push
```
