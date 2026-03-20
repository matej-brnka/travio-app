Mám komplexní popis webové aplikace (viz níže). Rozděl ho na samostatné
implementační části (chunky) pro lokálního AI coding agenta (OpenAI Codex).

Každá část bude zkopírována do agenta jako samostatný prompt. Agent pracuje
v repozitáři se strukturou:
- frontend/  -- hotový frontend (React + Vite), vygenerovaný v Lovable
- backend/   -- zatím prázdná složka pro serverovou logiku

Požadavky na chunky:
1. První chunk = inicializace backendu (struktura projektu, package.json /
   requirements.txt, základní server)
2. Druhý chunk = vytvoření AGENTS.md souborů pro celý projekt:
   - Kořenový AGENTS.md -- přehled projektu, struktura repozitáře, konvence,
     návod jak spouštět a testovat, bezpečnostní pravidla (nikdy necommitovat
     secrets, .env soubory přidávat do .gitignore, používat environment variables)
   - frontend/AGENTS.md -- tech stack frontendu, jak spustit dev server,
     struktura komponent, konvence pojmenování, kde jsou mock data
   - backend/AGENTS.md -- tech stack backendu, jak spustit server, struktura
     API endpointů, databázové schéma, jak přidávat nové endpointy
   - Každý AGENTS.md musí obsahovat instrukci: "Pokud přidáš novou funkci,
     endpoint nebo změníš strukturu projektu, aktualizuj příslušný AGENTS.md"
3. Další chunky = jednotlivé funkce / API endpointy, každý se dá implementovat
   a otestovat nezávisle
4. Jeden z chunků = propojení frontendu s backendem (nahrazení mock dat
   skutečnými API voláními)
5. Poslední chunk = závěrečné testování a dokončení

Pro každý chunk uveď:
- Název a stručný popis
- Co přesně má agent udělat (konkrétní instrukce)
- Jaké soubory bude vytvářet / upravovat
- Jak ověřit, že chunk je hotový (testovací kritéria)
- Závislosti na předchozích chunkách

Formát výstupu: očíslované chunky, každý jako hotový prompt ke zkopírování
do agenta. Každý prompt konči instrukcí "Commitni a pushni změny."

Zde je kompletní popis projektu:
<ZDE VLOŽTE SVŮJ KOMPLEXNÍ POPIS PROJEKTU>

Zde je seznam změn, co dělal Lovable
<ZDE VLOŽTE SHRNUTÍ Z LOVABLE>
