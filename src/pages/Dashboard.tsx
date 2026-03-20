import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockTrips, Trip } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import NewTripModal from "@/components/NewTripModal";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [showNewTrip, setShowNewTrip] = useState(false);

  const handleCreateTrip = (trip: Trip) => {
    setTrips([...trips, trip]);
    setShowNewTrip(false);
    navigate(`/app/trip/${trip.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-xl font-bold text-foreground">✈️ Travio</span>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
            U
          </div>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md"
            onClick={() => setShowNewTrip(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Nová
          </Button>
        </div>
      </div>

      <div className="px-5 pb-24">
        <h1 className="text-2xl font-bold text-foreground mb-5">Moje cesty ✈️</h1>

        {trips.length === 0 ? (
          <motion.div
            className="bg-card rounded-lg shadow-card p-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-5xl block mb-4">✈️</span>
            <p className="text-foreground font-bold text-lg mb-1">Zatím nemáte žádné výlety</p>
            <p className="text-muted-foreground text-sm mb-6">
              Začněte plánovat svůj první výlet!
            </p>
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

            {/* Add trip card */}
            <button
              onClick={() => setShowNewTrip(true)}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              + Přidat cestu
            </button>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center text-2xl hover:bg-accent/90 transition-colors z-50"
        onClick={() => setShowNewTrip(true)}
      >
        +
      </button>

      <NewTripModal
        open={showNewTrip}
        onClose={() => setShowNewTrip(false)}
        onCreate={handleCreateTrip}
      />
    </div>
  );
};

export default Dashboard;
