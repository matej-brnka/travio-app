-- Attach actor identity to service logs for reporting.

alter table if exists llm_calls
  add column if not exists user_id uuid,
  add column if not exists user_email text;

create index if not exists llm_calls_user_id_idx on llm_calls(user_id);
create index if not exists llm_calls_user_email_idx on llm_calls(user_email);

alter table if exists google_places_calls
  add column if not exists user_id uuid,
  add column if not exists user_email text;

create index if not exists google_places_calls_user_id_idx on google_places_calls(user_id);
create index if not exists google_places_calls_user_email_idx on google_places_calls(user_email);
