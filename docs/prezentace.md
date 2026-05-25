# Travio – Prezentace projektu

## Idea

**Travio** je mobilní-first webová aplikace pro plánování cestovních itinerářů.

Cílový uživatel: cestovatel mladší generace, který chce mít přehledně naplánováno, která místa chce v dané destinaci navštívit, aniž by musel žonglovat se zápisníky, tabulkami nebo generickými poznámkovými bloky.

Uživatel zadá destinaci a termín cesty → aplikace automaticky vygeneruje strukturu dnů → uživatel přidává místa, řadí je, přesouvá, označuje jako navštívená. Volitelně si nechá kostru itineráře sestavit AI. Cestu může anonymním odkazem sdílet přátelům (read-only, stejně jako Google Drive).

---

## Design System

### Barvy

| Token | HEX | Použití |
|-------|-----|---------|
| **Primary** | `#00798c` | Hlavní tlačítka, aktivní prvky, piny na mapě |
| **Accent** | `#edae49` | CTA, hvězdičky, důležité tagy |
| **Destructive** | `#d1495b` | Must-see priorita, smazání, varování |
| **Background** | `#f5f5f5` (96% white) | Pozadí stránky |
| **Foreground** | `#003d5b` | Primární text |
| **Muted foreground** | `#30638e` (cca) | Sekundární text, popisky |
| **Card** | `#ffffff` | Pozadí karet |
| **Border** | `#dde3ea` (cca) | Okraje, oddělovače |

### Priority míst (barevné kódování)

