-- RLS policies for every table. Implements docs/architecture/data-model.md
-- §2–§6. Policy comments below are trimmed from the doc's rationale —
-- read the doc for the "why," this is the "what."

-- ── users ──────────────────────────────────────────────────────────────
alter table users enable row level security;

create policy "select users sharing a circle"
on users for select
using (
  exists (
    select 1 from memberships m1
    join memberships m2 on m1.circle_id = m2.circle_id
    where m1.user_id = auth.uid() and m2.user_id = users.id
  )
  or id = auth.uid()
);

create policy "update own profile"
on users for update
using (id = auth.uid());

-- ── circles ────────────────────────────────────────────────────────────
alter table circles enable row level security;

create policy "select own circles"
on circles for select
using (is_circle_member(id));

create policy "organizer can update circle"
on circles for update
using (circle_role(id) = 'organizer');

-- No insert policy: circle creation happens via an Edge Function
-- (service role) that atomically creates the circle + the creator's
-- organizer membership row, avoiding a chicken-and-egg RLS problem.

-- ── memberships ────────────────────────────────────────────────────────
alter table memberships enable row level security;

create policy "select memberships in own circles"
on memberships for select
using (is_circle_member(circle_id));

create policy "organizer manages memberships"
on memberships for all
using (circle_role(circle_id) = 'organizer')
with check (circle_role(circle_id) = 'organizer');

-- ── storytellers / storyteller_device_sessions ────────────────────────
alter table storytellers enable row level security;
alter table storyteller_device_sessions enable row level security;

create policy "select storytellers in own circle"
on storytellers for select
using (is_circle_member(circle_id));

create policy "organizer manages storyteller pairing"
on storyteller_device_sessions for all
using (
  exists (
    select 1 from storytellers st
    where st.id = storyteller_device_sessions.storyteller_id
      and circle_role(st.circle_id) = 'organizer'
  )
)
with check (
  exists (
    select 1 from storytellers st
    where st.id = storyteller_device_sessions.storyteller_id
      and circle_role(st.circle_id) = 'organizer'
  )
);

-- ── prompt_packs / prompts ─────────────────────────────────────────────
-- Global reference content, not circle-scoped. Readable by any
-- authenticated user; no client write path (seed data / admin tool only).
alter table prompt_packs enable row level security;
alter table prompts enable row level security;

create policy "authenticated users read prompt packs"
on prompt_packs for select
using (auth.role() = 'authenticated');

create policy "authenticated users read prompts"
on prompts for select
using (auth.role() = 'authenticated');

-- ── family_questions ───────────────────────────────────────────────────
-- Decision: Viewer can read (transparency) but not submit — PLAN.md §3.1
-- scopes Viewer to "read + hearts only."
alter table family_questions enable row level security;

create policy "circle members read family questions"
on family_questions for select
using (is_circle_member(circle_id));

create policy "organizer and member submit questions"
on family_questions for insert
with check (circle_role(circle_id) in ('organizer', 'member'));

create policy "storyteller session reads family questions"
on family_questions for select
using (is_storyteller_session(circle_id));

create policy "storyteller session updates question status"
on family_questions for update
using (is_storyteller_session(circle_id))
with check (is_storyteller_session(circle_id));

-- ── stories ────────────────────────────────────────────────────────────
alter table stories enable row level security;

create policy "circle members read stories"
on stories for select
using (is_circle_member(circle_id));

create policy "storyteller session reads own stories"
on stories for select
using (
  is_storyteller_session(circle_id)
  and storyteller_id = (auth.jwt() ->> 'storyteller_id')::uuid
);

create policy "storyteller session inserts own stories"
on stories for insert
with check (
  is_storyteller_session(circle_id)
  and storyteller_id = (auth.jwt() ->> 'storyteller_id')::uuid
);

create policy "storyteller session updates own story status"
on stories for update
using (
  is_storyteller_session(circle_id)
  and storyteller_id = (auth.jwt() ->> 'storyteller_id')::uuid
)
with check (
  is_storyteller_session(circle_id)
  and storyteller_id = (auth.jwt() ->> 'storyteller_id')::uuid
);

create policy "organizer deletes stories"
on stories for delete
using (circle_role(circle_id) = 'organizer');

