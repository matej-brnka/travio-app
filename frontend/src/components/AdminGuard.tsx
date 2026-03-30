import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getMe } from '@/api/auth';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getMe()
      .then((me) => setIsAdmin(!!me.isAdmin))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;
  if (!isAdmin) return <Navigate to="/app" replace />;
  return <>{children}</>;
};
