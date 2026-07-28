# Evertold

Voice-first story capture app for elderly loved ones. Full product context: `PLAN.md`. Sprint task specs: `docs/tasks/`.

## Stack

- **App:** React Native + Expo (EAS builds, OTA updates). TypeScript throughout.
- **Backend:** Supabase — Postgres, Auth, Storage, Realtime, Edge Functions.
- **AI:** Whisper API (transcription), Claude API (titling/chapters/memoir), ElevenLabs (v3 voice cloning — not in MVP).
- **Payments:** RevenueCat (subscriptions + gifting), Stripe (web gifting/book orders — v1.5+).
- **Analytics/crash:** PostHog + Sentry.

## Repo layout (target — create as needed per task)

```
app/                    # Expo Router screens
  (organizer)/           # Organizer-role navigator: circles, invites, settings
  (storyteller)/          # Storyteller-role navigator: giant record button, no tabs/settings
  (auth)/
components/
  ui/                    # Design system primitives (large-type mode, AAA contrast)
lib/
  supabase/               # Client init, generated types
  offline-queue/           # Local recording queue + background upload/retry
hooks/
supabase/
  migrations/             # SQL migrations (schema + RLS)
  functions/               # Edge Functions (transcription pipeline, etc.)
docs/
  tasks/                  # Per-task specs; a session's prompt is "implement docs/tasks/NN-*.md"
```

## Conventions

- **Every table is `circle_id`-scoped.** No table holding user data should lack an RLS policy keyed to circle membership. See `docs/tasks/01-data-model-rls.md` for the schema + policy spec.
- **Storyteller mode is a separate root navigator** — giant record button, prompt card, playback. No tabs, no settings, no navigation chrome. Never share screens between Storyteller mode and Organizer/Member mode.
- **Offline-first for recording, always.** Record to local file first; never block the record button on network state. Upload is a background concern — see `docs/tasks/10-offline-queue-design.md`.
- **Accessibility is default-on for Storyteller role**, not a toggle: extra-large type, WCAG AAA contrast, 60pt+ touch targets, full VoiceOver/TalkBack.
- **Audio format:** AAC 64kbps mono for voice recordings. Keep the raw local file until upload is confirmed server-side.
- Prefer editing existing files; don't introduce new abstractions beyond what the current task needs (see repo-wide engineering norms in the system prompt — minimal footprint, no speculative generality).

## Commands

Fill in once the Expo scaffold exists (task 02):

```bash
npm install
npx expo start
npm test
npx tsc --noEmit
supabase db push          # apply migrations to local/linked project
supabase functions deploy # deploy Edge Functions
```

## Working with tasks

Each file in `docs/tasks/` is a self-contained spec: context, acceptance criteria, and pointers to the relevant `PLAN.md` section. Start a session with a prompt like:

> Implement docs/tasks/03-supabase-migrations.md

Don't carry one session across multiple unrelated tasks — start fresh per task to keep context (and cost) small. Commit at the end of each task.
