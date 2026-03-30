-- Invite-only signup gate for Supabase Auth (works with Google OAuth too).
-- Existing users are unaffected; only new user creation is checked by the hook.

create table if not exists public.auth_signup_invites (
  email       text primary key,
  note        text,
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at  timestamptz
);

create index if not exists auth_signup_invites_revoked_at_idx
  on public.auth_signup_invites (revoked_at);

create or replace function public.hook_check_invite_allowlist(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_allowed boolean;
begin
  v_email := lower(trim(coalesce(event->'user'->>'email', '')));

  if v_email = '' then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 400,
        'message', 'Chybí e-mail pro registraci.'
      )
    );
  end if;

  select exists(
    select 1
    from public.auth_signup_invites i
    where lower(i.email) = v_email
      and i.revoked_at is null
  ) into v_allowed;

  if not v_allowed then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 403,
        'message', 'Registrace je pouze na pozvánku.'
      )
    );
  end if;

  update public.auth_signup_invites
     set accepted_at = coalesce(accepted_at, now())
   where lower(email) = v_email
     and revoked_at is null;

  return '{}'::jsonb;
end;
$$;

-- Permissions required for Postgres Auth Hook execution role.
grant usage on schema public to supabase_auth_admin;
grant select, update on table public.auth_signup_invites to supabase_auth_admin;
grant execute on function public.hook_check_invite_allowlist(jsonb) to supabase_auth_admin;

revoke execute on function public.hook_check_invite_allowlist(jsonb)
  from authenticated, anon, public;