-- Column-level enforcement (data-model.md flagged this as unresolved by
-- RLS alone — Postgres RLS has no native column-level restriction).
-- Only service_role (the transcription pipeline) may change transcript,
-- title, chapter, or audio_storage_path. The storyteller-session UPDATE
-- policy above would otherwise technically allow overwriting them too.
create or replace function stories_restrict_pipeline_columns()
returns trigger
language plpgsql
as $$
begin
  if current_user <> 'service_role' then
    if new.transcript is distinct from old.transcript
      or new.title is distinct from old.title
      or new.chapter is distinct from old.chapter
      or new.audio_storage_path is distinct from old.audio_storage_path
    then
      raise exception
        'Only the transcription pipeline (service_role) may modify transcript, title, chapter, or audio_storage_path';
    end if;
  end if;
  return new;
end;
$$;

create trigger stories_restrict_pipeline_columns_trg
before update on stories
for each row execute function stories_restrict_pipeline_columns();

-- ── story_media ────────────────────────────────────────────────────────
alter table story_media enable row level security;

create policy "circle members read story media"
on story_media for select
using (is_circle_member(circle_id));

create policy "storyteller session inserts story media"
on story_media for insert
with check (
  is_storyteller_session(circle_id)
  and exists (
    select 1 from stories s
    where s.id = story_media.story_id
      and s.storyteller_id = (auth.jwt() ->> 'storyteller_id')::uuid
  )
);

-- ── reactions ──────────────────────────────────────────────────────────
-- Decision: all three roles, including Viewer, can react — the explicit
-- "hearts" carve-out in PLAN.md §3.1's "read + hearts only."
alter table reactions enable row level security;

create policy "circle members read reactions"
on reactions for select
using (is_circle_member(circle_id));

create policy "storyteller session reads reactions"
on reactions for select
using (is_storyteller_session(circle_id));

create policy "circle members react"
on reactions for insert
with check (is_circle_member(circle_id) and user_id = auth.uid());

create policy "users remove own reaction"
on reactions for delete
using (user_id = auth.uid());

-- ── comments ───────────────────────────────────────────────────────────
-- Decision: Organizer + Member only, same reasoning as family_questions.
-- No storyteller-session insert policy in MVP (not in PLAN.md's MVP
-- feature list — left out rather than speculatively supported).
alter table comments enable row level security;

create policy "circle members read comments"
on comments for select
using (is_circle_member(circle_id));

create policy "storyteller session reads comments"
on comments for select
using (is_storyteller_session(circle_id));

create policy "organizer and member write comments"
on comments for insert
with check (
  circle_role(circle_id) in ('organizer', 'member')
  and user_id = auth.uid()
);

create policy "author or organizer deletes comment"
on comments for delete
using (
  user_id = auth.uid()
  or circle_role(circle_id) = 'organizer'
);

-- ── time_capsules (v1.5 — policy designed now) ───────────────────────
alter table time_capsules enable row level security;

create policy "circle members see unlocked capsules, creator sees all"
on time_capsules for select
using (
  is_circle_member(circle_id)
  and (now() >= unlock_at or created_by = auth.uid() or circle_role(circle_id) = 'organizer')
);

create policy "storyteller session or organizer creates capsules"
on time_capsules for insert
with check (
  is_storyteller_session(circle_id)
  or circle_role(circle_id) = 'organizer'
);

-- ── subscriptions ──────────────────────────────────────────────────────
-- No insert/update/delete policy for any client role. Writes happen
-- exclusively via the RevenueCat webhook Edge Function (service_role,
-- bypasses RLS entirely).
alter table subscriptions enable row level security;

create policy "circle members read subscription status"
on subscriptions for select
using (is_circle_member(circle_id));

-- ── orders (v1.5+ — policy designed now) ─────────────────────────────
alter table orders enable row level security;

create policy "circle members read orders"
on orders for select
using (is_circle_member(circle_id));

create policy "circle members create orders"
on orders for insert
with check (is_circle_member(circle_id) and ordered_by_user_id = auth.uid());

-- ── voice_consents (v3 — deferred, deny-by-default) ──────────────────
-- RLS enabled with zero policies = inaccessible to every client role.
-- Only service_role can touch it until v3 designs real access rules
-- (PLAN.md §3.4: consent recorded on-device, family-only access,
-- deletable forever). See data-model.md §6.
alter table voice_consents enable row level security;
