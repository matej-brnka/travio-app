/**
 * Ceník Google Places / Maps API – ceny v USD za 1 volání.
 * Aktualizuj podle https://mapsplatform.google.com/pricing/
 *
 * Formát záznamu:
 *   [api_type]: cena za 1 volání v USD
 *
 * Aktuální ceník (k 2025):
 *   - Text Search:   $32 / 1 000 volání = $0.032 / volání
 *   - Place Details: $17 / 1 000 volání = $0.017 / volání
 *   - Place Photo:   $7  / 1 000 volání = $0.007 / volání
 *
 * Poznámka: Google poskytuje $200 měsíční kredit zdarma.
 */
export const GOOGLE_PLACES_PRICING: Record<string, number> = {
  text_search:   0.032,
  place_details: 0.017,
  place_photo:   0.007,
};

export const calcGoogleCost = (apiType: string): number | null => {
  return GOOGLE_PLACES_PRICING[apiType] ?? null;
};
