-- RLS verification suite. Run against a database that has:
--   1. supabase/tests/local_dev_auth_shim.sql (local-only) OR a real
--      Supabase project (local `supabase start` or hosted) — either order
--      relative to the migrations below is fine for the shim.
--   2. supabase/migrations/0001_core_tables.sql
--   3. supabase/migrations/0002_helper_functions.sql
--   4. supabase/migrations/0003_rls_policies.sql
--   5. supabase/seed.sql
--
-- Wrapped in a transaction that's rolled back at the end, so it's
-- re-runnable without mutating seed state. Every SET is SET LOCAL /
-- set_config(..., true) so it's automatically undone at ROLLBACK too.
--
-- These are the fixed seed IDs from supabase/seed.sql:
--   Alice (organizer, Circle A)  00000000-0000-0000-0000-000000000001
--   Bob    (member,    Circle A) 00000000-0000-0000-0000-000000000002
--   Carol  (viewer,    Circle A) 00000000-0000-0000-0000-000000000003
--   Dana   (organizer, Circle B) 00000000-0000-0000-0000-000000000004
--   Circle A                     10000000-0000-0000-0000-000000000001
--   Circle B                     10000000-0000-0000-0000-000000000002
--   Storyteller ST1 (Circle A)   20000000-0000-0000-0000-000000000001
--   Device session for ST1        30000000-0000-0000-0000-000000000001
--   Story S1 (Circle A)          60000000-0000-0000-0000-000000000001
--   Story S2 (Circle B)          60000000-0000-0000-0000-000000000002

begin;

create or replace function assert_row_count(query text, expected int, label text)
returns void
language plpgsql
as $$
declare
  actual int;
begin
  execute 'select count(*) from (' || query || ') t' into actual;
  if actual <> expected then
    raise exception 'FAIL: % — expected % rows, got %', label, expected, actual;
  else
    raise notice 'PASS: % (% rows)', label, actual;
  end if;
end;
$$;

-- For INSERT/UPDATE/DELETE, "no exception" is not the same as "actually
-- happened" — RLS makes a row invisible by silently excluding it from the
-- WHERE match, which is a real, error-free 0-row no-op. Both helpers
-- check affected row count via GET DIAGNOSTICS, not just exception
-- presence, so a policy that quietly filters out the target row is
-- caught the same as one that raises.
create or replace function assert_fails(stmt text, label text)
returns void
language plpgsql
as $$
declare
  affected int;
begin
  begin
    execute stmt;
    get diagnostics affected = row_count;
    if affected > 0 then
      raise exception 'FAIL: % — expected to be rejected but affected % row(s)', label, affected;
    end if;
    raise notice 'PASS: % (correctly matched/affected 0 rows)', label;
  exception
    when others then
      if sqlerrm like 'FAIL:%' then
        raise;
      end if;
      raise notice 'PASS: % (correctly rejected: %)', label, sqlerrm;
  end;
end;
$$;

create or replace function assert_succeeds(stmt text, label text)
returns void
language plpgsql
as $$
declare
  affected int;
begin
  execute stmt;
  get diagnostics affected = row_count;
  if affected = 0 then
    raise exception 'FAIL: % — statement ran with no error but affected 0 rows (RLS likely hid the target row)', label;
  end if;
  raise notice 'PASS: % (succeeded, % row(s) affected)', label, affected;
end;
$$;

-- ── Cross-circle isolation ───────────────────────────────────────────

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

select assert_row_count(
  'select * from stories',
  1,
  'Bob (Circle A member) sees only Circle A''s story, not Circle B''s'
);
select assert_row_count(
  'select * from stories where id = ''60000000-0000-0000-0000-000000000002''',
  0,
  'Bob cannot see Circle B''s specific story by ID'
);
select assert_row_count(
  'select * from circles',
  1,
  'Bob sees only Circle A'
);
select assert_row_count(
  'select * from memberships',
  3,
  'Bob sees only Circle A''s membership list (3 rows), not Circle B''s'
);

