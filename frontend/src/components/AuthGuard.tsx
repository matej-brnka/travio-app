import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
