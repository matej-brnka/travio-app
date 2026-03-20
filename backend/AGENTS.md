# Travio – AGENTS.md (backend)

## Tech stack
- NestJS 11 (Node.js + TypeScript)
- Supabase (PostgreSQL databáze + Auth)
- REST API, prefix `/api`
- JWT autentizace (Supabase tokeny)

## Jak spustit
```bash
npm install
cp .env.example .env    # Vyplň hodnoty (viz níže)
npm run start:dev       # http://localhost:3123
npm run build && npm run start   # produkční
npm run test            # Jest testy
```

## Environment proměnné (.env)
```
PORT=3123
FRONTEND_URL=http://localhost:8080

# Supabase connection pooler (Project Settings → Database → Transaction pooler)
SUPABASE_URL=aws-1-eu-west-1.pooler.supabase.com
SUPABASE_PORT=6543
SUPABASE_DATABASE=postgres
SUPABASE_USER=postgres.your-project-ref
SUPABASE_SERVICE_ROLE_KEY=...       # DB heslo, jen na backendu!

# Supabase project URL (pro JWKS JWT validaci)
SUPABASE_PROJECT_URL=https://your-project-ref.supabase.co

# JWT_SECRET zachován pro zpětnou kompatibilitu, ale validace probíhá přes JWKS (ES256)
JWT_SECRET=...

GOOGLE_PLACES_API_KEY=...
YR_NO_USER_AGENT=travio/1.0 your@email.com
OPENAI_API_KEY=...                  # pro AI generování itineráře
OPENAI_MODEL=gpt-4o-mini
```

## Poznámky k autentizaci
- Supabase nově vydává tokeny s algoritmem **ES256** (asymetrické klíče)
- Backend validuje tokeny přes **JWKS endpoint**: `${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json`
- Používá balíček `jwks-rsa` s `passportJwtSecret`
- `JWT_SECRET` v `.env` již není potřeba pro validaci, ale může být zachován

## Databázové schéma (Supabase / PostgreSQL)

```sql
-- Uživatelé jsou spravováni Supabase Auth (tabulka auth.users)

CREATE TABLE trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '✈️',
  date_from   DATE NOT NULL,
  date_to     DATE NOT NULL,
  interests   TEXT[],
  share_token TEXT UNIQUE,           -- pro anonymní sdílení
  center_lat  FLOAT,                 -- souřadnice destinace (z Google Places)
  center_lng  FLOAT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE days (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id   UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE places (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id        UUID REFERENCES days(id) ON DELETE SET NULL,  -- NULL = volné
  name          TEXT NOT NULL,
  emoji         TEXT,
  address       TEXT,
  website       TEXT,
  lat           FLOAT,
  lng           FLOAT,
  opening_hours TEXT[],
  ticket        TEXT CHECK (ticket IN ('none','need','have')),
  visited       BOOLEAN NOT NULL DEFAULT false,
  note          TEXT,
  priority      TEXT CHECK (priority IN ('must-see','chci-videt','mozna')),
  time_from     TEXT,
  time_to       TEXT,
  position      INT NOT NULL DEFAULT 0,
  google_place_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

## API endpointy (přehled)

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | /api/health | Health check |
| POST | /api/auth/google | Google OAuth callback |
| GET | /api/trips | Seznam cest přihlášeného uživatele |
| POST | /api/trips | Vytvoření nové cesty |
| GET | /api/trips/:id | Detail cesty |
| PATCH | /api/trips/:id | Editace cesty |
| DELETE | /api/trips/:id | Smazání cesty |
| POST | /api/trips/:id/days | Přidání dne |
| DELETE | /api/trips/:id/days/:dayId | Smazání dne |
| POST | /api/trips/:id/places | Přidání místa |
| PATCH | /api/trips/:id/places/:placeId | Editace místa |
| DELETE | /api/trips/:id/places/:placeId | Smazání místa |
| PATCH | /api/trips/:id/places/:placeId/move | Přesun místa do jiného dne |
| PATCH | /api/trips/:id/days/:dayId/reorder | Změna pořadí míst |
| GET | /api/trips/:id/share | Vygeneruj/vrať share token |
| GET | /api/shared/:token | Veřejný read-only detail cesty |
| GET | /api/places/search?q=&centerLat=&centerLng= | Vyhledávání míst (location bias) |
| GET | /api/places/search-destinations?q= | Vyhledávání destinací (města, státy, regiony) |
| GET | /api/weather?lat=&lng=&date= | Počasí z yr.no |
| POST | /api/trips/:id/ai-generate | AI generování itineráře |

## Struktura NestJS modulů
```
src/
├── auth/           # AuthModule – Google OAuth, JWT guard
├── trips/          # TripsModule – CRUD cest
├── days/           # DaysModule – CRUD dnů
├── places/         # PlacesModule – CRUD míst, přesun, řazení
├── external/
│   ├── weather/    # WeatherModule – yr.no
│   ├── google-places/ # GooglePlacesModule
│   └── ai/         # AiModule – generování itineráře
├── supabase/       # SupabaseModule – shared Supabase client
├── app.module.ts
└── main.ts
```

## Jak přidat nový endpoint
1. Vytvoř nebo najdi příslušný modul v `src/`
2. Přidej metodu do controlleru s dekorátorem (`@Get`, `@Post`, atd.)
3. Implementuj business logiku v service
4. Supabase client injektuj přes `SupabaseService`
5. Chráněné endpointy označ `@UseGuards(JwtAuthGuard)`
6. Napiš Jest test do `*.spec.ts` souboru
7. **Aktualizuj tuto tabulku endpointů výše**

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
