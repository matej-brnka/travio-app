import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Wrench } from "lucide-react";

interface UserInfo {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export const UserAvatar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          name: meta?.full_name ?? meta?.name ?? "Uživatel",
          email: session.user.email ?? "",
          avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({
          name: meta?.full_name ?? meta?.name ?? "Uživatel",
          email: session.user.email ?? "",
          avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => navigate("/app/service/costs")} className="cursor-pointer">
          <Wrench className="w-4 h-4 mr-2" />
          Náklady na provoz
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/app/service/openai")} className="cursor-pointer">
          <Wrench className="w-4 h-4 mr-2" />
          Servis OpenAI
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/app/service/google-places")} className="cursor-pointer">
          <Wrench className="w-4 h-4 mr-2" />
          Servis Google Places
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Odhlásit se
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
