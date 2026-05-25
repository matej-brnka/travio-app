# Reveal.js – multi-file setup

## Struktura složek

```
docs/
  index.html          ← šablona + styly + Reveal.js config
  slides/
    01-title.html
    02-idea.html
    03-design.html
    04-stack.html
    05-api.html
    06-ai-workflow.html
    07-ai-response.html
    08-llm.html
    09-rag-mcp.html
    10-agent.html
    11-challenges.html
    12-facts.html
    13-future.html
    14-closing.html
```

---

## `index.html` – šablona

Celé HTML s CSS styly, ale místo `<section>` bloků jen prázdný kontejner a fetch skript:

```html
<!doctype html>
<html lang="cs">
<head>
  <!-- ... všechny <link> tagy a <style> bloky ... -->
</head>
<body>
  <div class="reveal">
    <div class="slides" id="slides"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/.../reveal.js"></script>
  <script src="https://cdn.jsdelivr.net/.../highlight.js"></script>

  <script type="module">
    const files = [
      'slides/01-title.html',
      'slides/02-idea.html',
      // ... všechny soubory ve správném pořadí
    ]

    for (const f of files) {
      const html = await fetch(f).then(r => r.text())
      document.getElementById('slides').insertAdjacentHTML('beforeend', html)
    }

    Reveal.initialize({
      hash: true,
      // ... zbytek konfigurace
      plugins: [RevealHighlight],
    })
  </script>
</body>
</html>
```

---

## Každý slide soubor

Jen čistý `<section>` blok, nic jiného:

```html
<!-- slides/02-idea.html -->
<section>
  <h2>Idea</h2>
  <p>...</p>
</section>
```

---

## `styles.css` – struktura

Styly jsou rozdělené do 5 sekcí. Pravidlo pro přidání nového stylu:

| Kam patří | Kdy |
|-----------|-----|
| **Tokens** | Měníš barvu nebo font pro celou prezentaci |
| **Base** | Přepisuješ výchozí chování Reveal.js (nadpisy, listy…) |
| **Layout** | Řešíš rozmístění prvků na slidu (grid, flex) |
| **Components** | Třída se opakuje na víc slidech |
| **Utilities** | Třída se používá jen na jednom místě |

```css
/* ─── 1. TOKENS ──────────────────────────────────────────────────────────────
   Barvy, typografie, spacing.
   Sem šahej když měníš "brand" — zbytek souboru na tokeny jen odkazuje.
   ──────────────────────────────────────────────────────────────────────────── */

:root {
  --primary:     #00798c;
  --accent:      #edae49;
  --destructive: #d1495b;
  --fg:          #003d5b;
  --muted:       #30638e;
  --card:        #ffffff;
  --border:      #dde3ea;
}


/* ─── 2. BASE ────────────────────────────────────────────────────────────────
   Globální overrides Reveal.js — html/body, .reveal, nadpisy, listy, kód.
   Sem nesahej skoro nikdy.
   ──────────────────────────────────────────────────────────────────────────── */

html, body { ... }
.reveal { ... }
.reveal h1, h2, h3 { ... }
.reveal ul, ol { ... }
.reveal pre { ... }
.reveal table { ... }


/* ─── 3. LAYOUT ──────────────────────────────────────────────────────────────
   Strukturální třídy — jak se věci rozkládají na slidu.
   Žádné barvy ani dekorace tady, jen pozicování.
   ──────────────────────────────────────────────────────────────────────────── */

.two-col { ... }
.card-grid { ... }


/* ─── 4. COMPONENTS ──────────────────────────────────────────────────────────
   Znovupoužitelné UI prvky. Každá komponenta je self-contained.
   ──────────────────────────────────────────────────────────────────────────── */

/* -- card -- */
/* -- chip -- */
/* -- flow -- */
/* -- highlight-box -- */


/* ─── 5. UTILITIES ───────────────────────────────────────────────────────────
   Jednorázové pomocné třídy. Pokud se třída používá jen na jednom slidu,
   patří sem — ne do Components.
   ──────────────────────────────────────────────────────────────────────────── */

.title-slide { text-align: center !important; }
.p-must { color: var(--destructive); font-weight: 700; }
```

