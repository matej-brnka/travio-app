# NÁZEV PROJEKTU: Travio

## JEDNOVĚTÝ POPIS: 

Webová aplikace pro tvorbu itinerářů na cesty - například městská turistka apod. Primárně aplikaci děláme pro mobilní zařízení, i když se jedná čistě o webovou aplikaci.

## PROBLÉM, KTERÝ ŘEŠÍ: 

Potřebuji si pohodlně naplánovat místa, která chci vidět.

## CÍLOVÝ UŽIVATEL

cestovatelé mladší generace

## HLAVNÍ FUNKCE (MVP) -- co aplikace musí umět v první verzi:

- Uživatel může založit plán pro cestu do určitého místa (například do New Yorku), očekává se že zadá datum cesty od kdy do kdy tam bude, aplikace mu sama spočítá počet dní, které si může naplánovat
    - Uživatel může ale i přesto přidat den sám od sebe
    - Uživatel může den sám smazat
- Uživatel může cestu otevřít a editovat
    - Může přidat místa do jednotlivých dnů
    - Může místo přesunout do jiného dne
    - Může místo smazat ze dne
    - Může změnit pořadí míst v rámci dne
    - Uživatel může místo odšrtrnout, že ho již navštívil 
    - Uživatel může i přdat místa (a nepřiřazovat je zatím do konrétního dne)
- Uživatel může sdílet anonymní odkaz svým přátelům, kteří si jej mohou otevřít a prohlédnout (jen v režimu čtení, podobně jako Google Drive Services)

## CO APLIKACE V MVP NEBUDE UMĚT (out of scope):

- není definováno

## JAK SE PROJEKT LIŠÍ OD EXISTUJÍCÍCH ŘEŠENÍ

- není definováno

## STRUKTURA REPOZITÁŘE

- frontend/  -- uživatelské rozhraní
- backend/   -- serverová logika a API

## TECH STACK

- Frontend: React framework
- Backend framework: Nest.js
- Databáze: Supabase
- Další knihovny / API: 
    - yr.no pro průměrné počasí v dané době v dané lokalitě, které se načte při vytváření cesty
    - vyhledávání nad Google Places API - otevírací doba, lokalita, aby to uživatel nemusel zadávat ručně
    - mapové podkaldy - mapbox
    - AI model (TBA) - který při vytváření cesty (pokud si to uživatel zaškrtne) vygeneruje návrh míst jako startovní kostru itineráře; uživatel ji následně upravuje pomocí standardních funkcí aplikace (přidání, smazání, přesun míst)

## OBRAZOVKY / STRÁNKY APLIKACE:

### Moblní zařízení

1. Úvodní stránka aplikace
    1. Uživatel na ni uvidí všechny své cesty, a může si otevřít detail cesty. Bude se jednat o dlaždice, uvidí tam termín cesty, uvidí za jak dlouho cesta začíná, uvidí očekávané počasí v dané lokalitě
2. Detail cesty
    - Obrazovka má dva pohledy přepínatelné přepínačem (toggle) v horní části obrazovky: **📋 Seznam** a **🗺 Mapa**
    - Navigace mezi dny je dostupná v obou pohledech (pomocí pills filtru)
    - **Pohled Seznam** (primárně pro plánování)
        1. Uživatel vidí seřazený seznam míst pro aktuální den
        2. Může přidávat místa, měnit jejich pořadí, přesouvat mezi dny, mazat
        3. Kliknutí na místo otevře detail místa
    - **Pohled Mapa** (primárně pro použití v terénu)
        1. Mapa zabírá celou obrazovku
        2. Dole je horizontální scroll karet pro aktuální den
        3. Kliknutí na kartu nebo pin na mapě otevře detail místa
3. Detail místa
    1. Uživatel uvidí informace o místě - adresa, webová stránka, mapa, zda je či není potřeba vstupenka a nebo ji už má
    2. Uživatel může zobrazit místo jako navštívené
4. Webová stránka aplikace, která jen umožní uživateli se přihlásit a přejít do aplikace


### Desktopové zobrazení
TBA

### Použité barvy

