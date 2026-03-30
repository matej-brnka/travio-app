import { supabase } from '../lib/supabase';
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3123/api';

/**
 * Fire-and-forget telemetry beacon. Never throws.
 */
export const sendTelemetry = (event: string, metadata?: Record<string, unknown>): void => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    const token = session?.access_token;
    if (!token) return;
    fetch(`${API_BASE}/service/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event, metadata }),
    }).catch(() => {});
  });
};
