import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmojiEntry {
  emoji: string;
  label: string;
}

const EMOJI_LIST: EmojiEntry[] = [
  // Cestování
  { emoji: "✈️", label: "Letadlo" },
  { emoji: "🗽", label: "Socha svobody" },
  { emoji: "🏔️", label: "Hory" },
  { emoji: "🏖️", label: "Pláž" },
  { emoji: "🌍", label: "Svět" },
  { emoji: "🏛️", label: "Muzeum" },
  { emoji: "🎭", label: "Divadlo" },
  { emoji: "🌸", label: "Květina" },
  { emoji: "🏕️", label: "Kemp" },
  { emoji: "🚗", label: "Auto" },
  { emoji: "🎿", label: "Lyže" },
  { emoji: "🌴", label: "Palma" },
  { emoji: "🗼", label: "Věž" },
  { emoji: "🏰", label: "Hrad" },
  { emoji: "🎢", label: "Horská dráha" },
  { emoji: "🚂", label: "Vlak" },
  { emoji: "🛳️", label: "Loď" },
  { emoji: "🏝️", label: "Ostrov" },
  { emoji: "⛷️", label: "Lyžař" },
  { emoji: "🧳", label: "Kufr" },
  // Vlajky – Evropa
  { emoji: "🇨🇿", label: "Česko Czech" },
  { emoji: "🇸🇰", label: "Slovensko Slovakia" },
  { emoji: "🇩🇪", label: "Německo Germany" },
  { emoji: "🇦🇹", label: "Rakousko Austria" },
  { emoji: "🇮🇹", label: "Itálie Italy" },
  { emoji: "🇫🇷", label: "Francie France" },
  { emoji: "🇪🇸", label: "Španělsko Spain" },
  { emoji: "🇬🇧", label: "Británie United Kingdom" },
  { emoji: "🇬🇷", label: "Řecko Greece" },
  { emoji: "🇭🇷", label: "Chorvatsko Croatia" },
  { emoji: "🇵🇹", label: "Portugalsko Portugal" },
  { emoji: "🇳🇱", label: "Nizozemsko Netherlands" },
  { emoji: "🇧🇪", label: "Belgie Belgium" },
  { emoji: "🇨🇭", label: "Švýcarsko Switzerland" },
  { emoji: "🇵🇱", label: "Polsko Poland" },
  { emoji: "🇸🇪", label: "Švédsko Sweden" },
  { emoji: "🇳🇴", label: "Norsko Norway" },
  { emoji: "🇩🇰", label: "Dánsko Denmark" },
  { emoji: "🇫🇮", label: "Finsko Finland" },
  { emoji: "🇮🇸", label: "Island Iceland" },
  { emoji: "🇮🇪", label: "Irsko Ireland" },
  { emoji: "🇷🇴", label: "Rumunsko Romania" },
  { emoji: "🇧🇬", label: "Bulharsko Bulgaria" },
  { emoji: "🇭🇺", label: "Maďarsko Hungary" },
  { emoji: "🇷🇸", label: "Srbsko Serbia" },
  { emoji: "🇲🇪", label: "Černá Hora Montenegro" },
  { emoji: "🇦🇱", label: "Albánie Albania" },
  { emoji: "🇲🇰", label: "Severní Makedonie" },
  { emoji: "🇧🇦", label: "Bosna Bosnia" },
  { emoji: "🇸🇮", label: "Slovinsko Slovenia" },
  { emoji: "🇱🇹", label: "Litva Lithuania" },
  { emoji: "🇱🇻", label: "Lotyšsko Latvia" },
  { emoji: "🇪🇪", label: "Estonsko Estonia" },
  { emoji: "🇺🇦", label: "Ukrajina Ukraine" },
  { emoji: "🇲🇹", label: "Malta" },
  { emoji: "🇨🇾", label: "Kypr Cyprus" },
  { emoji: "🇱🇺", label: "Lucembursko Luxembourg" },
  { emoji: "🇲🇨", label: "Monako Monaco" },
  // Amerika
  { emoji: "🇺🇸", label: "USA Spojené státy" },
  { emoji: "🇨🇦", label: "Kanada Canada" },
  { emoji: "🇲🇽", label: "Mexiko Mexico" },
  { emoji: "🇧🇷", label: "Brazílie Brazil" },
  { emoji: "🇦🇷", label: "Argentina" },
  { emoji: "🇨🇱", label: "Chile" },
  { emoji: "🇨🇴", label: "Kolumbie Colombia" },
  { emoji: "🇵🇪", label: "Peru" },
  { emoji: "🇨🇺", label: "Kuba Cuba" },
  { emoji: "🇨🇷", label: "Kostarika Costa Rica" },
  { emoji: "🇩🇴", label: "Dominikánská republika" },
  { emoji: "🇯🇲", label: "Jamajka Jamaica" },
  // Asie
  { emoji: "🇯🇵", label: "Japonsko Japan" },
  { emoji: "🇰🇷", label: "Jižní Korea South Korea" },
  { emoji: "🇨🇳", label: "Čína China" },
  { emoji: "🇹🇭", label: "Thajsko Thailand" },
  { emoji: "🇻🇳", label: "Vietnam" },
  { emoji: "🇮🇩", label: "Indonésie Indonesia Bali" },
  { emoji: "🇮🇳", label: "Indie India" },
  { emoji: "🇹🇷", label: "Turecko Turkey" },
  { emoji: "🇦🇪", label: "Emiráty UAE Dubaj" },
  { emoji: "🇮🇱", label: "Izrael Israel" },
  { emoji: "🇯🇴", label: "Jordánsko Jordan" },
  { emoji: "🇱🇰", label: "Srí Lanka Sri Lanka" },
  { emoji: "🇲🇻", label: "Maledivy Maldives" },
  { emoji: "🇵🇭", label: "Filipíny Philippines" },
  { emoji: "🇲🇾", label: "Malajsie Malaysia" },
  { emoji: "🇸🇬", label: "Singapur Singapore" },
  { emoji: "🇳🇵", label: "Nepál Nepal" },
  { emoji: "🇬🇪", label: "Gruzie Georgia" },
  // Afrika & Oceánie
  { emoji: "🇪🇬", label: "Egypt" },
  { emoji: "🇲🇦", label: "Maroko Morocco" },
  { emoji: "🇹🇳", label: "Tunisko Tunisia" },
  { emoji: "🇿🇦", label: "Jihoafrická republika South Africa" },
  { emoji: "🇰🇪", label: "Keňa Kenya" },
  { emoji: "🇹🇿", label: "Tanzánie Tanzania" },
  { emoji: "🇦🇺", label: "Austrálie Australia" },
  { emoji: "🇳🇿", label: "Nový Zéland New Zealand" },
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

const EmojiPicker = ({ value, onChange }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJI_LIST;
    const q = search.toLowerCase();
    return EMOJI_LIST.filter((e) => e.label.toLowerCase().includes(q));
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-12 h-12 rounded-lg bg-muted hover:bg-muted/80 text-2xl flex items-center justify-center ring-1 ring-border transition-colors"
        >
          {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <Input
          placeholder="🔍 Hledat zemi nebo emoji…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 text-sm"
          autoFocus
        />
        <ScrollArea className="h-52">
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((e) => (
              <button
                key={e.emoji}
                type="button"
                title={e.label}
                className={`w-9 h-9 rounded-md text-lg flex items-center justify-center transition-colors ${
                  value === e.emoji
                    ? "bg-primary/15 ring-2 ring-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => {
                  onChange(e.emoji);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {e.emoji}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground p-2">Nic nenalezeno</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