| Role | Hex | Použití |
|------|-----|---------|
| Brand / Primary | `#00798c` | Logo, aktivní prvky, selected stav, linky |
| CTA / Accent | `#edae49` | Hlavní tlačítka (Přidat cestu, Uložit), highlights |
| Destructive | `#d1495b` | Smazat, varování, chybové stavy |
| Text primary | `#003d5b` | Nadpisy, hlavní text |
| Text secondary | `#30638e` | Popisky, metadata, sekundární text |
| Background | `#f5f5f5` | Pozadí stránek |
| Surface | `#ffffff` | Karty, modaly, panely |

### Branding

- Styl: Moderní a minimalistcký
- Logo: zatím bez loga, doděláme 
- Tón komunikace v aplikaci: hravý s emoji

## NAVIGACE MEZI STRÁNKAMI:

- Horní lišta (Navbar): Zobrazuje kontext výletu (název, termín, počet osob) a umožňuje globální akce (Import, Export, PDF, AI).
- Sidebar (Desktop) / Horní "pilly" (Mobile): Přepínání mezi jednotlivými dny itineráře, což okamžitě aktualizuje trasu na mapě.
- Interaktivní mapa: Kliknutím na značku (marker) se otevírá detail daného místa.
- Pager v detailu: Tlačítka "předchozí" a "následující" v detailu místa umožňují lineární procházení plánu bez nutnosti vracet se do seznamu.
- Mobilní horizontální strip: Rychlé přepínání mezi kartami míst švihnutím (swipe) ve spodní části obrazovky.

## AUTENTIZACE A UŽIVATELÉ:

- Aplikace potřebuje přihlášení
- Způsob přihlášení bude prostřednictvím Google OAuth Service
- Uživatelské role: 
    - uživatel - může si vytvářet cesty, plánovat
    - admin - bude doplněno
- Co vidí nepřihlášený uživatel: 
    - veřejnou produktovou stránku a pro vstup do aplikace se musí přihlásit

## DATA, KTERÁ UŽIVATEL ZADÁVÁ:

- Místo kam chce jet
- V rámci místa kam chce jet může přidat dny
- V rácmi jednotlivých dnů pak přidává konkrétní místa
- V rámci konrétních míst zadává, zda je potřeba na toto místo vstupenka a zda má či nemá vstup již vyřízený.

## DATA, KTERÁ APLIKACE UKLÁDÁ: 

- Aplikace ukládá místo kam chce uživatel jet --> jednotlvé dny v rámci cesty --> jednotlvá místa v rámci cesty

## EXTERNÍ ZDROJE DAT: 

- yr.no pro získání očekávaného počasí v místě
- AI API pro vygenerování výletu - pokud si to uživatel zaškrtne, AI navrhne seznam míst jako startovní kostru itineráře; uživatel ji následně upravuje pomocí standardních funkcí aplikace
- Mapové podkaldy mapbox
- Google Places API

## FORMÁT VÝSTUPU PRO UŽIVATELE: 

- stránka s přehledem jeho cest, po rozkliknutí cesty získává plán pro jednotlivé dny v rámci cesty
- může si zapnout směrování (Directions) na další místo (bude odkázán do Google Maps)

## CHYBOVÉ STAVY:

- Výpadek externího API: Zobrazit chybovou hlášku a nabídnout retry 
- Prázdný stav (žádná data): Zatím nemáte žádné výlety 
- Pomalé načítání: Zobrazit skeleton loading

## POPIS JEDNOTLIVÝCH FUNKCÍ (MVP):

### Funkce 1: Vytvoření cesty (výletu)

- Popis: Uživatel si založí výlet (např. cesta do New Yorku) a bude si moci plánovat jednotlivé dny. Na obrazovce uvidí vytvořenou jednu cestu. Aplikce sama vytvoří počet dní dle zadaného datumu cesty.
- Vstup: Uživatel klikne na tlačítko nová cesta, bude si moci vybrat zda chce pomoc od AI s plánováním a zadá datum cesty od do.
- Výstup: Uživatel na přehledu jeho cest uvidí dlažidici s danou cestou. Uvidí zde také již automaticky dotažené očekávané počasí v dané lokalitě (na základě API)
- Kde v aplikaci se používá: Na obrazovce s Úvodní stránka aplikace

### Funkce 2: Vytvoření dne
- Popis: I přesto, že aplkace sama vygeneruje počet dní na základě datumu, uživatel může sám přidat extra den
- Vstup: Uživatel klikne na tlačítko nový den
- Výstup: Aplikace v seznamu dní přidá další den 
- Kde v aplikaci se používá: Na obrazovce Detailu cesty 

