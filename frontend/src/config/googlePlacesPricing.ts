/**
 * Ceník Google Maps Platform – ceny v USD za 1 000 volání (jak je uvádí Google).
 * Aktualizuj podle https://developers.google.com/maps/billing-and-pricing/pricing#places-pricing
 *
 * Tier 0–100 000 volání/měsíc.
 * Google má pro SKU vlastní free usage capy - viz oficiální pricing tabulka.
 */
export interface GooglePricingEntry {
  per1000: number;   // cena v USD za 1 000 volání (tier 0–100k)
  label:   string;   // zobrazovaný název
  sku:     string;   // přesný název položky v Google ceníku
}

export const GOOGLE_PRICING: Record<string, GooglePricingEntry> = {
  // ── Places API (Legacy: maps.googleapis.com/maps/api/place/) ─────────────

  // /textsearch/json
  text_search_pro: {
    per1000: 32.00,
    label:   "Text Search",
    sku:     "Places API Text Search Pro",
  },
  // legacy api_type pro starší logy
  text_search: {
    per1000: 32.00,
    label:   "Text Search (Legacy)",
    sku:     "Places API Text Search Pro",
  },

  // /details/json?fields=name,formatted_address,geometry,website,opening_hours,...
  // website + opening_hours jsou "Contact" pole → Pro tier
  place_details_pro: {
    per1000: 17.00,
    label:   "Place Details (Pro)",
    sku:     "Places API Place Details Pro",
  },
  // legacy api_type pro starší logy; historicky se nerozlišovalo Pro vs Essentials
  place_details: {
    per1000: 17.00,
    label:   "Place Details (Legacy)",
    sku:     "Places API Place Details Pro",
  },

  // /details/json?fields=photos
  // photo_reference je Basic/Essentials pole → Essentials tier
  place_details_essentials: {
    per1000: 5.00,
    label:   "Place Details (Essentials)",
    sku:     "Places API Place Details Essentials",
  },

  // /photo (samotný obrázek)
  place_photo: {
    per1000: 7.00,
    label:   "Place Photo",
    sku:     "Places API Place Photo",
  },

  // ── Maps JavaScript API ───────────────────────────────────────────────────

  // Každé zobrazení mapy v browseru (new google.maps.Map())
  map_load: {
    per1000: 7.00,
    label:   "Map Load",
    sku:     "Dynamic Maps",
  },
};

/** Cena za `calls` volání daného api_type. Vrátí null pro neznámý typ. */
export const calcGoogleCost = (apiType: string, calls: number): number | null => {
  const entry = GOOGLE_PRICING[apiType];
  if (!entry) return null;
  return (entry.per1000 / 1000) * calls;
};