---

## Live Server

1. VS Code → Extensions → nainstaluj **Live Server** (Ritwick Dey)
2. Otevři složku ve VS Code
3. Klikni **Go Live** v dolní liště
4. Prohlížeč otevře `http://127.0.0.1:5500/docs/index.html`

Od teď: edituješ libovolný `slides/*.html`, uložíš → prohlížeč se sám refreshne a zůstane na stejném slidu (díky `hash: true` v Reveal.js konfiguraci).

---

## Přesun obsahu z aktuálního souboru

Otevři stávající `prezentace.html`, překopíruj každý `<section>…</section>` blok do odpovídajícího souboru ve `slides/`. Styly a skripty zůstanou jen v `index.html`.

> **Poznámka:** Jednotlivé soubory ve `slides/` nejsou samostatně otevíratelné v prohlížeči — jsou to fragmenty bez `<html>`, `<head>` a stylů. Edituj je jako text, náhled vždy přes `index.html` se spuštěným Live Serverem.

---

## Build – sestavení do jednoho HTML

Pro sdílení nebo offline prezentaci se hodí mít vše v jednom souboru. Přidej skript `build.mjs` vedle `index.html`:

```js
// build.mjs
import { readdirSync, readFileSync, writeFileSync } from 'fs'

const template = readFileSync('index.html', 'utf8')

const slides = readdirSync('slides')
  .filter(f => f.endsWith('.html'))
  .sort()
  .map(f => readFileSync(`slides/${f}`, 'utf8'))
  .join('\n')

// vloží slidy do šablony
const withSlides = template.replace(
  '<div class="slides" id="slides"></div>',
  `<div class="slides">\n${slides}\n</div>`
)

// odstraní fetch skript – v buildu už není potřeba
const output = withSlides.replace(
  /<script type="module">[\s\S]*?<\/script>/,
  `<script>
    Reveal.initialize({
      hash: true,
      slideNumber: 'c/t',
      transition: 'slide',
      center: false,
      width: 1280,
      height: 720,
      margin: 0.05,
      minScale: 0.2,
      maxScale: 2.0,
      plugins: [RevealHighlight, RevealNotes],
    })
  </script>`
)

writeFileSync('prezentace.html', output)
console.log('✓ prezentace.html sestavena')
```

Spustíš z adresáře kde leží `index.html`:

```bash
node build.mjs
```

Výsledkem je `prezentace.html` — jeden soubor bez závislostí na serveru, jde otevřít přímo v prohlížeči.

---

## Playwright – testování napříč prohlížeči a viewporty

Playwright spouštíš vždy se spuštěným Live Serverem (`http://127.0.0.1:5500`).

### Instalace (jednorázově)

```bash
npm init -y
npm install -D @playwright/test
npx playwright install
```

### Spuštění

```bash
# všechny prohlížeče + viewporty najednou
npx playwright test

# jen jeden projekt
npx playwright test --project=mobile
npx playwright test --project=chrome
```

### Jak vidět výsledky

**1. Terminál** — základní pass/fail výpis, hned po doběhnutí.

**2. HTML report** — přehledný report se screenshoty, chybami a časovou osou:

```bash
npx playwright test --reporter=html
npx playwright show-report
```

Otevře se v prohlížeči na `http://localhost:9323` — klikneš na konkrétní test a vidíš screenshot z každého prohlížeče/viewportu vedle sebe.

**3. UI mode** — interaktivní, spouštíš testy ručně a v reálném čase vidíš co prohlížeč dělá:

```bash
npx playwright test --ui
```

> Pro kontrolu prezentace je nejužitečnější **HTML report** — screenshoty z každého viewportu na jednom místě. **UI mode** se hodí když chceš krokovat a ladit konkrétní slide.