### Funkce 3: Smazání dne
- Popis: Uživatel může jeden den ze své cesty (například chce mít volno)
- Vstup: Uživatel klikne na tlačítko "Smazat dne"
- Výstup: Uživateli zmizí daný den z aplikace
- Kde v aplikaci se používá: Na obrazovce datilu cesty
- Edge cases:
  - Co když den obsahuje již nějaká místa: Aplikce přesune tato místa do nezařazených


### Funkce 4: Přidání místa bez konkrétního dne (nezařazené)
- Popis: Nezařazená místa jsou de facto speciální den (Den 0) bez konkrétního data. Uživatel se přesune do záložky Nezařazené a klikne na tlačítko Přidat místo.
- Vstup: Uživatel napíše název místa, aplikace se jej pokusí našeptat pomocí Google Places API; pokud uživatel navrhované místo vybere, natáhnou se data automaticky.
- Výstup: Uživatel uvidí přidané místo v rámci záložky Nezařazené
- Kde v aplikaci se používá: Na obrazovce Detail cesty
- Závislosti: Google Places API - natáhne informace z Google Places API
- Edge cases:
    - Co když aplikace nenajde místo v Google Places API: Aplikace místo i tak vytvoří a uživatel může informace zadat ručně

### Funkce 5: Přidání místa do konkrétního dne
- Popis: Uživatel je v kontextu konkrétního dne a klikne na tlačítko Přidat místo přímo u daného dne.
- Vstup: Uživatel napíše název místa, aplikace se jej pokusí našeptat pomocí Google Places API; pokud uživatel navrhované místo vybere, natáhnou se data automaticky.
- Výstup: Uživatel uvidí přidané místo v rámci daného dne
- Kde v aplikaci se používá: Na obrazovce Detail cesty
- Závislosti: Google Places API - natáhne informace z Google Places API
- Edge cases:
    - Co když aplikace nenajde místo v Google Places API: Aplikace místo i tak vytvoří a uživatel může informace zadat ručně

### Funkce 6: Smazání místa (ze dne nebo beze dne)
- Popis: Uživatel může smazat samotné místo ze dne nebo z neřazených
- Vstup: Uživatel klikne na tlačítko smazat místo
- Výstup: Uživateli zmizí místo z aplikace
- Kde v aplikaci se používá: Na detailu cesty
- Edge cases:
    - Co když je místo označené jako navštívené: prostě ho smaže

### Funkce 7: Přesun místa do jiného dne (mezi dny nebo z nezařazených)
- Popis: uživatel může přesunout místo z nezařezených nebo v rámci dnů
- Vstup: uživatel na desktopu drag and drop přesune do jiného dne, nebo (primárně pro mobilní zařízení) místo nějak přesune
- Výstup: Uživatel bude mít přesunuté místo do jiného dne
- Kde v aplikaci se používá: na detailu cesty

### Funkce 8: Přesun místa v rámci dne
- Popis: uživatel může přesunout místo v rámci dne z první na druhou pozici apod...
- Vstup: uživatel drag and drop přesune místo za jiné
- Výstup: uživatel uvidí nové řazení místa
- Kde v aplikaci se používá: na detailu cesty

### Funkce 9: Přepínání pohledu Seznam / Mapa
- Popis: Uživatel může přepínat mezi dvěma pohledy na detail cesty. Pohled Seznam je primárně určen pro plánování (editace, přidávání, řazení míst). Pohled Mapa je primárně určen pro použití v terénu (orientace, navigace, přehled trasy).
- Vstup: Uživatel klikne na toggle přepínač 📋 Seznam / 🗺 Mapa v horní části obrazovky detailu cesty
- Výstup: Aplikace přepne zobrazení; vybraný pohled se zapamatuje pro příští otevření cesty
- Kde v aplikaci se používá: Na obrazovce Detail cesty

### Funkce 10: Označení místa jako navštíveného
- Popis: Uživatel označí místom jako navštívěné
- Vstup: Uživatel označí checkbox jako Navštíveno
- Výstup: Uživatel uvidí místo nějak graficky odlišené od ostatních, jelikož je již navštívené
- Kde v aplikaci se používá: Na obrazovce s Detailem cesty a detailem místa
