# Task 04 — CI + EAS build config

**Recommended model:** Sonnet.

**Depends on:** task 02 (needs a working Expo project to build/lint/typecheck).

**Blocked on external setup (do this yourself before or during this task):** an Expo/EAS account and project, plus Apple/Google developer accounts if you want real device builds rather than simulator-only. Claude Code can write all the config; it can't create the accounts.

## Deliverable

- GitHub Actions (or equivalent) workflow: on PR, run `npx tsc --noEmit`, lint, and `npm test` (once tests exist — a passing empty test suite is fine for now).
- `eas.json` with `development`, `preview`, and `production` build profiles.
- Document in `CLAUDE.md`'s Commands section how to trigger an EAS build (`eas build --profile preview --platform ios`, etc.) and how OTA updates are published.
- `.env.example` listing every environment variable the app expects (Supabase URL/anon key, RevenueCat keys, etc.) — actual secrets never committed, referenced via EAS secrets / GitHub Actions secrets instead.

## Acceptance criteria

- A PR against this branch triggers the CI workflow and it passes on a clean scaffold.
- `eas build --profile development --platform ios --local` (or the cloud equivalent) succeeds, or the task notes exactly what external credential is missing to complete it.
- No secret values appear anywhere in the committed diff — grep the diff for anything that looks like a key before finishing.
