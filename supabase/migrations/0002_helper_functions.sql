-- RLS helper functions. security definer so they can read memberships /
-- storyteller_device_sessions regardless of the calling user's own RLS
-- visibility into those tables (avoids recursive-policy problems).
-- Implements docs/architecture/data-model.md §1.

create or replace function is_circle_member(target_circle_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from memberships
    where circle_id = target_circle_id
      and user_id = auth.uid()
  );
$$;

create or replace function circle_role(target_circle_id uuid)
returns text
language sql security definer stable
as $$
  select role from memberships
  where circle_id = target_circle_id
    and user_id = auth.uid();
$$;

-- Live-checks storyteller_device_sessions.revoked_at so a revoked device
-- loses access on any request that hits this function, bounded by the
-- storyteller JWT's short lifetime (15 min) rather than relying on the
-- JWT alone to reflect revocation.
create or replace function is_storyteller_session(target_circle_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from storyteller_device_sessions s
    join storytellers st on st.id = s.storyteller_id
    where s.id = (auth.jwt() ->> 'storyteller_session_id')::uuid
      and st.id = (auth.jwt() ->> 'storyteller_id')::uuid
      and st.circle_id = target_circle_id
      and s.revoked_at is null
  );
$$;
