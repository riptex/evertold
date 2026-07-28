# Data Model & RLS Policy Spec

Implements `docs/tasks/01-data-model-rls.md`. This is the source of truth for `supabase/migrations/` (task 03) — if implementation surfaces a gap or contradiction here, fix this doc first, don't silently resolve it in SQL.

Every user-data table is `circle_id`-scoped (directly or via denormalized column, chosen for RLS simplicity over an extra join on hot paths like reactions/comments). No table holding user data lacks an RLS policy — `voice_consents` is the one explicit exception, covered in §6.

> **Correction (found during task 03 implementation, via the actual RLS verification suite — see `supabase/tests/rls_verification.sql`):** the original version of this doc granted the storyteller session `UPDATE` on `stories` and `family_questions`, and described it as able to read `comments`/`reactions`/`family_questions`, without ever granting it a matching `SELECT` policy. In Postgres, `UPDATE ... WHERE ...` needs a row to be visible under *some* applicable `SELECT`-type policy to be a candidate at all — an `UPDATE` policy's own `USING` clause is not sufficient by itself. Without the `SELECT` grant, the storyteller's `UPDATE` silently matched zero rows (no error — just a no-op), and a nested `EXISTS` check against `stories` inside `story_media`'s insert policy failed the same way, since that subquery is evaluated as the calling role and is itself subject to `stories`' RLS. This wasn't caught by review — it only surfaced when the verification suite checked actual row counts / affected rows rather than "did an exception get raised." The missing `SELECT` policies are added below (§ `family_questions`, § `stories`, § `reactions`, § `comments`), scoped to the same boundary already documented in the table above — no change to *what* the storyteller session is meant to access, only to making that access actually work.

---

## 0. Roles & auth principals

Three roles, from PLAN.md §2:

| Role | Read | Write |
|---|---|---|
| **Organizer** | everything in their circle(s) | manage membership, subscriptions view, orders, delete stories/comments (moderation) |
| **Member** | everything in their circle(s) | submit questions, comment (text + voice), react (hearts), order keepsakes |
| **Viewer** | everything in their circle(s) | react (hearts) only — **no** comments, **no** family questions. Per PLAN.md §3.1: "Viewer-only for extended friends/family... read + hearts only." |

A fourth principal is **not a role in `memberships`** — it's a separate auth mechanism:

**Storyteller device session.** PLAN.md §5: "storyteller devices get a long-lived scoped session." A storyteller is not necessarily a full account holder (§2: "One-tap voice recording... no login friction"). Design:

