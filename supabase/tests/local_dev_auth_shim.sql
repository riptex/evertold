-- NOT a Supabase migration — do not put this in supabase/migrations/ and
-- do not run it against a real Supabase project. A real Supabase project
-- (local `supabase start` or hosted) already provides the `auth` schema,
-- `auth.users`, `auth.uid()`/`auth.role()`/`auth.jwt()`, and the
-- `anon`/`authenticated`/`service_role` Postgres roles.
--
-- This shim exists only to verify 0001–0003 against a plain local
-- Postgres instance when Docker (and therefore `supabase start`) isn't
-- available — e.g. this sandbox. It replicates just enough of Supabase's
-- auth surface for the RLS policies in 0003_rls_policies.sql to behave
-- identically to how they'll behave on a real Supabase project:
-- auth.uid()/auth.role()/auth.jwt() read the same `request.jwt.claims`
-- session GUC that PostgREST sets per-request on a real project, and
-- `SET ROLE` switches the actual Postgres role the same way PostgREST
-- does based on the JWT's `role` claim.
--
-- 0004_storage_buckets.sql is NOT covered — the `storage` schema is a
-- Supabase platform extension, not something worth faithfully
-- reimplementing here. Verify that one against a real project.

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

create or replace function auth.uid()
returns uuid
language sql stable
as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid;
$$;

create or replace function auth.role()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
$$;

create or replace function auth.jwt()
returns jsonb
language sql stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

-- Real Supabase grants broad table-level privileges to authenticated/anon
-- and lets RLS narrow rows. Mirror that here — both as a direct grant
-- (covers tables that already exist, if this shim runs after the
-- migrations) and as a default-privileges rule (covers tables the
-- migrations create afterward, if this shim runs first). Run this file
-- either before or after 0001-0003; both orders work.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, anon, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated, anon, service_role;
