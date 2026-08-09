create schema if not exists private;

create table if not exists private.allowed_emails (
  email text primary key check (email = lower(email))
);

create or replace function public.hook_restrict_personal_email(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from private.allowed_emails
    where email = lower(event->'user'->>'email')
  ) then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'This personal app is invite-only.'
    )
  );
end;
$$;

revoke all on function public.hook_restrict_personal_email(jsonb) from public, anon, authenticated;
grant execute on function public.hook_restrict_personal_email(jsonb) to supabase_auth_admin;
grant select on private.allowed_emails to supabase_auth_admin;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles', 'training_plans', 'workout_sessions', 'nutrition_profiles']
  loop
    execute format(
      'create table if not exists public.%I (
        id text primary key,
        user_id uuid not null references auth.users(id) on delete cascade,
        data jsonb not null,
        updated_at timestamptz not null,
        deleted_at timestamptz,
        device_id text not null
      )', table_name
    );
    execute format('create index if not exists %I on public.%I(user_id, updated_at desc)', table_name || '_owner_updated_idx', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "owner_all" on public.%I', table_name);
    execute format(
      'create policy "owner_all" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end $$;

create table if not exists public.workout_sets (
  id text primary key,
  session_id text not null references public.workout_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  device_id text not null
);
create index if not exists workout_sets_owner_session_idx on public.workout_sets(user_id, session_id);
alter table public.workout_sets enable row level security;
drop policy if exists "owner_all" on public.workout_sets;
create policy "owner_all" on public.workout_sets for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Replace this placeholder before enabling the Before User Created hook.
-- insert into private.allowed_emails(email) values ('you@example.com') on conflict do nothing;
