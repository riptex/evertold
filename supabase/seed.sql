-- Seed data for local development and RLS verification.
-- Two circles with no shared membership, so cross-circle isolation is
-- actually exercisable — see supabase/tests/rls_verification.sql.
-- Fixed UUIDs (not gen_random_uuid()) so the verification script can
-- reference specific rows.

-- auth.users rows are normally created by Supabase Auth (GoTrue), not
-- direct insert — but seeding fake ones directly is the standard local-
-- dev pattern so public.users' FK to auth.users(id) resolves.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'alice@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'bob@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'carol@example.com'),
  ('00000000-0000-0000-0000-000000000004', 'dana@example.com')
on conflict (id) do nothing;

insert into users (id, display_name) values
  ('00000000-0000-0000-0000-000000000001', 'Alice Whitfield'),
  ('00000000-0000-0000-0000-000000000002', 'Bob Whitfield'),
  ('00000000-0000-0000-0000-000000000003', 'Carol Whitfield'),
  ('00000000-0000-0000-0000-000000000004', 'Dana Alvarez');

insert into circles (id, name, created_by) values
  ('10000000-0000-0000-0000-000000000001', 'The Whitfield Family', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'The Alvarez Family', '00000000-0000-0000-0000-000000000004');

insert into memberships (circle_id, user_id, role) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'organizer'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'member'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'viewer'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'organizer');

insert into storytellers (id, circle_id, display_name) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Grandma June'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Abuelo Rafael');

insert into storyteller_device_sessions (id, storyteller_id, device_id, created_by) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'device-june-ipad', '00000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'device-rafael-iphone', '00000000-0000-0000-0000-000000000004');

insert into prompt_packs (id, title, description, sort_order, is_free) values
  ('40000000-0000-0000-0000-000000000001', 'Childhood', 'Growing up years', 1, true),
  ('40000000-0000-0000-0000-000000000002', 'Work Life', 'Career and working years', 2, true),
  ('40000000-0000-0000-0000-000000000003', 'Faith & Beliefs', 'What you believe and why', 3, false);

insert into prompts (prompt_pack_id, text, sort_order) values
  ('40000000-0000-0000-0000-000000000001', 'What is your earliest memory?', 1),
  ('40000000-0000-0000-0000-000000000001', 'What was your childhood home like?', 2),
  ('40000000-0000-0000-0000-000000000002', 'What was your first job?', 1);

insert into family_questions (id, circle_id, submitted_by, text, status) values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'What was your first job?', 'pending');

insert into stories (id, circle_id, storyteller_id, title, transcript, chapter, capture_mode, status, duration_seconds) values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
   'The winter the pond froze over', 'It was the coldest winter I can remember...', 'Childhood', 'voice', 'ready', 184),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
   'Crossing the border in 1962', 'We left at dawn, before anyone was awake...', 'Family', 'voice', 'ready', 221);

insert into reactions (story_id, circle_id, user_id) values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

insert into comments (story_id, circle_id, user_id, comment_type, body) values
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'text', 'I remember you telling me this one, Grandma!');
