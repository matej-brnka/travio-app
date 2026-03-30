/**
 * Ceník OpenAI modelů – ceny v USD za 1 000 000 tokenů.
 * Aktualizuj hodnoty podle https://openai.com/api/pricing/
 *
 * Formát záznamu:
 *   [název modelu přesně jak přichází z API]: {
 *     inputPer1M:       cena za 1M input tokenů v USD
 *     cachedInputPer1M: cena za 1M cached input tokenů v USD
 *     outputPer1M:      cena za 1M output tokenů v USD
 *   }
 *
 * Poznámka k cached tokenům:
 *   DB aktuálně ukládá pouze promptTokens (celkem, bez rozlišení cached vs. non-cached).
 *   calcCost proto počítá worst-case cenu (bez slevy za cache).
 *   Až budeme ukládat cachedTokens zvlášť, calcCost aktualizuj.
 */
export const LLM_PRICING: Record<string, {
  inputPer1M: number;
  cachedInputPer1M: number;
  outputPer1M: number;
}> = {
  // --- GPT-4o ---
  "gpt-4o":                 { inputPer1M: 2.50,  cachedInputPer1M: 1.25,  outputPer1M: 10.00 },
  "gpt-4o-2024-11-20":      { inputPer1M: 2.50,  cachedInputPer1M: 1.25,  outputPer1M: 10.00 },
  "gpt-4o-2024-08-06":      { inputPer1M: 2.50,  cachedInputPer1M: 1.25,  outputPer1M: 10.00 },
  "gpt-4o-2024-05-13":      { inputPer1M: 5.00,  cachedInputPer1M: 2.50,  outputPer1M: 15.00 },

  // --- GPT-4o mini ---
  "gpt-4o-mini":            { inputPer1M: 0.15,  cachedInputPer1M: 0.075, outputPer1M: 0.60  },
  "gpt-4o-mini-2024-07-18": { inputPer1M: 0.15,  cachedInputPer1M: 0.075, outputPer1M: 0.60  },

  // --- o1 ---
  "o1":                     { inputPer1M: 15.00, cachedInputPer1M: 7.50,  outputPer1M: 60.00 },
  "o1-2024-12-17":          { inputPer1M: 15.00, cachedInputPer1M: 7.50,  outputPer1M: 60.00 },

  // --- o1-mini ---
  "o1-mini":                { inputPer1M: 1.10,  cachedInputPer1M: 0.55,  outputPer1M: 4.40  },
  "o1-mini-2024-09-12":     { inputPer1M: 1.10,  cachedInputPer1M: 0.55,  outputPer1M: 4.40  },

  // --- o3-mini ---
  "o3-mini":                { inputPer1M: 1.10,  cachedInputPer1M: 0.55,  outputPer1M: 4.40  },

  // --- GPT-4 Turbo ---
  "gpt-4-turbo":            { inputPer1M: 10.00, cachedInputPer1M: 5.00,  outputPer1M: 30.00 },
  "gpt-4-turbo-2024-04-09": { inputPer1M: 10.00, cachedInputPer1M: 5.00,  outputPer1M: 30.00 },

  // --- GPT-3.5 Turbo ---
  "gpt-3.5-turbo":          { inputPer1M: 0.50,  cachedInputPer1M: 0.25,  outputPer1M: 1.50  },
  "gpt-3.5-turbo-0125":     { inputPer1M: 0.50,  cachedInputPer1M: 0.25,  outputPer1M: 1.50  },
};

/**
 * Vypočítá cenu volání v USD (worst-case – bez zohlednění cache slevy).
 * Vrátí null pokud model není v ceníku nebo tokeny chybí.
 */
export const calcCost = (
  model: string,
  promptTokens: number | null,
  completionTokens: number | null,
): number | null => {
  const pricing = LLM_PRICING[model];
  if (!pricing || promptTokens == null || completionTokens == null) return null;
  return (
    (promptTokens * pricing.inputPer1M + completionTokens * pricing.outputPer1M) / 1_000_000
  );
};