- Organizer pairs a device (in-app pairing flow, e.g. a short-lived code shown on the elder's device, entered by the organizer, or vice versa).
- An Edge Function (service role) creates a row in `storyteller_device_sessions` and mints a Supabase JWT carrying custom claims `storyteller_id` and `circle_id`.
- The JWT is **short-lived (15 min)**. The app silently refreshes it via another Edge Function call before expiry; that refresh call checks `storyteller_device_sessions.revoked_at IS NULL` before reissuing. This is the actual revocation mechanism — Supabase JWTs can't be revoked mid-lifetime, so keeping the lifetime short bounds how long a revoked device stays functional (worst case ~15 min).
- RLS policies key off `(auth.jwt() ->> 'circle_id')::uuid` and `(auth.jwt() ->> 'storyteller_id')::uuid` for storyteller-scoped operations. See helper functions in §1.

**Storyteller device session boundary — explicit, per task acceptance criteria:**

| Can | Cannot |
|---|---|
| SELECT + INSERT own `stories` (own `storyteller_id`, own `circle_id`) | Write `stories.transcript` / `.title` / `.chapter` (Edge Function / service role only) |
| UPDATE own `stories.status` (recording → uploading → processing) | DELETE anything |
| INSERT `story_media` linked to own stories | Access `subscriptions`, `orders`, `voice_consents`, `memberships` |
| SELECT `prompts` / `prompt_packs` (global, unauthenticated-readable content anyway) | SELECT `circles` table (the app already has circle name/id from pairing; no need to grant a query path) |
| SELECT + UPDATE `family_questions` for own circle (mark answered/dismissed) | Access any other circle's data, under any condition |
| SELECT `comments` / `reactions` on own circle's stories (read-only) | Write `comments` or `reactions` (storyteller replying to family is a future feature, not MVP) |
| UPDATE own `storyteller_device_sessions.last_seen_at` (heartbeat) | Read or write any other device session's row |

---

## 1. Helper functions (used by every policy below)

```sql
-- Is the current authenticated user a member of this circle, any role?
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

-- What role does the current user hold in this circle? null if none.
create or replace function circle_role(target_circle_id uuid)
returns text
language sql security definer stable
as $$
  select role from memberships
  where circle_id = target_circle_id
    and user_id = auth.uid();
$$;

-- Is this request coming from a valid, non-revoked storyteller device
-- session scoped to this circle? Checks the JWT claim AND does a live
-- lookup so a revoked session (mid-JWT-lifetime, worst case ~15 min) is
-- still caught on any subsequent request that happens to hit this check.
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
```

`security definer` is required so these functions can read `memberships` / `storyteller_device_sessions` regardless of the calling user's own RLS visibility into those tables (otherwise you get recursive-policy problems). Keep them `stable`, not `volatile`, so the planner can call them once per statement where possible.

---

## 2. Schema

### `users`
Mirrors `auth.users`; one row per account holder. Storytellers without a full account (pure device-session flow) do **not** get a row here.

```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);
```

**RLS:** every authenticated user can `SELECT` any `users` row that shares a circle with them (needed to render names on comments/reactions/feed). No cross-circle visibility.

```sql
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
```

### `circles`

```sql
create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);
```

**RLS:** members can `SELECT` their circle. Only the creator (initial Organizer) can `INSERT`. `UPDATE` (rename, etc.) restricted to Organizer role.

```sql
alter table circles enable row level security;

create policy "select own circles"
on circles for select
using (is_circle_member(id));

create policy "organizer can update circle"
on circles for update
using (circle_role(id) = 'organizer');
```

(`INSERT` happens via an Edge Function that atomically creates the circle **and** the creator's `organizer` membership row — no direct client insert policy needed, avoiding a chicken-and-egg RLS problem where the circle doesn't exist yet for `is_circle_member` to check against.)

### `memberships`

```sql
create table memberships (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('organizer', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (circle_id, user_id)
);
```

**RLS:** members can `SELECT` the membership list of their own circle (so the app can render "who's in this circle"). Only Organizer can `INSERT`/`UPDATE`/`DELETE` (invite, change role, remove).

```sql
alter table memberships enable row level security;

create policy "select memberships in own circles"
on memberships for select
using (is_circle_member(circle_id));

create policy "organizer manages memberships"
on memberships for all
using (circle_role(circle_id) = 'organizer')
with check (circle_role(circle_id) = 'organizer');
```

### `storytellers`

```sql
create table storytellers (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid references users(id), -- nullable: optional linked account
  display_name text not null,
  created_at timestamptz not null default now()
);

create table storyteller_device_sessions (
  id uuid primary key default gen_random_uuid(),
  storyteller_id uuid not null references storytellers(id) on delete cascade,
  device_id text not null,
  created_by uuid not null references users(id), -- organizer who paired it
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz
);
```

**RLS:** circle members can `SELECT` `storytellers` rows for their circle. `storyteller_device_sessions` is Organizer-only to read/manage (pairing, revoking) — the storyteller device itself only ever touches its own row via the refresh Edge Function (service role), never directly.

```sql
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
```

### `prompt_packs` / `prompts`
Global reference content (Childhood, School Days, First Love, ... — PLAN.md §3.1), not circle-scoped. Free-tier gating (first two packs free per PLAN.md §3.1 monetization) is an app-level check on `is_free`, not an RLS concern — all authenticated users can read all packs; the paywall lives in the client/entitlement layer, not the database.

```sql
create table prompt_packs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order int not null default 0,
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

create table prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_pack_id uuid not null references prompt_packs(id) on delete cascade,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
```

**RLS:** readable by any authenticated user (or even `anon`, if you want packs visible pre-signup — decide at implementation time; default to `authenticated` for MVP). No client write path — managed by seed data / an admin tool, service role only.

```sql
alter table prompt_packs enable row level security;
alter table prompts enable row level security;

create policy "authenticated users read prompt packs"
on prompt_packs for select
using (auth.role() = 'authenticated');

create policy "authenticated users read prompts"
on prompts for select
using (auth.role() = 'authenticated');
```

### `family_questions`

```sql
create table family_questions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  submitted_by uuid not null references users(id),
  text text not null,
  status text not null default 'pending' check (status in ('pending', 'answered', 'dismissed')),
  answered_story_id uuid references stories(id),
  created_at timestamptz not null default now()
);
```

**Decision (ambiguous in PLAN.md — stated explicitly per task instructions):** Viewer-only can **read** family questions (transparency into what's been asked) but cannot submit them — PLAN.md §3.1 scopes Viewer to "read + hearts only," and submitting a question is a write action beyond that.

```sql
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
```

### `stories`

```sql
create table stories (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  storyteller_id uuid not null references storytellers(id),
  title text,
  transcript text,
  chapter text, -- free text for MVP flexibility; candidate for enum later
  audio_storage_path text,
  duration_seconds int,
  capture_mode text not null check (capture_mode in ('voice', 'interview', 'photo_voice', 'typed')),
  source_prompt_id uuid references prompts(id),
  source_question_id uuid references family_questions(id),
  status text not null default 'recording' check (status in ('recording', 'uploading', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Decision:** `INSERT` is storyteller-device-session-only for MVP. PLAN.md's remote-assist feature ("Organizer can start/configure a recording session on the elder's device remotely") configures a session that *runs on the storyteller's device* via a Realtime event — the organizer's app never inserts a `stories` row directly. If a future task wants the organizer to also be able to insert on the storyteller's behalf (e.g. transcribing a phone call), that's a deliberate policy change, not an oversight.

**Decision:** `transcript` / `title` / `chapter` are written only by the transcription pipeline Edge Function (service role) — never by client `UPDATE`, storyteller included. Members/organizers do not get an edit policy on stories in MVP (no "fix the AI's title" UI yet — defer to a later task if wanted).

**Decision:** `DELETE` is Organizer-only. Flag for follow-up: this conflicts somewhat with the Legacy Vault durability promise ("even if you cancel, the stories are safe") — v1.5 should probably convert this to a soft-delete (`deleted_at` column + policy) rather than a hard `DELETE`, so the vault guarantee is real. Not needed for MVP; noting it here so it isn't lost.

```sql
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
```

Note: the storyteller's `UPDATE` policy as written would technically let them overwrite `transcript`/`title`/`chapter` too, since Postgres RLS doesn't do column-level restriction natively. **Column-level enforcement:** either (a) use a Postgres `REVOKE`/`GRANT` column privilege split (grant `UPDATE(status)` only to the `authenticated` role for this table, separate from a broader grant used by service role), or (b) enforce it at the Edge Function / client-SDK boundary by only ever sending `{status: ...}` in the storyteller app's update call, with a trigger that raises if any of `transcript`/`title`/`chapter`/`audio_storage_path` changes on a request lacking the service-role bypass. Pick (a) — a `BEFORE UPDATE` trigger checking `current_setting('request.jwt.claims', true)` for a storyteller-session vs. service-role caller, rejecting disallowed column changes — during task 03 implementation; document the choice made there.

### `story_media`

```sql
create table story_media (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade, -- denormalized for RLS
  media_type text not null check (media_type in ('photo', 'video')),
  storage_path text not null,
  created_at timestamptz not null default now()
);
```

**RLS:** mirrors `stories` — circle-read, storyteller-session-insert (linked to their own story).

```sql
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
```

### `reactions`

```sql
create table reactions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade, -- denormalized
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);
```

**Decision:** all three roles — Organizer, Member, **and Viewer** — can react. This is explicitly the "hearts" carve-out in PLAN.md §3.1's "read + hearts only."

```sql
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
```

### `comments`

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade, -- denormalized
  user_id uuid not null references users(id),
  comment_type text not null check (comment_type in ('text', 'voice')),
  body text, -- for text comments
  audio_storage_path text, -- for voice comments
  duration_seconds int,
  created_at timestamptz not null default now(),
  check (
    (comment_type = 'text' and body is not null)
    or (comment_type = 'voice' and audio_storage_path is not null)
  )
);
```

**Decision:** Organizer and Member can comment; Viewer cannot (per the read+hearts-only scoping, same reasoning as `family_questions`). Storyteller device session does **not** get an insert policy in MVP — the storyteller replying to comments is a plausible future feature but isn't in the MVP feature list (PLAN.md §3.1), so it's left out rather than speculatively supported.

```sql
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
```

### `time_capsules` (v1.5 — table exists now per deferred-flags instruction)

```sql
create table time_capsules (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  storyteller_id uuid not null references storytellers(id),
  title text not null,
  audio_storage_path text not null,
  unlock_at timestamptz not null,
  unlock_recipient_user_id uuid references users(id), -- nullable: whole circle if unset
  created_by uuid not null references users(id),
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);
```

**RLS — designed now even though the feature ships in v1.5,** because the interesting policy (hide content until `unlock_at`) is exactly the kind of thing worth getting right before there's a UI depending on it:

```sql
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
```

### `subscriptions`

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  revenuecat_subscriber_id text not null,
  status text not null check (status in ('active', 'trialing', 'canceled', 'expired', 'gifted')),
  plan text check (plan in ('monthly', 'annual')),
  current_period_end timestamptz,
  purchasing_user_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Decision:** all circle members can `SELECT` subscription status (no payment details live here — only status/plan/period — so this isn't a sensitive-data exposure, and "any member can pay" per PLAN.md §3.1 implies members should be able to see whether the circle is currently covered). `INSERT`/`UPDATE` is service-role-only (RevenueCat webhook Edge Function) — no client write policy exists at all.

```sql
alter table subscriptions enable row level security;

create policy "circle members read subscription status"
on subscriptions for select
using (is_circle_member(circle_id));

-- No insert/update/delete policy for any client role.
-- Writes happen exclusively via the RevenueCat webhook Edge Function
-- using the service_role key, which bypasses RLS entirely.
```

### `orders` (v1.5+ — table exists now)

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  ordered_by_user_id uuid not null references users(id),
  order_type text not null check (order_type in ('book', 'qr_card', 'legacy_vault')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'failed')),
  external_order_id text, -- Lulu/Blurb/Stripe reference
  amount_cents int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Decision:** circle-visible (siblings can see what's already been ordered so they don't duplicate — accepted trade-off against gift-surprise privacy; revisit if that becomes a real complaint post-launch). `INSERT` by any member (any wallet can order, per PLAN.md §4). `UPDATE` service-role-only (print/payment webhook).

```sql
alter table orders enable row level security;

create policy "circle members read orders"
on orders for select
using (is_circle_member(circle_id));

create policy "circle members create orders"
on orders for insert
with check (is_circle_member(circle_id) and ordered_by_user_id = auth.uid());
```

---

## 6. `voice_consents` — deferred, not enforced (v3)

```sql
create table voice_consents (
  id uuid primary key default gen_random_uuid(),
  storyteller_id uuid not null references storytellers(id) on delete cascade,
  consented_by_user_id uuid not null references users(id),
  consent_recording_storage_path text not null,
  scope text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table voice_consents enable row level security;
-- Intentionally no policies defined yet. RLS enabled with zero policies
-- means the table is fully inaccessible to any client role (deny-by-default) —
-- only the service_role key can touch it, which is the correct safe state
-- until v3 defines real access rules (PLAN.md §3.4: consent recorded
-- on-device, family-only access, deletable forever).
```

This satisfies the "every table has RLS" rule without inventing policy logic for a feature that's two versions out — the table exists now so `time_capsules`/`orders`-style foreign-key churn doesn't hit voice cloning later, but nothing can read or write it via the client until v3 explicitly designs that.

---

## 7. Storage buckets

Single bucket `media`, path convention encodes `circle_id` as the first path segment so the same policy pattern used for tables applies to Storage via `storage.foldername(name)`:

| Content | Path |
|---|---|
| Story audio | `{circle_id}/stories/{story_id}/audio.m4a` |
| Story photo/video (photo+voice capture) | `{circle_id}/stories/{story_id}/media/{media_id}.{ext}` |
| Voice comments | `{circle_id}/comments/{comment_id}/audio.m4a` |
| Time capsules | `{circle_id}/time-capsules/{time_capsule_id}/audio.m4a` |
| Voice consent recordings (v3) | `{circle_id}/consents/{consent_id}/audio.m4a` |

```sql
create policy "circle members read media"
on storage.objects for select
using (
  bucket_id = 'media'
  and is_circle_member((storage.foldername(name))[1]::uuid)
);

create policy "storyteller session writes story/media audio"
on storage.objects for insert
with check (
  bucket_id = 'media'
  and is_storyteller_session((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2] in ('stories', 'time-capsules')
);

create policy "members write voice comments"
on storage.objects for insert
with check (
  bucket_id = 'media'
  and is_circle_member((storage.foldername(name))[1]::uuid)
  and circle_role((storage.foldername(name))[1]::uuid) in ('organizer', 'member')
  and (storage.foldername(name))[2] = 'comments'
);
```

`voice_consents` storage path is intentionally left with no matching policy for the same reason as §6 — deny-by-default until v3.

---

## 8. Service-role bypass points — and why RLS can't contain them

**Where service role is used:**

1. **Circle creation** (§2 `circles`) — atomically creates circle + Organizer membership.
2. **Storyteller device pairing / refresh** — mints and refreshes the scoped JWT.
3. **Transcription pipeline** — Storage upload webhook → Edge Function → Whisper → Claude (title/chapter) → writes `stories.transcript`/`.title`/`.chapter`/`.status`.
4. **RevenueCat webhook** — writes `subscriptions`.
5. **Print/order webhook** — writes `orders.status`.

**Important, stated plainly rather than glossed over:** the `service_role` key **bypasses RLS entirely** in Supabase, by design — there is no policy-level way to "scope" what a service-role-authenticated request can touch. RLS is not the containment mechanism here. The actual mitigations are operational:

- The `service_role` key is **never** shipped to any client (mobile app, web) — it exists only in Edge Function runtime environment variables.
- Each Edge Function is scoped in code to touch only the row(s) implied by its trigger. The transcription function, specifically, derives `circle_id` and `story_id` **from the Storage object path in the webhook payload it received**, not from any client-supplied parameter — so even a maliciously crafted webhook call can only affect the specific object path that triggered it, not an arbitrary row chosen by an attacker.
- Each Edge Function does the minimum write its job requires (e.g. the transcription function updates `transcript`/`title`/`chapter`/`status` — nothing else — even though the service role key technically could write anything).

If task 03 or a later audit wants stronger containment than "trust the Edge Function code," the next step is per-function scoped Postgres roles (grant only the specific columns/tables each function needs, instead of blanket service_role) — noted here as a possible v1.5+ hardening, not required for MVP launch.

---

## 9. Summary checklist against task 01 acceptance criteria

- **Cross-circle isolation:** every table's policies key off `is_circle_member(circle_id)` / `circle_role(circle_id)` / `is_storyteller_session(circle_id)`, all of which check the specific `circle_id` on the row being accessed. A member of circle A has no predicate that can evaluate true for circle B's rows.
- **Viewer-only cannot write comments, family questions; CAN react (hearts):** explicit in §"family_questions" and §"comments" policies (`circle_role(...) in ('organizer', 'member')`, excluding `'viewer'`) vs. §"reactions" (`is_circle_member`, all roles).
- **Every table has a documented RLS policy; `voice_consents` is the sole stated exception** (§6), by design, until v3.
- **Storyteller session boundary is explicit** — see the table at the top of this doc, and every policy above that references `is_storyteller_session` names exactly what it grants.
