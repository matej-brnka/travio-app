import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  { emoji: "📍", title: "Plánuj místa po dnech", desc: "Přiřaď místa ke konkrétním dnům a drž si přehled." },
  { emoji: "🗺️", title: "Mapa v terénu", desc: "Vidíš svůj plán přímo na mapě s číselnými piny." },
  { emoji: "🤖", title: "AI asistent", desc: "Nech AI navrhnout itinerář a pak si ho uprav." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 py-4">
        <span className="text-xl font-bold text-foreground">✈️ Travio</span>
        <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
          Přihlásit se
        </Button>
      </nav>

      {/* Hero */}
      <motion.section
        className="px-6 pt-12 pb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold leading-tight text-foreground mb-3">
          ✈️ Plánuj výlety<br />jako profík
        </h1>
        <p className="text-muted-foreground text-base mb-8 max-w-xs mx-auto">
          Místa, mapy, itinerář – vše na jednom místě. Plánuj chytře, cestuj bez stresu.
        </p>
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md px-8 py-6 text-lg font-bold shadow-card"
          onClick={() => navigate("/login")}
        >
          🚀 Začít zdarma
        </Button>
      </motion.section>

      {/* Features */}
      <section className="px-6 pb-12">
        <div className="grid gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-lg p-5 shadow-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <span className="text-3xl mb-2 block">{f.emoji}</span>
              <h3 className="text-foreground font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-16 text-center">
        <Button
          variant="outline"
          size="lg"
          className="w-full rounded-md py-6 text-base border-primary text-primary hover:bg-primary/5"
          onClick={() => navigate("/login")}
        >
          Přihlásit se přes Google
        </Button>
      </section>
    </div>
  );
};

export default Landing;
