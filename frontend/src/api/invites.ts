import { apiFetch } from './client';

export interface InviteRecord {
  email: string;
  note: string | null;
  createdAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export const listInvites = (limit = 200) =>
  apiFetch<{ invites: InviteRecord[] }>(`/service/invites?limit=${limit}`);

export const upsertInvite = (email: string, note?: string) =>
  apiFetch<{ invite: InviteRecord }>('/service/invites', {
    method: 'POST',
    body: JSON.stringify({ email, note }),
  });

export const revokeInvite = (email: string) =>
  apiFetch<{ ok: boolean }>('/service/invites/revoke', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const restoreInvite = (email: string) =>
  apiFetch<{ ok: boolean }>('/service/invites/restore', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const deleteInvite = (email: string) =>
  apiFetch<{ ok: boolean }>(`/service/invites?email=${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });

export const checkInviteGate = (email: string) =>
  apiFetch<{ allowed: boolean; message: string }>(`/service/invite-gate/check?email=${encodeURIComponent(email)}`);
