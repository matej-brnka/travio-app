import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { deleteInvite, listInvites, restoreInvite, revokeInvite, upsertInvite, InviteRecord } from '@/api/invites';

const InvitesService = () => {
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInvites(500);
      setInvites(data.invites);
    } catch (e: any) {
      setError(e.message ?? 'Nepodařilo se načíst pozvánky');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(() => invites.filter((i) => !i.revokedAt).length, [invites]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await upsertInvite(email.trim(), note.trim() || undefined);
      setEmail('');
      setNote('');
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Nepodařilo se uložit pozvánku');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (targetEmail: string) => {
    try {
      await revokeInvite(targetEmail);
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Nepodařilo se revoke');
    }
  };

  const handleRestore = async (targetEmail: string) => {
    try {
      await restoreInvite(targetEmail);
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Nepodařilo se restore');
    }
  };

  const handleDelete = async (targetEmail: string) => {
    try {
      await deleteInvite(targetEmail);
      await load();
    } catch (e: any) {
      setError(e.message ?? 'Nepodařilo se smazat');
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invite Dashboard</h1>
            <p className="text-sm text-muted-foreground">Správa pozvánek pro registraci nových účtů.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>{loading ? 'Načítám...' : 'Obnovit'}</Button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Celkem</p>
              <p className="text-xl font-bold">{invites.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <p className="text-xs text-muted-foreground">Aktivní</p>
              <p className="text-xl font-bold">{activeCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Přidat pozvánku</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Poznámka (volitelné)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button onClick={handleAdd} disabled={saving || !email.trim()}>
              {saving ? 'Ukládám...' : 'Přidat / obnovit pozvánku'}
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pozvánky</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!loading && invites.length === 0 && (
              <p className="text-sm text-muted-foreground">Zatím nejsou žádné pozvánky.</p>
            )}
            {invites.map((inv) => (
              <div key={inv.email} className="border rounded-md p-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{inv.email}</p>
                  {inv.note && <p className="text-xs text-muted-foreground truncate">{inv.note}</p>}
                  <p className="text-xs text-muted-foreground">
                    created: {new Date(inv.createdAt).toLocaleString()}
                    {inv.acceptedAt ? ` · accepted: ${new Date(inv.acceptedAt).toLocaleString()}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.revokedAt ? <Badge variant="destructive">revoked</Badge> : <Badge>active</Badge>}
                  {inv.revokedAt ? (
                    <Button size="sm" variant="outline" onClick={() => handleRestore(inv.email)}>Restore</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleRevoke(inv.email)}>Revoke</Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(inv.email)}>
                    Smazat
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitesService;
