import { useState, useEffect } from "react";
import { Trip } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInDays, parseISO } from "date-fns";
import EmojiPicker from "@/components/EmojiPicker";

interface EditTripModalProps {
  open: boolean;
  trip: Trip;
  onClose: () => void;
  onSave: (updates: { name: string; emoji: string; dateFrom: string; dateTo: string }) => void;
}

const EditTripModal = ({ open, trip, onClose, onSave }: EditTripModalProps) => {
  const [name, setName] = useState(trip.name);
  const [emoji, setEmoji] = useState(trip.emoji);
  const [dateFrom, setDateFrom] = useState(trip.dateFrom);
  const [dateTo, setDateTo] = useState(trip.dateTo);

  // Sync when trip changes or modal opens
  useEffect(() => {
    if (open) {
      setName(trip.name);
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
    onSave({ name, emoji, dateFrom, dateTo });
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

          {/* Name */}
          <div>
            <Label className="text-foreground text-sm">Název cesty</Label>
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
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
            </div>
            {totalDays > 0 && (
              <p className="text-sm text-muted-foreground mt-2">📅 {totalDays} dní</p>
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
