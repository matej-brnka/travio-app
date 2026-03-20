import { Place, Day } from "@/data/mockData";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MovePlaceModalProps {
  place: Place;
  days: Day[];
  onClose: () => void;
  onMove: (dayId: string) => void;
}

const MovePlaceModal = ({ place, days, onClose, onMove }: MovePlaceModalProps) => {
  const [selected, setSelected] = useState<string>("");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Přesunout: {place.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {days.map((day, i) => (
            <button
              key={day.id}
              className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors ${
                selected === day.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
              onClick={() => setSelected(day.id)}
            >
              Den {i + 1} – {format(parseISO(day.date), "EE d. MMMM", { locale: cs })}
            </button>
          ))}
          <button
            className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors ${
              selected === "unassigned"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
            onClick={() => setSelected("unassigned")}
          >
            ⚡ Nezařazená místa
          </button>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 rounded-md" onClick={onClose}>
            Zrušit
          </Button>
          <Button
            className="flex-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!selected}
            onClick={() => onMove(selected)}
          >
            Přesunout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovePlaceModal;
