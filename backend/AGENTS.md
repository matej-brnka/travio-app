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

GOOGLE_PLACES_API_KEY=...
YR_NO_USER_AGENT=travio/1.0 your@email.com

# LLM / AI Configuration
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

## Poznámky k autentizaci
- Supabase nově vydává tokeny s algoritmem **ES256** (asymetrické klíče)
- Backend validuje tokeny přes **JWKS endpoint**: `${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json`
- Používá balíček `jwks-rsa` s `passportJwtSecret`
- `JWT_SECRET` se nepoužívá – validace probíhá výhradně přes JWKS

## Databázové schéma (Supabase / PostgreSQL)

```sql
-- Uživatelé jsou spravováni Supabase Auth (tabulka auth.users)

CREATE TABLE trips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,          -- název destinace (např. "Praha")
  title        TEXT,                   -- volitelný uživatelský název výletu (např. "Líbánky 2026")
  emoji        TEXT NOT NULL DEFAULT '✈️',
  date_from    DATE NOT NULL,
  date_to      DATE NOT NULL,
  interests    TEXT[],
  share_token  TEXT UNIQUE,            -- pro anonymní sdílení
  center_lat   FLOAT,                  -- souřadnice primární destinace (z Google Places)
  center_lng   FLOAT,
  destinations JSONB,                  -- pole { name, lat, lng, viewport... } pro multi-destinaci
  -- TODO migrace: viewport_north, viewport_south, viewport_east, viewport_west FLOAT
  -- (zatím jen ve frontend Trip modelu, do DB zatím nepersistováno)
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE days (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id           UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  position          INT NOT NULL DEFAULT 0,
  destination_index INT DEFAULT 0,     -- index do trips.destinations (která destinace daný den)
  created_at        TIMESTAMPTZ DEFAULT now()
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

CREATE TABLE llm_calls (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '{}'::jsonb,
  messages JSONB NOT NULL,
  response_content TEXT,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## LLM Architektura (external/llm)
Aplikace používá abstrakční vrstvu pro komunikaci s LLM modely.
- **LlmProvider** (interface): Definuje metodu `generateCompletion`.
- **OpenAiProvider**: Konkrétní implementace pro OpenAI API. Používá `fetch` a konfiguraci z `.env`.
- **LlmService**: Jednotný vstupní bod pro zbytek aplikace. Umožňuje snadnou záměnu providera.
  - `generateCompletion(messages, options)`: Základní textový výstup.
  - `generateJson<T>(messages, options)`: Vrátí typovaný JSON objekt (využívá `response_format: json_object`).
- **LlmCallsService**: Persistuje OpenAI call log do DB (`llm_calls`) včetně `messages` a token usage.
- Log obsahuje také `response_content` (1:1 text odpovědi modelu).
- **Prompty**: Prompty jsou vyčleněny do samostatných souborů (např. `ai.prompts.ts`) pro snadnou úpravu bez nutnosti měnit logiku services.

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
| PATCH | /api/trips/:id/days/:dayId/destination | Změna destinace dne (`{ destinationIndex }`) |
| GET | /api/trips/:id/share | Vygeneruj/vrať share token; URL sestavena z `FRONTEND_URL` env + `/share/:token` |
| GET | /api/shared/:token | Veřejný read-only detail cesty (bez auth); vrací trip + days + places + centerLat/Lng |
| GET | /api/places/search?q=&centerLat=&centerLng= | Vyhledávání míst (location bias) |
| GET | /api/places/search-destinations?q= | Vyhledávání destinací – vrací `{ name, description, placeId, lat, lng, viewport: { north, south, east, west } }` |
| GET | /api/places/photo?googlePlaceId= | Proxy fotky z Google Places (Place Details → photo_reference → obrázek); Cache-Control 1 den |
| GET | /api/weather?lat=&lng=&date= | Počasí z yr.no (legacy, single-day) |
| GET | /api/weather/trip?lat=&lng=&dateFrom=&dateTo= | Počasí pro celou cestu – forecast (yr.no, ≤9 dní) nebo historical (Open-Meteo, >9 dní); vrací `{ summary: { temp, icon, type }, days: [{ date, temp, tempMin, icon }] }` |
| POST | /api/trips/:id/ai-generate | AI generování itineráře (včetně `ticket: need|none` pro místa) |
| GET | /api/llm/calls?limit=100 | Servisní log OpenAI (prompt/messages + 1:1 response + token usage), aktuálně bez auth guardu pro test |

## Důležité poznámky k pg / DATE typům
- `pg` (node-postgres) defaultně parsuje DATE sloupce jako JS `Date` objekty s lokální půlnocí
- V CET (UTC+1) se `"2026-03-22"` stane `Date{2026-03-21T23:00:00Z}` → `toISOString()` vrátí špatné datum
- **Fix**: `SupabaseService` nastavuje `types.setTypeParser(1082, val => val)` – DATE sloupce se vracejí jako plain stringy `"YYYY-MM-DD"`
- `trips.service.ts` obsahuje navíc `normDate()` helper jako pojistku pro případ Date objektu

## Struktura NestJS modulů
```
src/
├── auth/           # AuthModule – Google OAuth, JWT guard
├── trips/          # TripsModule – CRUD cest
├── days/           # DaysModule – CRUD dnů
├── places/         # PlacesModule – CRUD míst, přesun, řazení
├── external/
│   ├── weather/    # WeatherModule – yr.no + Open-Meteo (blending forecast + historical)
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

## Editace termínu cesty (trips.service.ts – update)
- Zachovává existující dny (nemaže a nepřidává znovu)
- Místa z dní mimo nový rozsah přesune do unassigned (`day_id = NULL`)
- Dny mimo rozsah smaže, chybějící dny přidá (`WHERE NOT EXISTS`)
- Pozice dnů přepočítá dle data
- Normalizuje DATE hodnoty z pg před SQL dotazy (ochrana proti timezone posunu)

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
