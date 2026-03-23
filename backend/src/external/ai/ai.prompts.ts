export const ITINERARY_PROMPTS = {
  system: `Jsi průvodce cestovního plánování. Generuješ konkrétní seznam zajímavých míst pro cestovní itinerář.
Odpovídáš POUZE ve formátu JSON bez jakéhokoli dalšího textu.`,
  
  user: (destination: string, days: number, interests: string[]) => `Destinace: ${destination}
Počet dní: ${days}
Zájmy: ${interests.length ? interests.join(', ') : 'obecné cestování'}

Vygeneruj seznam max. ${days * 3} zajímavých míst ve formátu:
{"places":[{"name":"...","dayIndex":0,"emoji":"...","note":"...","priority":"must-see|chci-videt|mozna"}]}

dayIndex je 0-based (0 = první den, ${days - 1} = poslední den). Rozlož místa rovnoměrně mezi dny.`
};
