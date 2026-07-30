# Kindred Voices

Voice-first story capture app for elderly loved ones. Full product context: `PLAN.md`. Sprint task specs: `docs/tasks/`. Formerly "Evertold" — renamed after domain research; see `docs/decisions/naming.md`.

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
  dev/                    # Dev-only routes (e.g. component preview) — real routes,
                           #   not `_`-prefixed (that's excluded from routing entirely,
                           #   not just production). Guard content with `if (!__DEV__) return null`.
components/
  ui/                    # Design system primitives — Button/Card/Text/TouchTarget,
                           #   scale-aware via ScaleContext (see components/ui/index.ts)
lib/
  supabase/               # Client init, generated types
  offline-queue/           # Local recording queue + background upload/retry
hooks/
supabase/
  migrations/             # SQL migrations (schema + RLS)
  seed.sql                 # Local dev / test fixture data
  tests/                    # RLS verification suite (see supabase/tests/README.md)
  functions/               # Edge Functions (transcription pipeline, etc.)
docs/
  tasks/                  # Per-task specs; a session's prompt is "implement docs/tasks/NN-*.md"
```

## Conventions

- **Every table is `circle_id`-scoped.** No table holding user data should lack an RLS policy keyed to circle membership. See `docs/tasks/01-data-model-rls.md` for the schema + policy spec.
- **Storyteller mode is a separate root navigator** — giant record button, prompt card, playback. No tabs, no settings, no navigation chrome. Never share screens between Storyteller mode and Organizer/Member mode.
- **Offline-first for recording, always.** Record to local file first; never block the record button on network state. Upload is a background concern — see `docs/tasks/10-offline-queue-design.md`.
- **Accessibility is default-on for Storyteller role**, not a toggle: extra-large type, WCAG AAA contrast, 60pt+ touch targets, full VoiceOver/TalkBack. Contrast is verified for real in `lib/contrast.test.ts` (actual WCAG luminance math against the theme tokens) — don't eyeball a new color, add a case there.
- **Audio format:** AAC 64kbps mono for voice recordings. Keep the raw local file until upload is confirmed server-side.
- Prefer editing existing files; don't introduce new abstractions beyond what the current task needs (see repo-wide engineering norms in the system prompt — minimal footprint, no speculative generality).

## Commands

```bash
npm install
npx expo start             # dev server (press i/a/w for simulator/emulator/web)
npx expo export --platform web  # bundler smoke test without a simulator
npm run typecheck          # tsc --noEmit
npm run lint                # eslint .
npm run format               # prettier --write .
npm run format:check         # prettier --check .
npm test                    # jest (jest-expo preset)
supabase start              # local Supabase stack (needs Docker)
supabase db reset            # apply supabase/migrations/ + supabase/seed.sql locally
supabase db push             # apply migrations to a linked project
supabase gen types typescript --local > lib/supabase/types.ts  # regenerate types (needs Docker — see note below)
supabase functions deploy   # deploy Edge Functions (task 06+)
```

**Supabase local dev needs Docker.** If Docker isn't available, `supabase/tests/local_dev_auth_shim.sql` lets you apply the migrations and run `supabase/tests/rls_verification.sql` against plain local Postgres instead — see `supabase/tests/README.md`. `lib/supabase/types.ts` was hand-authored against a Docker-less environment for the same reason (`supabase gen types` shells out to a container for introspection even with `--db-url`, confirmed across two CLI versions) — regenerate it for real the first time this repo is touched somewhere with Docker.

**Note on `eslint-config-expo@57.0.0`:** its nested `eslint-import-resolver-typescript` dependency resolves to a version incompatible with its own `eslint-plugin-import` flat-config preset (upstream ecosystem lag right after the SDK 57 release, not a project-specific issue). `package.json` pins it back with `overrides` — if `npm run lint` starts throwing `"invalid interface loaded as resolver"` again after a dependency bump, check whether that override is still needed before troubleshooting further.

### EAS builds & OTA updates

`eas.json` defines three profiles: `development` (dev client, internal distribution, iOS simulator build), `preview` (internal distribution, `preview` update channel), `production` (auto-incrementing build number, `production` update channel).

```bash
eas login                                          # one-time, needs an Expo account
eas build --profile development --platform ios     # or --platform android, or omit for both
eas build --profile preview --platform all
eas build --profile production --platform all
eas update --branch production --message "..."     # OTA update, no new binary needed
```

**Blocked on external setup — do this yourself, Claude Code can't create accounts:** an Expo account (`eas login` or `EXPO_TOKEN` env var for CI) and, for real device builds rather than simulator-only, Apple/Google developer accounts. Confirmed exact blocker as of this task: `npx eas-cli build --profile development --platform ios --local --non-interactive` fails with *"An Expo user account is required to proceed. Either log in with eas login or set the EXPO_TOKEN environment variable."* `app.json` also needs an `expo.extra.eas.projectId`, which `eas init` sets — also needs login. Once logged in: `eas init`, then the build commands above will work.

### CI

`.github/workflows/ci.yml` runs on every PR and on push to `main`: `typecheck`, `lint`, `format:check`, `test`. It does not run EAS builds — that needs the Expo account above, plus `EXPO_TOKEN` as a GitHub Actions secret. Add an EAS-build CI job only once that account exists.

## Working with tasks

Each file in `docs/tasks/` is a self-contained spec: context, acceptance criteria, and pointers to the relevant `PLAN.md` section. Start a session with a prompt like:

> Implement docs/tasks/03-supabase-migrations.md

Don't carry one session across multiple unrelated tasks — start fresh per task to keep context (and cost) small. Commit at the end of each task.
