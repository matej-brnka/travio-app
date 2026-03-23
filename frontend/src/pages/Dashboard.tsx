import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/data/mockData";
import { useTripContext } from "@/context/TripContext";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import NewTripModal from "@/components/NewTripModal";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, loading, addTrip } = useTripContext();
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleCreateTrip = async (trip: Trip & { useAi?: boolean }): Promise<void> => {
    const isAiTrip = Boolean(trip.useAi);
    console.log("[AI TRIP] Start create flow", {
      useAi: isAiTrip,
      name: trip.name,
      interests: trip.interests ?? [],
    });

    setShowNewTrip(false);
    if (isAiTrip) setAiGenerating(true);

    try {
      const created = await addTrip(trip);
      console.log("[AI TRIP] Trip created successfully", { tripId: created.id });
      navigate(`/app/trip/${created.id}`);
    } catch (error) {
      console.error("[AI TRIP] Trip creation failed", error);
      setShowNewTrip(true);
    } finally {
      if (isAiTrip) setAiGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xl font-bold text-foreground">✈️ Travio</span>
        <div className="flex items-center gap-3">
          <UserAvatar />
        </div>
      </div>

      <div className="px-5 pb-24">
        <h1 className="text-2xl font-bold text-foreground mb-5">Moje cesty ✈️</h1>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-lg shadow-card p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            className="bg-card rounded-lg shadow-card p-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-5xl block mb-4">✈️</span>
            <p className="text-foreground font-bold text-lg mb-1">Zatím nemáte žádné výlety</p>
            <p className="text-muted-foreground text-sm mb-6">Začněte plánovat svůj první výlet!</p>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
              onClick={() => setShowNewTrip(true)}
            >
              + Přidat první cestu
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <TripCard trip={trip} onClick={() => navigate(`/app/trip/${trip.id}`)} />
              </motion.div>
            ))}
            <button
              onClick={() => setShowNewTrip(true)}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              + Přidat cestu
            </button>
          </div>
        )}
      </div>


      <NewTripModal
        open={showNewTrip}
        onClose={() => setShowNewTrip(false)}
        onCreate={handleCreateTrip}
      />

      {aiGenerating && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <div className="relative h-20 overflow-hidden mb-5">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 text-4xl"
                initial={{ x: "-20%" }}
                animate={{ x: "115%" }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              >
                ✈️
              </motion.div>
            </div>
            <h2 className="text-lg font-semibold text-foreground">AI připravuje tvůj výlet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Generuji tipy na místa podle zadaných preferencí...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
