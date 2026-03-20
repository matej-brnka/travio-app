import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trip } from "@/data/mockData";
import { useTripContext } from "@/context/TripContext";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import NewTripModal from "@/components/NewTripModal";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, loading, addTrip } = useTripContext();
  const [showNewTrip, setShowNewTrip] = useState(false);

  const handleCreateTrip = async (trip: Trip): Promise<void> => {
    const created = await addTrip(trip);
    setShowNewTrip(false);
    navigate(`/app/trip/${created.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xl font-bold text-foreground">✈️ Travio</span>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            U
          </div>
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
    </div>
  );
};

export default Dashboard;
