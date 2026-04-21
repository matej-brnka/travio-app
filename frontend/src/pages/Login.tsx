import { useState } from "react";
import { motion } from "framer-motion";
import { checkInviteGate } from "@/api/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

const getGoogleLoginErrorMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("provider is not enabled")) {
    return "Google provider neni zapnuty v Supabase Auth.";
  }

  if (lowerMessage.includes("redirect") || lowerMessage.includes("redirect_to")) {
    return "OAuth redirect URL neni povolena v Supabase Auth. Pridej tam presnou adresu aplikace vcetne /app.";
  }

  if (lowerMessage.includes("failed to fetch") || lowerMessage.includes("network")) {
    return "Nepodarilo se spojit se Supabase projektem. Zkontroluj VITE_SUPABASE_URL a sitove pripojeni.";
  }

  if (message) {
    return `Nepodarilo se spustit Google prihlaseni: ${message}`;
  }

  return "Nepodarilo se spustit Google prihlaseni.";
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleGoogleLogin = async () => {
    const normalized = email.trim().toLowerCase();

    if (supabaseKey.startsWith("sb_secret_")) {
      toast.error("Frontend je nakonfigurovany se serverovym sb_secret klicem. Pouzij sb_publishable nebo legacy anon klic.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      toast.error("Zadej prosim platny e-mail.");
      return;
    }

    setLoading(true);
    try {
      const gate = await checkInviteGate(normalized);
      if (!gate.allowed) {
        toast.error("Pro tento e-mail zatim neni aktivni pozvanka.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/app`,
          queryParams: { login_hint: normalized },
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error("Supabase nevratil OAuth URL.");
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error("Google login failed", error);
      toast.error(getGoogleLoginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        className="bg-card rounded-lg shadow-card p-8 w-full max-w-sm text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-4xl block mb-4">✈️</span>
        <h1 className="text-2xl font-bold text-foreground mb-1">Travio</h1>
        <p className="text-foreground text-lg font-bold mb-1">Vitej zpatky!</p>
        <p className="text-muted-foreground text-sm mb-8">
          Prihlas se a zacni planovat svuj dalsi vylet.
        </p>

        <Input
          type="email"
          placeholder="Tvuj e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3"
          autoComplete="email"
        />

        <Button
          size="lg"
          className="w-full rounded-md py-6 text-base bg-card text-foreground border border-border hover:bg-muted shadow-sm font-medium mb-4"
          onClick={handleGoogleLogin}
          disabled={loading || !email.trim()}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Prihlasit se pres Google
        </Button>

        <p className="text-muted-foreground text-xs">
          Pristup je jen na pozvanku. Bez aktivni pozvanky te k Google prihlaseni nepustime.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
