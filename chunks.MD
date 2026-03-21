# Travio – Implementační chunky pro AI coding agenta

 #  │           Název            │                              Změna                               │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 1   │ Backend inicializace       │ beze změny                                                       │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 2   │ AGENTS.md                  │ beze změny                                                       │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 3   │ DB schéma + SupabaseModule │ beze změny                                                       │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 4   │ Trips API (bez auth)       │ dřív, endpointy veřejné, userId z dev headeru                    │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 5   │ Days API (bez auth)        │ dřív                                                             │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 6   │ Places API (bez auth)      │ dřív                                                             │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 7   │ Propojení FE–BE            │ dřív – frontend volá reálné API                                  │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 8   │ Google Places integrace    │ nezávislé                                                        │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 9   │ Počasí yr.no               │ nezávislé                                                        │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 10  │ Share link                 │ po Trips API                                                     │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 11  │ Autentizace                │ přidá JwtAuthGuard na existující endpointy, Supabase OAuth na FE │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 12  │ AI generování              │ na konci                                                         │
  ├─────┼────────────────────────────┼──────────────────────────────────────────────────────────────────┤                                                                             
  │ 13  │ Závěrečné testování        │ beze změny                                                       │
  └─────┴────────────────────────────┴──────────────────────────────────────────────────────────────────┘    


Repozitář má tuto strukturu:
- `frontend/` – hotový React + Vite frontend (generovaný v Lovable)
- `backend/` – zatím prázdná složka

Tech stack backendu: **NestJS** (Node.js), **Supabase** (PostgreSQL + Auth), REST API.

---

## CHUNK 1 – Inicializace NestJS backendu

### Popis
Vytvoř základní strukturu NestJS backendu ve složce `backend/`. Aplikace musí nastartovat, odpovídat na health-check endpoint a být připravena na připojení k Supabase.

### Co přesně udělej

1. Ve složce `backend/` inicializuj NestJS projekt:
   ```
   npm install -g @nestjs/cli
   nest new . --package-manager npm --skip-git
   ```
   Pokud `nest` CLI není k dispozici, vytvoř strukturu ručně.

2. Výsledná adresářová struktura `backend/`:
   ```
   backend/
   ├── src/
   │   ├── app.module.ts
   │   ├── app.controller.ts
   │   ├── app.service.ts
   │   └── main.ts
   ├── .env.example
   ├── .gitignore
   ├── package.json
   └── tsconfig.json
   ```

3. `src/main.ts` – spusť aplikaci na portu z `process.env.PORT` (výchozí 3000), povol CORS pro `http://localhost:5173` (Vite dev server):
   ```ts
   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' });
     app.setGlobalPrefix('api');
     await app.listen(process.env.PORT ?? 3000);
     console.log(`Backend běží na portu ${process.env.PORT ?? 3000}`);
   }
   bootstrap();
   ```

4. `src/app.controller.ts` – přidej health-check endpoint:
   ```ts
   @Get('health')
   health() {
     return { status: 'ok', timestamp: new Date().toISOString() };
   }
   ```

5. Nainstaluj tyto závislosti:
   ```json
   "dependencies": {
     "@nestjs/common": "^10.0.0",
     "@nestjs/core": "^10.0.0",
     "@nestjs/platform-express": "^10.0.0",
     "@nestjs/config": "^3.0.0",
     "@nestjs/jwt": "^10.0.0",
     "@nestjs/passport": "^10.0.0",
     "@supabase/supabase-js": "^2.0.0",
     "passport": "^0.6.0",
     "passport-jwt": "^4.0.0",
     "reflect-metadata": "^0.1.13",
     "rxjs": "^7.8.0"
   },
   "devDependencies": {
     "@nestjs/cli": "^10.0.0",
     "@types/node": "^20.0.0",
     "@types/passport-jwt": "^3.0.0",
     "typescript": "^5.0.0",
     "ts-node": "^10.9.0"
   }
   ```

6. Vytvoř `.env.example` s těmito proměnnými (BEZ skutečných hodnot):
   ```
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret
   ```

7. Přidej do `backend/.gitignore`:
   ```
   node_modules/
   dist/
   .env
   *.local
   ```

8. Přidej do kořenového `.gitignore` (pokud tam ještě není):
   ```
   backend/.env
   .env
   ```

9. Do `package.json` v `backend/` přidej skripty:
   ```json
   "scripts": {
     "start": "node dist/main",
     "start:dev": "nest start --watch",
     "build": "nest build",
     "test": "jest"
   }
   ```

### Soubory k vytvoření / úpravě
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/app.controller.ts`
- `backend/src/app.service.ts`
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.env.example`
- `backend/.gitignore`
- `.gitignore` (kořenový – doplnit)

### Testovací kritéria
- `cd backend && npm install && npm run start:dev` nastartuje bez chyb
- `curl http://localhost:3000/api/health` vrátí `{"status":"ok","timestamp":"..."}`
- `.env` soubor NENÍ commitnutý, `.env.example` ANO

### Závislosti
Žádné – toto je první chunk.

**Commitni a pushni změny.**

---

## CHUNK 2 – AGENTS.md soubory pro celý projekt

### Popis
Vytvoř dokumentační soubory `AGENTS.md` pro kořen projektu, `frontend/` a `backend/`. Tyto soubory slouží jako hlavní orientační bod pro AI coding agenty v budoucích konverzacích.

### Co přesně udělej

Vytvoř tyto 3 soubory s přesně tímto obsahem (upravuj jen konkrétní technické detaily pokud se liší od skutečnosti):

---

**`AGENTS.md`** (kořen repozitáře):

```markdown
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
npm run start:dev   # NestJS na http://localhost:3000
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
```

---

**`frontend/AGENTS.md`**:

```markdown
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

API base URL bere z `import.meta.env.VITE_API_URL` (výchozí `http://localhost:3000/api`).

## Pokud přidáš novou funkci, endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md.
```

---

**`backend/AGENTS.md`**:

```markdown
# Travio – AGENTS.md (backend)