reset role;
select set_config('request.jwt.claims', '', true);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000004","role":"authenticated"}', true);

select assert_row_count(
  'select * from stories',
  1,
  'Dana (Circle B organizer) sees only Circle B''s story, not Circle A''s'
);
select assert_row_count(
  'select * from stories where id = ''60000000-0000-0000-0000-000000000001''',
  0,
  'Dana cannot see Circle A''s specific story by ID'
);

reset role;
select set_config('request.jwt.claims', '', true);

-- A user with zero memberships anywhere sees nothing, in any circle-scoped table.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"99999999-0000-0000-0000-000000000099","role":"authenticated"}', true);

select assert_row_count('select * from stories', 0, 'Stray user with no membership sees zero stories');
select assert_row_count('select * from circles', 0, 'Stray user with no membership sees zero circles');
select assert_row_count('select * from family_questions', 0, 'Stray user with no membership sees zero family questions');

reset role;
select set_config('request.jwt.claims', '', true);

-- ── Viewer role: read + hearts only ─────────────────────────────────

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}', true);

select assert_fails(
  $stmt$insert into comments (story_id, circle_id, user_id, comment_type, body)
        values ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
                 '00000000-0000-0000-0000-000000000003', 'text', 'Carol trying to comment')$stmt$,
  'Carol (viewer) cannot insert a comment'
);

select assert_fails(
  $stmt$insert into family_questions (circle_id, submitted_by, text)
        values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Carol trying to ask a question')$stmt$,
  'Carol (viewer) cannot submit a family question'
);

select assert_succeeds(
  $stmt$insert into reactions (story_id, circle_id, user_id)
        values ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
                 '00000000-0000-0000-0000-000000000003')$stmt$,
  'Carol (viewer) CAN react — the explicit read+hearts carve-out'
);

reset role;
select set_config('request.jwt.claims', '', true);

-- ── Member role: can comment ─────────────────────────────────────────

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

select assert_succeeds(
  $stmt$insert into comments (story_id, circle_id, user_id, comment_type, body)
        values ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
                 '00000000-0000-0000-0000-000000000002', 'text', 'Bob leaving a second comment')$stmt$,
  'Bob (member) CAN insert a comment'
);

reset role;
select set_config('request.jwt.claims', '', true);

-- ── Storyteller device session boundary ─────────────────────────────

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","storyteller_id":"20000000-0000-0000-0000-000000000001","storyteller_session_id":"30000000-0000-0000-0000-000000000001"}',
  true
);

select assert_succeeds(
  $stmt$insert into stories (circle_id, storyteller_id, capture_mode, status)
        values ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'voice', 'recording')$stmt$,
  'Storyteller session (ST1) CAN insert a story into its own circle'
);

select assert_fails(
  $stmt$insert into stories (circle_id, storyteller_id, capture_mode, status)
        values ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'voice', 'recording')$stmt$,
  'Storyteller session (ST1, Circle A) CANNOT insert a story into Circle B'
);

select assert_fails(
  $stmt$update stories set transcript = 'a storyteller session trying to write its own transcript'
        where id = '60000000-0000-0000-0000-000000000001'$stmt$,
  'Storyteller session CANNOT write stories.transcript (service_role-only column)'
);

select assert_succeeds(
  $stmt$update stories set status = 'uploading' where id = '60000000-0000-0000-0000-000000000001'$stmt$,
  'Storyteller session CAN update its own story''s status'
);

reset role;
select set_config('request.jwt.claims', '', true);

-- service_role bypasses RLS and is exempt from the column-restriction
-- trigger — this is the transcription pipeline's own write path.
set local role service_role;

select assert_succeeds(
  $stmt$update stories set transcript = 'service_role writing the real transcript',
         title = 'A generated title', chapter = 'Childhood'
        where id = '60000000-0000-0000-0000-000000000001'$stmt$,
  'service_role CAN write stories.transcript/title/chapter (the pipeline''s job)'
);

reset role;

rollback;