| Priorita | Barva | Tag |
|----------|-------|-----|
| 🔥 Must see! | `destructive` (#d1495b) | červená |
| ⭐ Chci vidět | `accent` (#edae49) | zlatá |
| 🤷 Když zbyde čas | `muted` (#30638e) | šedá |

### Typografie

- **Font:** DM Sans (Google Fonts)
- **Váhy:** 400 (regular), 500 (medium), 700 (bold)
- **Styl:** Optická velikost 9–40 px, podpora kurzívy

### Zaoblení (border-radius)

| Třída | Hodnota |
|-------|---------|
| `rounded-lg` | `1rem` (16 px) – výchozí |
| `rounded-md` | `0.75rem` (12 px) |
| `rounded-sm` | `0.5rem` (8 px) |

### Stíny

- **Karty:** `0 2px 12px rgba(0, 61, 91, 0.08)` – jemný modrošedý stín

### Animace

| Název | Popis |
|-------|-------|
| `slide-up` | 0.3s ease-out – modaly a sheety z dolního okraje |
| `accordion-down/up` | 0.2s ease-out – collapsible sekce |

### Vizuální styl

- Moderní a minimalistický
- Mobilní UI – velké dotykové plochy, horizontální scroll karet dole
- Hravý tón komunikace (emoji v názvech cest i místech)
- Mapa jako primární vizuální prvek (fullscreen Google Maps)

---

## Stack

| Vrstva | Technologie |
|--------|-------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | NestJS 11, TypeScript, REST API |
| **Databáze** | Supabase (PostgreSQL), connection pooler, Row Level Security |
| **Auth** | Supabase Auth – Google OAuth, JWT (ES256, JWKS validace) |
| **Mapy** | Google Maps JS API (`@vis.gl/react-google-maps`) |
| **Deployment** | Docker Compose, Traefik (reverse proxy, HTTPS / Let's Encrypt) |
| **Testování** | Vitest (frontend), Jest (backend), Playwright (e2e) |

---

## API List

| Endpoint | Popis |
|----------|-------|
| `GET /api/health` | Health check |
| `GET /api/auth/me` | Info o přihlášeném uživateli |
| `GET/POST /api/trips` | Seznam / vytvoření cesty |
| `GET/PATCH/DELETE /api/trips/:id` | Detail / editace / smazání cesty |
| `POST /api/trips/:id/days` | Přidání dne |
| `DELETE /api/trips/:id/days/:dayId` | Smazání dne (místa → volné) |
| `POST /api/trips/:id/places` | Přidání místa |
| `PATCH /api/trips/:id/places/:id` | Editace místa |
| `DELETE /api/trips/:id/places/:id` | Smazání místa |
| `PATCH /api/trips/:id/places/:id/move` | Přesun místa do jiného dne |
| `PATCH /api/trips/:id/days/:id/reorder` | Změna pořadí míst |
| `GET /api/trips/:id/share` | Generování share tokenu |
| `GET /api/shared/:token` | Veřejný read-only detail cesty |
| `GET /api/places/search?q=` | Google Places autocomplete |
| `GET /api/weather?lat=&lng=&date=` | Počasí z yr.no |
| `POST /api/trips/:id/ai-generate` | AI generování itineráře |
| `GET /api/llm/calls` | Servisní log OpenAI volání (admin) |
| `GET /api/google-places/calls` | Servisní log Google Places volání (admin) |
| `GET/POST/DELETE /api/service/invites` | Správa invite allowlistu |
| `POST /api/service/telemetry` | Logování map eventů |

---

## Externí API

| Služba | Účel | Autentizace |
|--------|------|-------------|
| **OpenAI** (`gpt-4o-mini`) | Generování itineráře (AI) | Bearer token (`OPENAI_API_KEY`) |
| **Google Places API** | Vyhledávání míst, autocomplete, fotky, detaily POI | API key (`GOOGLE_PLACES_API_KEY`) |
| **Google Maps JS API** | Interaktivní mapa v UI (fullscreen, piny, klikání na POI) | API key (`VITE_GOOGLE_MAPS_KEY`) |
| **Supabase** | PostgreSQL databáze + Auth (Google OAuth, JWT) | API key + Service Role key |
| **yr.no** (MET Norway) | Předpověď počasí pro termín cesty (do 9 dní) | User-Agent header |
| **Open-Meteo** | Historická data počasí (stejné datum, minulý rok) – fallback pro delší cesty | Bez autentizace |

### Poznámky

- **Google Places** – backend proxy; klíč nikdy neopustí server, volání logována pro sledování nákladů dle SKU
- **yr.no** – free API norského meteorologického institutu, vyžaduje identifikační User-Agent (`app/version email`)
- **Open-Meteo** – použit jako fallback když je cesta dál než 9 dní dopředu (yr.no forecast limit)
- **Supabase** – slouží zároveň jako databáze (přes `pg` driver) i auth provider (JWKS validace JWT na backendu)

---

## RAG

Travio v aktuální verzi RAG přímo nevyužívá – AI generování itineráře funguje jako **zero-shot / few-shot promptování** OpenAI modelu bez vektorové databáze.

Přirozené místo pro RAG do budoucna: databáze recenzí, lokálních tipů nebo uživatelských itinerářů jako znalostní báze, ze které by model čerpal při generování personalizovaných doporučení.

---

## MCP

MCP v projektu není aktuálně implementováno.

Potenciální use case: MCP server exponující nástroje `search_places`, `get_weather`, `get_trip_context` – LLM by tak mohl autonomně sestavit itinerář bez nutnosti hardcoded API orchestrace v backendovém kódu.

---

## AI Workflow

```
Uživatel zaškrtne „Pomoc od AI" při vytváření cesty
          ↓
Frontend odešle: destinace, dateFrom, dateTo, zájmy uživatele
          ↓
Backend (NestJS) → AiService.generateItinerary()
          ↓
System prompt: „Jsi průvodce cestovního plánování..."
User prompt: destinace + počet dní + zájmy
          ↓
OpenAI Chat API (gpt-4o-mini) → JSON odpověď
{
  "places": [
    { "name": "Central Park", "dayIndex": 0,
      "emoji": "🌳", "priority": "must-see",
      "ticket": "none" }
  ]
}
          ↓
Backend uloží místa do DB přes PlacesService
(každé místo přiřazeno do příslušného dne dle dayIndex)
          ↓
Frontend zobrazí hotovou kostru itineráře
```

Každé volání se loguje do tabulky `llm_calls` (prompt, response, tokeny, cena, user) – přístupné adminem přes servisní dashboard.

---

## Autonomous Agent

V MVP není plně autonomní agent. AI komponenta funguje jako **single-turn generátor** – obdrží kontext, vygeneruje itinerář, uloží výsledek.

Zárodky agentní architektury jsou ale přítomné:
- Backend orchestruje více kroků: vytvoření cesty → generování dnů → volání AI → uložení míst
- `POST /api/trips/:id/ai-generate` umožňuje re-generaci pro existující cestu (opakované volání)
- Admin má servisní monitoring všech AI akcí (audit trail)

Plnohodnotný agent (vícekrokový, s memory a tool use) je přirozeným krokem pro future roadmapu.

---

## LLM Used

**OpenAI GPT-4o-mini** (výchozí, konfigurovatelné přes env)

```
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

- Structured output (JSON mode) pro deterministické parsování odpovědi
- Ceník sledován v `frontend/src/config/llmPricing.ts` (USD/1M tokenů, 3 sazby: input, cached input, output)
- Servisní stránka `/app/service/openai` zobrazuje historii volání s filtry, součty tokenů a odhadovanou cenou

---

## Top Challenges

**1. Typová bezpečnost přes celý stack**
PostgreSQL DATE sloupce `pg` driver defaultně parsuje jako JS `Date` s lokální půlnocí → timezone bug. Řešení: `types.setTypeParser(1082, val => val)` – DATE přichází jako plain string, bez konverze.

**2. Invite-only registrace bez custom auth serveru**
Aplikace je closed beta – nové účty jsou povoleny pouze pro e-maily v whitelist tabulce. Implementováno přes Supabase `before-user-created` Auth Hook (Postgres funkce volaná před vznikem účtu). Frontend navíc dělá pre-check před spuštěním Google OAuth flow, aby uživatel nedostával Google consent screen zbytečně.

---

## Interesting Facts

- **Mapa jako primární UI** – Google Maps zabírá celou obrazovku, plán je sekundární vrstva přes mapu (horizontální strip karet dole na mobilu)
- **Klik na nativní Google POI** přímo v mapě přidá místo do itineráře – uživatel nemusí nic hledat, stačí kliknout na bod zájmu
- **Duplicita míst** se detekuje přes `googlePlaceId` (fallback `name+address`) – aplikace se zeptá před přidáním stejného místa podruhé
- **Admin cost dashboard** sleduje reálné náklady na Google Places API dle SKU (ceny per 1 000 volání) i OpenAI tokenů – každý log obsahuje i e-mail uživatele pro audit
- **Share link** funguje bez přihlášení – stejný pattern jako Google Drive (jen link, žádná registrace nutná)
- **Frontend byl vygenerován v Lovable** (AI-assisted prototyping), backend postaven ručně v NestJS

---

## Future Vision

- **RAG nad databází itinerářů** – personalizovaná doporučení na základě podobných cest jiných uživatelů
- **Autonomní agent s tool use** – LLM, který sám volá Places API, kontroluje otevírací doby, optimalizuje pořadí míst geograficky a časově
- **Kolaborativní plánování** – víc uživatelů edituje stejnou cestu v reálném čase (WebSocket / CRDT)
- **Export do PDF / Apple/Google Wallet** – offline přístup k itineráři bez aplikace
- **Offline mode** – Service Worker + lokální cache pro použití bez internetu v zahraničí
- **Multi-destinační cesty** – jedna cesta, více měst (datový model `destinations` JSONB je v DB už připravený – migrace `004_trip_destinations.sql`)
- **Rozšíření na iOS/Android** – PWA nebo React Native wrapper