## Tech stack
- NestJS 10 (Node.js + TypeScript)
- Supabase (PostgreSQL databáze + Auth)
- REST API, prefix `/api`
- JWT autentizace (Supabase tokeny)

## Jak spustit
```bash
npm install
cp .env.example .env    # Vyplň hodnoty (viz níže)
npm run start:dev       # http://localhost:3000
npm run build && npm run start   # produkční
npm run test            # Jest testy
```

## Environment proměnné (.env)
```
PORT=3000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...       # jen na backendu!
JWT_SECRET=...
GOOGLE_PLACES_API_KEY=...
YR_NO_USER_AGENT=travio/1.0 your@email.com
OPENAI_API_KEY=...                  # pro AI generování itineráře
```

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
| GET | /api/places/search?q= | Google Places autocomplete |
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
```

### Soubory k vytvoření
- `AGENTS.md` (kořen)
- `frontend/AGENTS.md`
- `backend/AGENTS.md`

### Testovací kritéria
- Všechny 3 soubory existují
- Každý obsahuje sekci „Jak spustit"
- Každý obsahuje instrukci o aktualizaci AGENTS.md
- `backend/AGENTS.md` obsahuje tabulku databázového schématu
- `backend/AGENTS.md` obsahuje tabulku API endpointů

### Závislosti
Chunk 1 (backend musí existovat jako složka).

**Commitni a pushni změny.**

---

## CHUNK 3 – Supabase databázové schéma + SupabaseModule

### Popis
Vytvoř SQL migraci pro databázové schéma v Supabase a sdílený `SupabaseModule` v NestJS, který ostatní moduly budou používat pro přístup k databázi.

### Co přesně udělej

1. Vytvoř soubor `backend/supabase/migrations/001_initial_schema.sql` s tímto SQL (viz schéma v `backend/AGENTS.md` – tabulky `trips`, `days`, `places`). Přidej také RLS politiky:
   ```sql
   -- Row Level Security
   ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
   ALTER TABLE days ENABLE ROW LEVEL SECURITY;
   ALTER TABLE places ENABLE ROW LEVEL SECURITY;

   -- Uživatel vidí jen své cesty
   CREATE POLICY "trips_owner" ON trips
     USING (user_id = auth.uid());

   -- Dny patří k cestě uživatele
   CREATE POLICY "days_owner" ON days
     USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

   -- Místa patří k cestě uživatele
   CREATE POLICY "places_owner" ON places
     USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

   -- Veřejné sdílení – read-only přes share_token
   CREATE POLICY "trips_shared_read" ON trips FOR SELECT
     USING (share_token IS NOT NULL);
   CREATE POLICY "days_shared_read" ON days FOR SELECT
     USING (trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL));
   CREATE POLICY "places_shared_read" ON places FOR SELECT
     USING (trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL));
   ```

2. Vytvoř `backend/src/supabase/supabase.module.ts` a `backend/src/supabase/supabase.service.ts`:
   ```ts
   // supabase.service.ts
   import { Injectable } from '@nestjs/common';
   import { ConfigService } from '@nestjs/config';
   import { createClient, SupabaseClient } from '@supabase/supabase-js';

   @Injectable()
   export class SupabaseService {
     private client: SupabaseClient;

     constructor(private config: ConfigService) {
       this.client = createClient(
         config.getOrThrow('SUPABASE_URL'),
         config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
       );
     }

     get db(): SupabaseClient { return this.client; }
   }
   ```

3. Zaregistruj `SupabaseModule` jako globální (`@Global()`) v `app.module.ts`.

4. Vytvoř `backend/src/supabase/database.types.ts` s TypeScript typy odpovídajícími databázovému schématu (typy `Trip`, `Day`, `Place` jako DB row typy).

### Soubory k vytvoření / úpravě
- `backend/supabase/migrations/001_initial_schema.sql`
- `backend/src/supabase/supabase.module.ts`
- `backend/src/supabase/supabase.service.ts`
- `backend/src/supabase/database.types.ts`
- `backend/src/app.module.ts` (import SupabaseModule, ConfigModule)

### Testovací kritéria
- `npm run build` v `backend/` proběhne bez TypeScript chyb
- `SupabaseService` je injectovatelný v jiných modulech
- SQL migrace je syntakticky validní (lze spustit v Supabase SQL editoru)

### Závislosti
Chunk 1, Chunk 2.

**Commitni a pushni změny.**

---

## CHUNK 4 – Autentizace (Google OAuth + JWT guard)

### Popis
Implementuj autentizaci přes Supabase Auth (Google OAuth). Backend validuje Supabase JWT tokeny a chrání privátní endpointy pomocí `JwtAuthGuard`.

### Co přesně udělej

1. Vytvoř `backend/src/auth/` modul s těmito soubory:
   - `auth.module.ts`
   - `auth.controller.ts`
   - `auth.service.ts`
   - `jwt.strategy.ts`
   - `jwt-auth.guard.ts`

2. `jwt.strategy.ts` – validuje Supabase JWT (Bearer token z hlavičky `Authorization`):
   ```ts
   import { Injectable, UnauthorizedException } from '@nestjs/common';
   import { PassportStrategy } from '@nestjs/passport';
   import { ExtractJwt, Strategy } from 'passport-jwt';
   import { ConfigService } from '@nestjs/config';

   @Injectable()
   export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor(config: ConfigService) {
       super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: config.getOrThrow('JWT_SECRET'), // = Supabase JWT secret
       });
     }

     async validate(payload: any) {
       if (!payload.sub) throw new UnauthorizedException();
       return { userId: payload.sub, email: payload.email };
     }
   }
   ```

3. `jwt-auth.guard.ts`:
   ```ts
   import { Injectable } from '@nestjs/common';
   import { AuthGuard } from '@nestjs/passport';

   @Injectable()
   export class JwtAuthGuard extends AuthGuard('jwt') {}
   ```

4. `auth.controller.ts` – přidej endpoint `GET /api/auth/me` (chráněný) který vrátí data přihlášeného uživatele z JWT payloadu.

5. Do `app.module.ts` importuj `PassportModule` a `AuthModule`.

6. Přidej do `backend/src/auth/` dekorátor `@CurrentUser()` pro pohodlné čtení user ID v controllerech:
   ```ts
   import { createParamDecorator, ExecutionContext } from '@nestjs/common';
   export const CurrentUser = createParamDecorator(
     (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
   );
   ```

### Soubory k vytvoření / úpravě
- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/jwt-auth.guard.ts`
- `backend/src/auth/current-user.decorator.ts`
- `backend/src/app.module.ts`

### Testovací kritéria
- `GET /api/auth/me` bez tokenu vrátí `401 Unauthorized`
- `GET /api/auth/me` s platným Supabase JWT vrátí `{ userId, email }`
- `npm run build` bez chyb
- Napiš Jest unit test pro `JwtStrategy.validate()`

### Závislosti
Chunk 1, Chunk 3.

**Commitni a pushni změny.**

---

## CHUNK 5 – CRUD cest (Trips API)

### Popis
Implementuj kompletní REST API pro správu cest: vytváření, čtení, editaci a mazání. Cesty jsou vždy vázány na přihlášeného uživatele.

### Co přesně udělej

1. Vytvoř `backend/src/trips/` modul:
   - `trips.module.ts`
   - `trips.controller.ts`
   - `trips.service.ts`
   - `dto/create-trip.dto.ts`
   - `dto/update-trip.dto.ts`

2. **DTO** (`create-trip.dto.ts`):
   ```ts
   export class CreateTripDto {
     name: string;           // povinné
     emoji: string;          // povinné, výchozí '✈️'
     dateFrom: string;       // ISO date "YYYY-MM-DD"
     dateTo: string;         // ISO date "YYYY-MM-DD"
     interests?: string[];   // volitelné (pro AI)
     useAi?: boolean;        // zda požádat o AI generování
   }
   ```

3. **`trips.service.ts`** – implementuj tyto metody:
   - `findAll(userId: string)` – vrátí všechny cesty uživatele (bez `days` a `places`, jen metadata)
   - `findOne(tripId: string, userId: string)` – vrátí cestu s `days` a `places` (nested)
   - `create(userId: string, dto: CreateTripDto)` – vytvoří cestu a automaticky vytvoří `days` záznamy pro každý den v rozsahu `dateFrom`–`dateTo` (včetně obou krajních dnů)
   - `update(tripId: string, userId: string, dto: UpdateTripDto)` – aktualizuje metadata; pokud se změní datum, přepočítá dny
   - `remove(tripId: string, userId: string)` – smaže cestu (cascade na dny a místa)

4. **`trips.controller.ts`** – endpointy:
   - `GET /api/trips` → `findAll`
   - `POST /api/trips` → `create`
   - `GET /api/trips/:id` → `findOne`
   - `PATCH /api/trips/:id` → `update`
   - `DELETE /api/trips/:id` → `remove`

   Všechny endpointy chráněny `@UseGuards(JwtAuthGuard)`. User ID bere z `@CurrentUser()`.

5. **Formát odpovědi** pro `GET /api/trips/:id`:
   ```json
   {
     "id": "uuid",
     "name": "New York",
     "emoji": "🗽",
     "dateFrom": "2026-04-15",
     "dateTo": "2026-04-22",
     "interests": [],
     "shareToken": null,
     "days": [
       {
         "id": "uuid",
         "date": "2026-04-15",
         "position": 0,
         "places": [ ...Place[] ]
       }
     ],
     "unassigned": [ ...Place[] ]
   }
   ```
   Pole `unassigned` = místa patřící k cestě kde `day_id IS NULL`, seřazena dle `position`.

6. Chybové stavy:
   - Neexistující cesta nebo cesta jiného uživatele → `404 Not Found`
   - Chybějící povinné pole → `400 Bad Request`

### Soubory k vytvoření / úpravě
- `backend/src/trips/trips.module.ts`
- `backend/src/trips/trips.controller.ts`
- `backend/src/trips/trips.service.ts`
- `backend/src/trips/dto/create-trip.dto.ts`
- `backend/src/trips/dto/update-trip.dto.ts`
- `backend/src/app.module.ts` (import TripsModule)

### Testovací kritéria
- `POST /api/trips` s platnými daty vytvoří cestu + odpovídající počet dnů v DB
- `GET /api/trips` vrátí seznam cest přihlášeného uživatele (ne cesty jiných)
- `GET /api/trips/:id` vrátí nested strukturu s `days` a `unassigned`
- `DELETE /api/trips/:id` smaže cestu i všechny záznamy dnů a míst
- Přístup k cizí cestě vrátí `404`
- Napiš Jest integrační testy (mock Supabase)

### Závislosti
Chunk 3, Chunk 4.

**Commitni a pushni změny.**

---

## CHUNK 6 – CRUD dnů (Days API)

### Popis
Implementuj endpointy pro přidávání a mazání dnů v cestě. Při smazání dne se místa automaticky přesunou do „volných" (unassigned).

### Co přesně udělej

1. Vytvoř `backend/src/days/` modul:
   - `days.module.ts`
   - `days.controller.ts`
   - `days.service.ts`

2. **`days.service.ts`**:
   - `addDay(tripId: string, userId: string)` – přidá nový den s datem navazujícím na poslední existující den cesty (poslední datum + 1 den), a aktualizuje `dateTo` cesty
   - `removeDay(tripId: string, dayId: string, userId: string)` – smaže den; všechna místa s tímto `day_id` nastaví na `day_id = NULL` (přesun do volných); poslední den cesty nelze smazat (vrátí `400`)

3. **`days.controller.ts`** – endpointy (všechny pod `@UseGuards(JwtAuthGuard)`):
   - `POST /api/trips/:id/days` → `addDay`
   - `DELETE /api/trips/:id/days/:dayId` → `removeDay`

4. Ověř, že uživatel vlastní cestu před každou operací (pomocí `TripsService.findOne`).

### Soubory k vytvoření / úpravě
- `backend/src/days/days.module.ts`
- `backend/src/days/days.controller.ts`
- `backend/src/days/days.service.ts`
- `backend/src/app.module.ts` (import DaysModule)

### Testovací kritéria
- `POST /api/trips/:id/days` přidá den s datem = poslední den + 1 a aktualizuje `dateTo`
- `DELETE /api/trips/:id/days/:dayId` smaže den a místa přesune do `day_id = NULL`
- Smazání posledního dne vrátí `400 Bad Request` s chybovou zprávou
- Přístup k cizí cestě vrátí `404`

### Závislosti
Chunk 5.

**Commitni a pushni změny.**

---

## CHUNK 7 – CRUD míst + přesun + řazení (Places API)

### Popis
Implementuj endpointy pro přidávání, editaci, mazání, přesun a řazení míst. Místo může být v konkrétním dni nebo „volné" (unassigned, `day_id = NULL`).

### Co přesně udělej

1. Vytvoř `backend/src/places/` modul:
   - `places.module.ts`
   - `places.controller.ts`
   - `places.service.ts`
   - `dto/create-place.dto.ts`
   - `dto/update-place.dto.ts`
   - `dto/move-place.dto.ts`
   - `dto/reorder-places.dto.ts`

2. **DTO**:
   ```ts
   // create-place.dto.ts
   export class CreatePlaceDto {
     name: string;
     dayId?: string;        // null/undefined = volné
     emoji?: string;
     address?: string;
     website?: string;
     lat?: number; lng?: number;
     openingHours?: string[];
     ticket?: 'none' | 'need' | 'have';
     priority?: 'must-see' | 'chci-videt' | 'mozna';
     timeFrom?: string; timeTo?: string;
     googlePlaceId?: string;
   }

   // move-place.dto.ts
   export class MovePlaceDto {
     targetDayId: string | null;  // null = přesunout do volných
   }

   // reorder-places.dto.ts
   export class ReorderPlacesDto {
     placeIds: string[];  // seřazené ID míst v novém pořadí
   }
   ```

3. **`places.service.ts`** – implementuj:
   - `create(tripId, userId, dto)` – přidá místo (na konec dne nebo volných)
   - `update(tripId, placeId, userId, dto)` – aktualizuje libovolné pole místa
   - `remove(tripId, placeId, userId)` – smaže místo
   - `move(tripId, placeId, userId, dto)` – přesune místo do jiného dne nebo do volných; nastaví `position` na konec cílového dne
   - `reorder(tripId, dayId, userId, dto)` – přenastaví `position` pro místa v daném dni podle pořadí v `placeIds`

4. **`places.controller.ts`** – endpointy:
   - `POST /api/trips/:id/places` → `create`
   - `PATCH /api/trips/:id/places/:placeId` → `update`
   - `DELETE /api/trips/:id/places/:placeId` → `remove`
   - `PATCH /api/trips/:id/places/:placeId/move` → `move`
   - `PATCH /api/trips/:id/days/:dayId/reorder` → `reorder`

5. Všechny endpointy chráněny `@UseGuards(JwtAuthGuard)`. Vždy ověř vlastnictví cesty.

### Soubory k vytvoření / úpravě
- `backend/src/places/places.module.ts`
- `backend/src/places/places.controller.ts`
- `backend/src/places/places.service.ts`
- `backend/src/places/dto/*.ts`
- `backend/src/app.module.ts`

### Testovací kritéria
- `POST /api/trips/:id/places` přidá místo s `day_id = null` (volné) i s `dayId`
- `PATCH /api/trips/:id/places/:placeId` aktualizuje pole `visited`, `note`, `priority`
- `DELETE /api/trips/:id/places/:placeId` smaže místo z DB
- `PATCH .../move` s `targetDayId: null` přesune místo do volných
- `PATCH .../reorder` přenastaví `position` dle zadaného pořadí
- Napiš Jest testy pro `move` a `reorder`

### Závislosti
Chunk 5, Chunk 6.

**Commitni a pushni změny.**

---

## CHUNK 8 – Google Places API integrace (autocomplete vyhledávání)

### Popis
Implementuj endpoint pro vyhledávání míst přes Google Places API (Text Search / Autocomplete). Frontend použije tento endpoint při psaní názvu místa do pole „Přidat místo".

### Co přesně udělej

1. Vytvoř `backend/src/external/google-places/` modul:
   - `google-places.module.ts`
   - `google-places.service.ts`
   - `google-places.controller.ts`

2. **`google-places.service.ts`** – implementuj `search(query: string)`:
   - Volej Google Places API **Text Search** (nebo Autocomplete):
     ```
     https://maps.googleapis.com/maps/api/place/textsearch/json
       ?query={query}&key={GOOGLE_PLACES_API_KEY}&language=cs
     ```
   - Pro nalezené místo volej **Place Details** aby ses dostal k opening hours:
     ```
     https://maps.googleapis.com/maps/api/place/details/json
       ?place_id={place_id}&fields=name,formatted_address,geometry,website,opening_hours,place_id
       &key={GOOGLE_PLACES_API_KEY}&language=cs
     ```
   - Odpověď mapuj na formát kompatibilní s `Place` typem frontendu:
     ```json
     {
       "googlePlaceId": "ChIJ...",
       "name": "Central Park",
       "address": "Central Park West, New York, NY",
       "lat": 40.7851, "lng": -73.9683,
       "website": "https://...",
       "openingHours": ["Po–Pá: 06:00–23:00"]
     }
     ```
   - Pokud API nic nenajde, vrať prázdné pole `[]` (ne chybu)

3. **`google-places.controller.ts`**:
   - `GET /api/places/search?q=central+park` → vrátí pole výsledků (max 5)
   - Tento endpoint je chráněný (`JwtAuthGuard`) – pouze přihlášení uživatelé mohou vyhledávat

4. Ošetři případ, kdy `GOOGLE_PLACES_API_KEY` není nastaven – vrátí `503 Service Unavailable` s popisnou chybou.

### Soubory k vytvoření / úpravě
- `backend/src/external/google-places/google-places.module.ts`
- `backend/src/external/google-places/google-places.service.ts`
- `backend/src/external/google-places/google-places.controller.ts`
- `backend/src/app.module.ts`
- `backend/.env.example` (přidej `GOOGLE_PLACES_API_KEY`)

### Testovací kritéria
- `GET /api/places/search?q=eiffel+tower` vrátí pole s alespoň 1 výsledkem (s reálným API klíčem)
- Bez API klíče endpoint vrátí `503` s čitelnou chybou
- Prázdný dotaz nebo nenalezené místo vrátí `[]` (ne 500)
- Napiš Jest unit test s mocknutým `fetch`/`axios`

### Závislosti
Chunk 4.

**Commitni a pushni změny.**

---

## CHUNK 9 – Počasí z yr.no

### Popis
Implementuj endpoint pro načítání předpovídaného / klimatologického počasí z yr.no API. Počasí se zobrazuje na kartičce cesty na dashboardu.

### Co přesně udělej

1. Vytvoř `backend/src/external/weather/` modul:
   - `weather.module.ts`
   - `weather.service.ts`
   - `weather.controller.ts`

2. **`weather.service.ts`** – implementuj `getWeather(lat: number, lng: number, date: string)`:
   - Volej yr.no **Compact forecast** endpoint:
     ```
     https://api.met.no/weatherapi/locationforecast/2.0/compact
       ?lat={lat}&lon={lng}
     ```
   - yr.no vyžaduje `User-Agent` hlavičku: nastav z `YR_NO_USER_AGENT` env proměnné
   - Z odpovědi vyfiltruj data pro daný `date` (nebo nejbližší dostupné datum)
   - Vrať zjednodušený objekt:
     ```json
     { "temp": 14, "icon": "⛅", "description": "Partly cloudy" }
     ```
   - Mapování yr.no `symbol_code` na emoji (implementuj základní mapping min. pro: `clearsky` → ☀️, `partlycloudy` → ⛅, `cloudy` → ☁️, `rain` → 🌧️, `snow` → ❄️, `thunder` → ⛈️)
   - Přidej in-memory cache (Map) s TTL 1 hodina – yr.no má rate-limit

3. **`weather.controller.ts`**:
   - `GET /api/weather?lat=48.8566&lng=2.3522&date=2026-07-10`
   - Veřejný endpoint (bez autentizace) – může být volán při načítání dashboardu

4. Ošetři chyby yr.no API – vrátí `null` místo pádu serveru.

### Soubory k vytvoření / úpravě
- `backend/src/external/weather/weather.module.ts`
- `backend/src/external/weather/weather.service.ts`
- `backend/src/external/weather/weather.controller.ts`
- `backend/src/app.module.ts`
- `backend/.env.example` (přidej `YR_NO_USER_AGENT`)

### Testovací kritéria
- `GET /api/weather?lat=40.71&lng=-74.01&date=2026-04-15` vrátí `{ temp, icon, description }`
- Při nedostupném yr.no endpoint vrátí `{ temp: null, icon: null }` (ne 500)
- Cache funguje – druhý dotaz se stejnými parametry nezavolá yr.no znovu (unit test)
- Napiš Jest unit test s mocknutým fetch

### Závislosti
Chunk 1.

**Commitni a pushni změny.**

---

## CHUNK 10 – Anonymní sdílení cesty (Share link)

### Popis
Implementuj funkci sdílení cesty přes anonymní odkaz. Kdokoli s odkazem si může cestu prohlédnout (read-only), bez přihlášení.

### Co přesně udělej

1. Přidej do `trips.service.ts` metody:
   - `generateShareToken(tripId: string, userId: string)` – vygeneruje náhodný token (16 znaků, URL-safe), uloží do `trips.share_token`, vrátí token
   - `findByShareToken(token: string)` – vrátí cestu (s `days` a `places`) pro veřejné čtení; vrátí `404` pokud token neexistuje

2. Přidej do `trips.controller.ts`:
   - `GET /api/trips/:id/share` (chráněný) → zavolá `generateShareToken`, vrátí `{ shareUrl: "https://travio.app/shared/{token}" }` (URL skládej z `FRONTEND_URL` env proměnné + `/shared/`)
   - `GET /api/shared/:token` (veřejný, bez auth) → zavolá `findByShareToken`, vrátí read-only data cesty

3. Formát odpovědi `/api/shared/:token` je stejný jako `GET /api/trips/:id` ale neobsahuje citlivá data (`user_id`, `share_token`).

4. Přidej `FRONTEND_URL` do `backend/.env.example` pokud tam ještě není.

### Soubory k vytvoření / úpravě
- `backend/src/trips/trips.service.ts` (přidat metody)
- `backend/src/trips/trips.controller.ts` (přidat endpointy)

### Testovací kritéria
- `GET /api/trips/:id/share` vrátí `{ shareUrl }` a uloží token do DB
- `GET /api/shared/{token}` vrátí data cesty bez autentizace
- Neplatný token vrátí `404`
- Opakované volání `GET /api/trips/:id/share` vrátí stejný token (neregeneruje)
- Frontend stránka `/shared/:token` (existuje v `frontend/src/pages/SharedTrip.tsx`) zobrazí data – ověř vizuálně

### Závislosti
Chunk 5.

**Commitni a pushni změny.**

---

## CHUNK 11 – AI generování itineráře

### Popis
Implementuj volitelné AI generování startovní kostry itineráře při vytváření cesty. Pokud uživatel zaškrtne „Pomoc od AI", backend zavolá OpenAI API a vrátí seznam navrhovaných míst.

### Co přesně udělej

1. Vytvoř `backend/src/external/ai/` modul:
   - `ai.module.ts`
   - `ai.service.ts`
   - `ai.controller.ts`

2. **`ai.service.ts`** – implementuj `generateItinerary(params)`:
   ```ts
   interface AiParams {
     destination: string;   // název destinace
     dateFrom: string;      // "YYYY-MM-DD"
     dateTo: string;
     interests: string[];   // zájmy uživatele (ze štítků)
   }
   ```
   - Zavolej OpenAI Chat API (`gpt-4o-mini` nebo `gpt-4o`):
     - Model: použij `process.env.OPENAI_MODEL ?? 'gpt-4o-mini'`
     - System prompt: „Jsi průvodce cestovního plánování. Generuješ konkrétní seznam zajímavých míst..."
     - User prompt: obsahuje destinaci, počet dní, zájmy uživatele
     - Požaduj JSON odpověď se strukturou:
       ```json
       {
         "places": [
           {
             "name": "Central Park",
             "dayIndex": 0,
             "emoji": "🌳",
             "note": "Ranní procházka",
             "priority": "must-see"
           }
         ]
       }
       ```
   - Vrať pole navrhovaných míst – volající (`trips.service.ts`) je uloží do DB

3. V `trips.service.ts` – při `create()` pokud `dto.useAi === true`:
   - Po vytvoření cesty a dnů zavolej `AiService.generateItinerary()`
   - Výsledná místa ulož přes `PlacesService.create()` do příslušných dnů

4. **`ai.controller.ts`**:
   - `POST /api/trips/:id/ai-generate` (chráněný) – pro doplnění AI návrhu do existující cesty

5. Ošetři:
   - `OPENAI_API_KEY` není nastaven → vrátí `503`
   - AI vrátí nevalidní JSON → loguj chybu, vrátí prázdný seznam míst (ne 500)

### Soubory k vytvoření / úpravě
- `backend/src/external/ai/ai.module.ts`
- `backend/src/external/ai/ai.service.ts`
- `backend/src/external/ai/ai.controller.ts`
- `backend/src/trips/trips.service.ts` (volání AI při create)
- `backend/src/app.module.ts`
- `backend/.env.example` (přidej `OPENAI_API_KEY`, `OPENAI_MODEL`)

### Testovací kritéria
- `POST /api/trips/:id/ai-generate` vrátí seznam míst přidaných do dnů
- Bez `OPENAI_API_KEY` vrátí `503` s popisnou chybou
- Nevalidní AI odpověď nezpůsobí 500 – vrátí prázdný seznam
- Napiš Jest unit test s mocknutým OpenAI klientem

### Závislosti
Chunk 5, Chunk 7.

**Commitni a pushni změny.**

---

## CHUNK 12 – Propojení frontendu s backendem

### Popis
Nahraď mock data v `TripContext.tsx` skutečnými API voláními na NestJS backend. Frontend musí fungovat end-to-end: přihlášení přes Supabase, CRUD cest/dnů/míst, vyhledávání míst, počasí.

### Co přesně udělej

1. Do `frontend/` nainstaluj Supabase klienta:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Vytvoř `frontend/src/lib/supabase.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
   );
   ```

3. Vytvoř `frontend/.env.example`:
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   Přidej `frontend/.env` do `.gitignore`.

4. Vytvoř `frontend/src/api/` složku s těmito soubory:

   **`frontend/src/api/client.ts`** – HTTP klient, automaticky přidává JWT token:
   ```ts
   import { supabase } from '../lib/supabase';

   const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

   export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
     const session = await supabase.auth.getSession();
     const token = session.data.session?.access_token;
     const res = await fetch(`${BASE_URL}${path}`, {
       ...options,
       headers: {
         'Content-Type': 'application/json',
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
         ...options?.headers,
       },
     });
     if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
     return res.json();
   }
   ```

   **`frontend/src/api/trips.ts`**:
   ```ts
   import { apiFetch } from './client';
   import { Trip } from '../data/mockData';

   export const getTrips = () => apiFetch<Trip[]>('/trips');
   export const getTrip = (id: string) => apiFetch<Trip>(`/trips/${id}`);
   export const createTrip = (data: Partial<Trip>) =>
     apiFetch<Trip>('/trips', { method: 'POST', body: JSON.stringify(data) });
   export const updateTrip = (id: string, data: Partial<Trip>) =>
     apiFetch<Trip>(`/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
   export const deleteTrip = (id: string) =>
     apiFetch(`/trips/${id}`, { method: 'DELETE' });
   export const shareTrip = (id: string) =>
     apiFetch<{ shareUrl: string }>(`/trips/${id}/share`);
   ```

   **`frontend/src/api/days.ts`**, **`frontend/src/api/places.ts`** – analogicky.

   **`frontend/src/api/weather.ts`**:
   ```ts
   export const getWeather = (lat: number, lng: number, date: string) =>
     fetch(`${import.meta.env.VITE_API_URL}/weather?lat=${lat}&lng=${lng}&date=${date}`)
       .then(r => r.json());
   ```

   **`frontend/src/api/search.ts`**:
   ```ts
   import { apiFetch } from './client';
   export const searchPlaces = (q: string) =>
     apiFetch<any[]>(`/places/search?q=${encodeURIComponent(q)}`);
   ```

5. **Uprav `frontend/src/context/TripContext.tsx`**:
   - Nahraď počáteční stav `mockTrips` voláním `getTrips()` v `useEffect`
   - Všechny mutace (`addTrip`, `updateTrip`, `deleteTrip`, `addPlaceToDay`, `movePlace`, `reorderPlaces`, `updatePlace`, `deletePlace`, `addDayToTrip`, `removeDayFromTrip`) volej odpovídající API funkci a po úspěchu aktualizuj lokální stav
   - Přidej stavy `loading: boolean` a `error: string | null`

6. **Uprav `frontend/src/pages/Login.tsx`** – přidej tlačítko „Přihlásit se přes Google":
   ```ts
   await supabase.auth.signInWithOAuth({ provider: 'google' });
   ```

7. **Uprav `frontend/src/components/AddPlaceSheet.tsx`** – při psaní do search pole volej `searchPlaces(query)` místo filtrování `mockPlaceSuggestions`.

8. **Uprav `frontend/src/pages/Dashboard.tsx`** – při načtení cest zavolej `getWeather()` pro každou cestu a zobraz skutečné počasí.

9. **Skeleton loading**: Pokud `loading === true` v TripContext, zobraz shadcn `<Skeleton>` komponenty místo dat.

### Soubory k vytvoření / úpravě
- `frontend/src/lib/supabase.ts` (nový)
- `frontend/src/api/client.ts` (nový)
- `frontend/src/api/trips.ts` (nový)
- `frontend/src/api/days.ts` (nový)
- `frontend/src/api/places.ts` (nový)
- `frontend/src/api/weather.ts` (nový)
- `frontend/src/api/search.ts` (nový)
- `frontend/src/context/TripContext.tsx` (upravit)
- `frontend/src/pages/Login.tsx` (upravit)
- `frontend/src/pages/Dashboard.tsx` (upravit)
- `frontend/src/components/AddPlaceSheet.tsx` (upravit)
- `frontend/.env.example` (nový)
- `.gitignore` (přidat `frontend/.env`)

### Testovací kritéria
- Po přihlášení přes Google se zobrazí dashboard se skutečnými cestami z DB
- Vytvoření nové cesty přes UI uloží data do Supabase
- Přidání místa do dne se projeví po refreshi stránky
- Vyhledávání míst v `AddPlaceSheet` vrací výsledky z Google Places
- Na kartičkách cest se zobrazuje počasí (nebo skeleton při načítání)
- `mockData.ts` se v aplikaci nadále importuje jen pro TypeScript typy, ne pro data

### Závislosti
Chunky 5, 6, 7, 8, 9, 10.

**Commitni a pushni změny.**

---

## CHUNK 13 – Google Maps – mapové podklady

### Popis
Nahraď mock `TripMapView` komponentu skutečnou interaktivní mapou postavenou na Google Maps JavaScript API (`@vis.gl/react-google-maps`). Mapa zobrazuje piny míst pro aktuální den, propojuje je čarou, reaguje na klik na pin a synchronizuje se s horizontálním stripem karet dole (mobil) / postranním panelem (desktop).

### Co přesně udělej

1. Nainstaluj závislosti:
   ```bash
   cd frontend
   npm install @vis.gl/react-google-maps
   ```

2. Přidej Google Maps API klíč do `frontend/.env.example`:
   ```
   VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
   ```
   Klíč je **veřejný** (omezený na HTTP referrery) – bezpečné ho mít jako `VITE_` proměnnou.
   Stejný klíč jako `GOOGLE_PLACES_API_KEY` na backendu – ale ten frontendový musí mít povolenou **Maps JavaScript API**.

3. **Přepiš `frontend/src/components/TripMapView.tsx`** – nahraď mock implementaci skutečnou Google mapou:

   - Obal komponentu `<APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>` z `@vis.gl/react-google-maps`
   - Renderuj `<Map>` komponentu s `mapId` (nebo výchozím stylem), `defaultZoom={12}`
   - Přidej **piny** pro každé místo aktuálního dne (kde `lat` a `lng` jsou definovány):
     - Použij `<AdvancedMarker>` z `@vis.gl/react-google-maps` s custom HTML elementem – zobrazí číslo pořadí a emoji místa
     - Barva markeru odpovídá prioritě (stejné barvy jako v `priorityConfig` z `mockData.ts`)
     - Visited místo = snížená opacita markeru (50 %)
   - Přidej **čáru** mezi místy ve správném pořadí:
     - Použij `<Polyline>` z `@vis.gl/react-google-maps` se `strokeColor: '#00798c'`, `strokeWeight: 2`, `strokeOpacity: 0.7`, `icons` pro přerušovanou čáru
   - Po kliknutí na marker:
     - Zvýrazni odpovídající kartu v horizontálním stripu (přidej CSS třídu `ring-2 ring-primary`)
     - Zavolej callback `onPlaceSelect(placeId)` (předávaný jako prop)
   - **Auto-fit bounds**: při změně dne nebo seznamu míst uprav zoom/střed mapy tak, aby všechna místa aktuálního dne byla viditelná – použij `useMap()` hook a `map.fitBounds()`
   - Zpracuj případ, kdy místa nemají souřadnice: marker nepřidávej, zobraz placeholder text na kartě místo adresy

4. **Zachovej stávající props rozhraní** `TripMapView` (přijímá `trip`, `selectedDayId`, `onPlaceSelect`) – ostatní komponenty nesmí potřebovat úpravy.

5. **Uprav `frontend/src/pages/TripDetail.tsx`** – pokud Google Maps klíč není nastaven (`!import.meta.env.VITE_GOOGLE_MAPS_KEY`), zobraz informativní placeholder místo mapy (ne crash):
   ```tsx
   <div className="flex items-center justify-center h-full text-muted-foreground">
     Google Maps klíč není nastaven (VITE_GOOGLE_MAPS_KEY)
   </div>
   ```

### Soubory k vytvoření / úpravě
- `frontend/src/components/TripMapView.tsx` (přepsat)
- `frontend/src/pages/TripDetail.tsx` (přidat fallback)
- `frontend/.env.example` (přidat `VITE_GOOGLE_MAPS_KEY`)
- `frontend/package.json` (nová závislost)

### Testovací kritéria
- V pohledu Mapa se zobrazuje skutečná Google mapa (ne mock)
- Piny jsou viditelné pro místa s `lat`/`lng`, správně obarvené dle priority
- Kliknutí na pin zvýrazní odpovídající kartu ve stripu
- Přepnutí dne (day pill) aktualizuje piny a přizpůsobí zoom
- Místa bez souřadnic nejsou příčinou pádu – mapa se zobrazí bez jejich pinů
- Bez `VITE_GOOGLE_MAPS_KEY` se zobrazí placeholder, ne JS chyba
- `cd frontend && npm run build` proběhne bez chyb

### Závislosti
Chunk 12 (propojení FE–BE, aby mapa dostávala reálné souřadnice z Google Places).

**Commitni a pushni změny.**

---

## CHUNK 14 – Závěrečné testování a dokončení

### Popis
Projdi celou aplikaci, oprav případné chyby, doplň chybějící testy a ověř, že všechny MVP funkce fungují end-to-end.

### Co přesně udělej

1. **Backend testy** – spusť `cd backend && npm run test`. Oprav všechny selhávající testy. Zkontroluj pokrytí těchto scénářů:
   - Vytvoření cesty s automatickým generováním dnů
   - Smazání dne přesune místa do volných
   - Přesun místa do jiného dne
   - Reorder míst v rámci dne
   - Sdílení cesty přes token
   - Auth guard blokuje neoprávněný přístup

2. **Frontend testy** – spusť `cd frontend && npm run test`. Oprav selhávající testy.

3. **End-to-end kontrola MVP funkcí** – ručně ověř (nebo napiš Playwright testy do `frontend/src/test/`):
   - [ ] Registrace / přihlášení přes Google OAuth
   - [ ] Vytvoření cesty (s datumy, emoji, bez AI)
   - [ ] Vytvoření cesty s AI návrhem itineráře
   - [ ] Přidání místa do konkrétního dne (přes Google Places autocomplete)
   - [ ] Přidání místa do „Volných"
   - [ ] Přesun místa do jiného dne
   - [ ] Změna pořadí míst v rámci dne
   - [ ] Označení místa jako navštíveného
   - [ ] Smazání dne (místa přesunuta do volných)
   - [ ] Sdílení cesty přes anonymní odkaz
   - [ ] Zobrazení sdílené cesty bez přihlášení
   - [ ] Přepínání pohledu Seznam / Mapa
   - [ ] Kliknutí na avatar zobrazí dropdown s jménem, emailem a tlačítkem odhlášení
   - [ ] Odhlášení přesměruje na Login stránku (`/`)
   - [ ] Přímý přístup na `/app` bez přihlášení přesměruje na `/`
   - [ ] Avatar v Dashboardu i TripDetail zobrazuje skutečnou profilovou fotku z Google účtu

4. **Chybové stavy** – ověř:
   - Výpadek externího API → zobrazí se chybová hláška, ne white screen
   - Prázdný stav (0 cest) → zobrazí se „Zatím nemáte žádné výlety"
   - Pomalé načítání → zobrazí se skeleton loading

5. **Bezpečnostní kontrola**:
   - Spusť `git log --all -- "*.env"` – `.env` soubory nesmí být v historii
   - Ověř, že `SUPABASE_SERVICE_ROLE_KEY` se nikde nenachází v `frontend/` kódu: `grep -r "service_role" frontend/src/`
   - Ověř, že všechny privátní endpointy vrátí `401` bez tokenu

6. **Aktualizuj AGENTS.md soubory** – doplň vše, co se změnilo oproti původnímu návrhu (nové endpointy, změny schématu, nové env proměnné).

7. **Aktualizuj kořenový `README.md`** – přidej sekce:
   - Jak lokálně spustit celý projekt
   - Jak nastavit Supabase (odkaz na migraci)
   - Jak nastavit Google OAuth v Supabase
   - Požadované env proměnné (seznam, ne hodnoty)

### Soubory k vytvoření / úpravě
- `frontend/src/test/*.test.ts` (nové nebo upravené testy)
- `backend/src/**/*.spec.ts` (opravené testy)
- `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` (aktualizace)
- `README.md` (aktualizace)

### Testovací kritéria
- `cd backend && npm run test` – všechny testy zelené
- `cd frontend && npm run test` – všechny testy zelené
- `cd frontend && npm run build` – produkční build bez chyb a TypeScript warningů
- Všech 16 bodů MVP checklistu výše je zaškrtnuto
- `.env` soubory nejsou v git historii

### Závislosti
Chunky 1–13 + Chunk 15 (Uživatelský profil a odhlášení).

---

## CHUNK 15 – Uživatelský profil a odhlášení

### Popis
Přidej uživatelský profil a možnost odhlášení. V současné době se uživatel nemůže odhlásit, což znemožňuje přepnutí účtu nebo řešení session problémů.

### Co přesně udělej

1. **Dashboard – avatar a odhlášení**:
   - Nahraď placeholder `"U"` avatar v pravém horním rohu skutečným avatarem z Google účtu (Supabase `session.user.user_metadata.avatar_url`)
   - Kliknutí na avatar otevře dropdown menu s:
     - Jménem a emailem uživatele
     - Tlačítkem „Odhlásit se"
   - Odhlášení zavolá `supabase.auth.signOut()` a přesměruje na `/`

2. **TripDetail – stejný avatar**:
   - Přidej stejný avatar/dropdown do hlavičky TripDetail (desktop i mobile)

3. **Auth redirect**:
   - Po odhlášení přesměruj na Login stránku
   - Pokud uživatel přijde na `/app` bez session, přesměruj na `/`

### Soubory k vytvoření / úpravě
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/TripDetail.tsx`
- `frontend/src/components/UserAvatar.tsx` (nová komponenta – avatar + dropdown)
- `frontend/src/App.tsx` nebo router (auth guard pro `/app` routy)

### Testovací kritéria
- Kliknutím na avatar se zobrazí dropdown s jménem, emailem a tlačítkem odhlášení
- Po odhlášení je uživatel přesměrován na Login stránku
- Přímý přístup na `/app` bez přihlášení přesměruje na `/`

### Závislosti
CHUNK 12 (auth + TripContext).

**Commitni a pushni změny.**
