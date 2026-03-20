📋 Kompletní shrnutí projektu Travio
🏗️ Architektura & Layout
Třísloupcový desktop layout (1024px+): sidebar s itinerářem | mapa | detail místa
Mobilní/tabletové zobrazení: přepínání mezi mapou a seznamem, detail místa na celé obrazovce
Dva typy rámců: MobileFrame (max 480px, centrovaný) pro dashboard/login, FullFrame pro detail cesty
Zapamatování zobrazení: volba mapy/seznamu se ukládá do localStorage, takže po návratu z detailu místa zůstane
🗺️ Detail cesty (TripDetail)
Mapa jako výchozí pohled na mobilu/tabletu, seznam na desktopu
Prohozené tlačítka Mapa/Seznam (Mapa první)
Day pills (mobil) a vertikální sidebar (desktop) s počtem míst v závorce
Přidání nového dne (+ Přidat den) – přidá den s navazujícím datem
Smazání dne – místa se automaticky přesunou do Volných, poslední den nelze smazat
Statistika dní/nocí se počítá z datumů odjezdu/příjezdu (ne z počtu dnů v itineráři)
Formát: "X dní · Y nocí" v hlavičce
📍 Místa (Places)
Vlastnosti místa:
Emoji – výběr přes EmojiPicker
Priorita – Must see! 🔥 / Chci vidět ⭐ / Když zbyde čas 🤷 / žádná
Poznámka – auto-saving textarea s debounce
Čas/rezervace (timeFrom/timeTo) – s tlačítkem ✕ pro smazání jedním klikem
Vstupenka – Není třeba / Potřeba / Mám
Navštíveno – toggle s vizuálním odlišením
Zobrazení na kartách (PlaceCard):
Barevný levý border podle priority
Emoji, čas (jen pokud zadán), adresa, badge vstupenky a priority
Visited stav: snížená opacita + přeškrtnutí
Reorder šipky (nahoru/dolů)
Zobrazení na mapě (TripMapView):
Vertikální karty (130px šířka) s indexem, emoji, názvem, časem
Barevné číslo podle priority
Visited: snížená opacita + přeškrtnutí (bez ✅ emoji)
Karta s + na konci pro přidání nového místa
Propojení míst přerušovanou čarou
🗓️ Vytváření & úprava cesty
Popisky: "Datum odjezdu" a "Datum příjezdu" nad kalendářem
Calendar picker (react-day-picker) s českou lokalizací
Datum příjezdu blokuje dny před odjezdem
Počet dní = rozdíl dat + 1 (počítá i poslední den)
Emoji picker pro výběr ikony cesty
AI pomoc: kategorizované zájmové štítky pro budoucí generování itineráře
Kategorie AI štítků:
🎯 Styl cestování: Kultura, Příroda, Dobrodružství, Relaxace, Gastronomie, Noční život, Sport, Fotografie
💰 Rozpočet: Budget Friendly, Střední rozpočet, Luxury
👥 S kým cestuješ: Solo, Pár, Rodina s dětmi, Přátelé
⏰ Tempo: Pohodové, Vyvážené, Maximální program
🔄 State Management (TripContext)
addPlaceToDay – přidání místa do dne nebo Volných
movePlace – přesun místa mezi dny
reorderPlaces – změna pořadí míst v rámci dne
updatePlace – aktualizace vlastností místa
deletePlace – smazání místa
addTrip / updateTrip – CRUD cest s automatickým přepočtem dnů
addDayToTrip – přidání nového dne
removeDayFromTrip – smazání dne (místa → Volné)
📱 Responsivita
Funkce	Mobil (<768px)	Tablet (768-1023px)	Desktop (1024px+)
Výchozí pohled	Mapa	Mapa	Seznam + mapa
Detail místa	Celá stránka	Celá stránka	Pravý panel
Navigace dnů	Horizontální pills	Horizontální pills	Vertikální sidebar
Mapové karty	Spodní pás	Spodní pás	Skryté
🧩 Komponenty
Komponenta	Účel
TripDetail	Hlavní stránka detailu cesty
PlaceCard	Karta místa v seznamu
TripMapView	Mock mapa s piny a kartami
PlaceDetailPanel	Desktop panel detailu místa
PlaceDetail	Mobilní stránka detailu místa
AddPlaceSheet	Sheet pro přidání místa
MovePlaceModal	Modal pro přesun místa do jiného dne
EditTripModal	Modal pro úpravu cesty
NewTripModal	Modal pro vytvoření cesty
EmojiPicker	Výběr emoji
