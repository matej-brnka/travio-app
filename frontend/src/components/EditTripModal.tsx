import { useState, useEffect } from "react";
import { Trip } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { differenceInDays, parseISO, format } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/EmojiPicker";

interface EditTripModalProps {
  open: boolean;
  trip: Trip;
  onClose: () => void;
  onSave: (updates: { name: string; title: string | null; emoji: string; dateFrom: string; dateTo: string }) => void;
}

const EditTripModal = ({ open, trip, onClose, onSave }: EditTripModalProps) => {
  const [name, setName] = useState(trip.name);
  const [title, setTitle] = useState(trip.title ?? "");
  const [emoji, setEmoji] = useState(trip.emoji);
  const [dateFrom, setDateFrom] = useState(trip.dateFrom);
  const [dateTo, setDateTo] = useState(trip.dateTo);

  // Sync when trip changes or modal opens
  useEffect(() => {
    if (open) {
      setName(trip.name);
      setTitle(trip.title ?? "");
      setEmoji(trip.emoji);
      setDateFrom(trip.dateFrom);
      setDateTo(trip.dateTo);
    }
  }, [open, trip]);

  const totalDays =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) + 1 : 0;
  const totalNights =
    dateFrom && dateTo ? differenceInDays(parseISO(dateTo), parseISO(dateFrom)) : 0;
  const isValid = name.trim() && dateFrom && dateTo && totalDays > 0;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ name, title: title.trim() || null, emoji, dateFrom, dateTo });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">✏️ Upravit cestu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Emoji */}
          <div>
            <Label className="text-foreground text-sm">Emoji</Label>
            <div className="mt-1">
              <EmojiPicker value={emoji} onChange={setEmoji} />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label className="text-foreground text-sm">Název výletu <span className="text-muted-foreground text-xs">(nepovinné)</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. Líbánky v Paříži"
              className="mt-1"
            />
          </div>

          {/* Destination */}
          <div>
            <Label className="text-foreground text-sm">Destinace</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Např. New York"
              className="mt-1"
            />
          </div>

          {/* Dates */}
          <div>
            <Label className="text-foreground text-sm">Datum cesty</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <span className="text-xs text-muted-foreground">Datum odjezdu</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-0.5 text-sm", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(parseISO(dateFrom), "d. M. yyyy") : "Vyber datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom ? parseISO(dateFrom) : undefined}
                      onSelect={(d) => d && setDateFrom(format(d, "yyyy-MM-dd"))}
                      locale={cs}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Datum příjezdu</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-0.5 text-sm", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(parseISO(dateTo), "d. M. yyyy") : "Vyber datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo ? parseISO(dateTo) : undefined}
                      onSelect={(d) => d && setDateTo(format(d, "yyyy-MM-dd"))}
                      disabled={(d) => dateFrom ? d < parseISO(dateFrom) : false}
                      locale={cs}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {totalDays > 0 && (
              <p className="text-sm text-muted-foreground mt-2">📅 {totalDays} dní · {totalNights} nocí</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-md" onClick={onClose}>
              Zrušit
            </Button>
            <Button
              className="flex-1 rounded-md bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleSave}
              disabled={!isValid}
            >
              ✅ Uložit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripModal;
