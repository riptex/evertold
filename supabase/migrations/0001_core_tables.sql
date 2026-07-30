-- Core schema for Kindred Voices MVP.
-- Implements docs/architecture/data-model.md §2. If you find yourself
-- changing table shape here without updating that doc first, stop —
-- the doc is the source of truth.

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('organizer', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

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

create table family_questions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references circles(id) on delete cascade,
  submitted_by uuid not null references users(id),
  text text not null,
  status text not null default 'pending' check (status in ('pending', 'answered', 'dismissed')),
  -- answered_story_id references stories, created below; added via
  -- alter table after stories exists to avoid a forward reference.
  created_at timestamptz not null default now()
);

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

alter table family_questions
  add column answered_story_id uuid references stories(id);

create table story_media (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade, -- denormalized for RLS
  media_type text not null check (media_type in ('photo', 'video')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table reactions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  circle_id uuid not null references circles(id) on delete cascade, -- denormalized
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);

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

-- v1.5 — table exists now so later foreign keys don't force a migration.
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

-- v1.5+ — table exists now so later foreign keys don't force a migration.
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

-- v3 — deferred. Table exists for FK stability; RLS is enabled with zero
-- policies in 0003_rls_policies.sql (deny-by-default until v3 designs
-- real access rules). See data-model.md §6.
create table voice_consents (
  id uuid primary key default gen_random_uuid(),
  storyteller_id uuid not null references storytellers(id) on delete cascade,
  consented_by_user_id uuid not null references users(id),
  consent_recording_storage_path text not null,
  scope text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Helpful indexes on the FK columns every RLS policy filters by.
create index on memberships (circle_id);
create index on memberships (user_id);
create index on storytellers (circle_id);
create index on storyteller_device_sessions (storyteller_id);
create index on family_questions (circle_id);
create index on stories (circle_id);
create index on stories (storyteller_id);
create index on story_media (circle_id);
create index on story_media (story_id);
create index on reactions (circle_id);
create index on reactions (story_id);
create index on comments (circle_id);
create index on comments (story_id);
create index on time_capsules (circle_id);
create index on subscriptions (circle_id);
create index on orders (circle_id);
create index on voice_consents (storyteller_id);
