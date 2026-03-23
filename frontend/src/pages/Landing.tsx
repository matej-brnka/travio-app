import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Map as MapIcon, 
  Calendar, 
  Sparkles, 
  CloudSun, 
  Share2, 
  Smartphone, 
  Layout,
  CheckCircle2,
  ChevronRight,
  Navigation
} from "lucide-react";

const FeatureCard = ({ icon: Icon, title, desc, delay = 0 }: any) => (
  <motion.div
    className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

const AppPreview = () => (
  <div className="relative mx-auto max-w-[1000px] w-full">
    {/* Main Desktop Window Mockup */}
    <div className="relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden hidden lg:block aspect-[16/10]">
      {/* Browser Chrome */}
      <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/20" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/20" />
          <div className="w-3 h-3 rounded-full bg-green-400/20" />
        </div>
        <div className="mx-auto bg-card rounded px-3 py-1 text-[10px] text-muted-foreground border border-border w-1/3 text-center">
          travio.app/trip/nyc-2025
        </div>
      </div>
      
      {/* Mock Content */}
      <div className="flex h-[calc(100%-40px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4 space-y-4">
          <div className="h-4 w-24 bg-primary/10 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-10 rounded-md flex items-center px-3 gap-2 ${i === 1 ? 'bg-primary text-white font-medium' : 'bg-muted/50 text-muted-foreground'}`}>
                <div className="w-4 h-4 rounded-full bg-current opacity-20" />
                <div className={`h-2 rounded bg-current ${i === 1 ? 'w-16 opacity-100' : 'w-12 opacity-30'}`} />
              </div>
            ))}
          </div>
        </div>
        {/* Content Area (Map Placeholder) */}
        <div className="flex-1 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)", 
            backgroundSize: "24px 24px" 
          }} />
          {/* Pins */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">1</div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">2</div>
          <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">3</div>
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
            <path d="M 280 150 Q 350 200 420 280 T 600 350" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray="6,4" />
          </svg>
        </div>
      </div>
    </div>

    {/* Floating Mobile Mockup */}
    <div className="lg:absolute -bottom-10 -right-6 mx-auto mt-8 lg:mt-0 w-[240px] aspect-[9/19.5] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-[6px] border-slate-900 ring-1 ring-white/10 z-10">
      <div className="bg-card w-full h-full rounded-[30px] overflow-hidden relative">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-20" />
        
        {/* Mock Mobile Content */}
        <div className="p-4 space-y-4 pt-8">
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="w-8 h-8 rounded-full bg-primary/20" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted/50 rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{i}</div>
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-2 w-2/3 bg-foreground/20 rounded" />
                    <div className="h-1.5 w-1/3 bg-muted-foreground/30 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      {/* Gradient Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
              <Navigation className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">Travio</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Přihlásit se
            </button>
            <Button 
              size="sm" 
              className="rounded-full px-5 font-bold shadow-sm"
              onClick={() => navigate("/login")}
            >
              Začít plánovat
            </Button>
          </div>
        </div>
      </header>

      <main className="relative pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-6 max-w-7xl mx-auto text-center mb-24 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 border border-primary/10">
              <Sparkles className="w-3 h-3" />
              <span>TVŮJ NOVÝ CESTOVNÍ PARŤÁK</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
              Plánuj výlety s <br className="hidden md:block" />
              <span className="text-primary italic">lehkostí</span> a přehledem
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Místa, itinerář i mapa na jedné obrazovce. <br className="hidden sm:block" />
              Od New Yorku po Beskydy – měj svůj plán vždy po ruce.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 w-full sm:w-auto"
                onClick={() => navigate("/login")}
              >
                Vytvořit itinerář
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </section>

        {/* App Preview Container */}
        <section className="px-6 mb-32 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <AppPreview />
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="px-6 max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Vše, co pro cestu potřebuješ</h2>
            <p className="text-muted-foreground">Postaveno pro cestovatele, kteří chtějí mít ve svých plánech pořádek.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Layout} 
              title="Organizace po dnech"
              desc="Přiřaď místa ke konkrétním dnům nebo je nech 'v záloze', dokud se nerozhodneš."
              delay={0}
            />
            <FeatureCard 
              icon={MapIcon} 
              title="Interaktivní mapa"
              desc="Vidíš přesnou trasu a vzdálenosti. Už žádné vracení se přes půl města."
              delay={0.1}
            />
            <FeatureCard 
              icon={Sparkles} 
              title="AI Návrhy"
              desc="Nech si od naší AI vygenerovat základní plán pro jakoukoli destinaci na světě."
              delay={0.2}
            />
            <FeatureCard 
              icon={CloudSun} 
              title="Počasí v plánu"
              desc="Aplikace ti ukáže předpověď (nebo historický průměr) pro každý den tvé cesty."
              delay={0.3}
            />
            <FeatureCard 
              icon={Share2} 
              title="Sdílení jedním klikem"
              desc="Pošli odkaz kamarádům nebo rodině. Můžou sledovat tvůj plán bez přihlášení."
              delay={0.4}
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Optimalizováno pro mobil"
              desc="V terénu oceníš rychlost a přehlednost. Tvůj plán je vždycky v kapse."
              delay={0.5}
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-32 max-w-4xl mx-auto text-center">
          <div className="bg-foreground text-background rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
            
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 relative z-10">
              Připraven na další <br /> dobrodružství?
            </h2>
            <p className="text-background/70 text-lg mb-12 relative z-10 max-w-md mx-auto">
              Začni plánovat svou další cestu ještě dnes. Jednoduše, přehledně a zdarma.
            </p>
            <Button
              size="lg"
              className="bg-primary text-white h-16 px-12 text-xl font-bold rounded-2xl relative z-10 hover:scale-105 transition-transform"
              onClick={() => navigate("/login")}
            >
              🚀 Jdu do toho
            </Button>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6 relative z-10">
              <div className="flex items-center gap-2 text-background/60 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Bez zbytečností</span>
              </div>
              <div className="flex items-center gap-2 text-background/60 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Plánování zdarma</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-border/50 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-[10px] font-bold">
              <Navigation className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-foreground">Travio</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">O aplikaci</a>
            <a href="#" className="hover:text-primary transition-colors">Podmínky</a>
            <a href="#" className="hover:text-primary transition-colors">Kontakt</a>
          </div>
          
          <div className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} Travio. Všechna práva vyhrazena.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
