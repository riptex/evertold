# Progress — handoff note

Written to bridge a context compression/reset. If you're a fresh session
reading this: read `CLAUDE.md` and `PLAN.md` first, then this file for
where things actually stand and what to watch out for.

## State as of 2026-07-28

**Phase A (Sprint 0) is done and merged to `main`.** Five PRs, squash-merged
in order: #1 (plan/CLAUDE.md/task specs), #2 (task 01, data model + RLS
spec), #3 (task 02, Expo scaffold), #4 (task 03, Supabase migrations),
#5 (task 04, CI + EAS), #6 (task 05, design system). `main` is a working
vertical slice: auth stub, both role navigators, Supabase schema with
verified RLS, a real component library, CI green.

`docs/tasks/01-05` are consumed. **`docs/tasks/06+` don't exist yet** —
Phase B (Sprint 1: auth, circle creation, invites, roles, storyteller
onboarding) needs task specs written before implementation starts, same
as Phase A did in the session that produced PR #1.

## Workflow established this session (keep using it)

- One task = one branch = one PR = one squash-merge, in task-number order.
- Branch each task off the **latest merged `main`**, not off another
  unmerged task branch — keeps PRs independent and mergeable in any order
  that respects the real dependency graph (checked in
  `docs/tasks/NN-*.md`'s "Depends on" line).
- Before merging, actually check CI (`get_check_runs` on the PR), don't
  assume it'll pass — it caught nothing so far, but that's the point of
  checking.
- Verify claims for real, not by review: run the migration against a
  real database, run the actual command, diff the actual build output.
  This caught two genuine bugs (see below) that would have shipped on
  "looks right" review alone.

## Two real bugs found (not hypothetical — worth knowing about)

1. **RLS gap (task 03).** The storyteller device session had `UPDATE`
   policies on `stories`/`family_questions` with no matching `SELECT`
   policy. Postgres RLS `UPDATE` needs the row visible under *some*
   `SELECT`-type policy to be a candidate at all — the `UPDATE` policy's
   own `USING` clause isn't sufficient alone. Silently matched zero rows,
   no error. Caught by a verification suite that checks affected row
   counts, not just exception presence. Fixed in
   `docs/architecture/data-model.md` first (correction note at the top),
   then in `supabase/migrations/0003_rls_policies.sql`.
2. **Contrast drift (task 05).** `lib/theme.ts`'s comments had hand-
   estimated WCAG ratios from task 02 that were off by a few tenths
   (still safe, but not verified). `lib/contrast.ts` +
   `lib/contrast.test.ts` now compute real WCAG 2.1 luminance math — that
   test is the source of truth for contrast, not comments. Add a case
   there before trusting any new color.

## Known environment limitations (not bugs — external blockers)

- **No Docker in this sandbox.** `supabase start` / `supabase gen types`
  / local Supabase stack all need it. Migrations were verified against
  plain local Postgres instead, via a documented shim
  (`supabase/tests/local_dev_auth_shim.sql`, never for real Supabase use)
  — see `supabase/tests/README.md`. `lib/supabase/types.ts` is hand-
  authored against the verified schema; regenerate for real
  (`supabase gen types typescript --local > lib/supabase/types.ts`) the
  first time this repo is touched somewhere with Docker.
- **No Expo/EAS account.** Confirmed via an actual `eas build --local`
  attempt: *"An Expo user account is required to proceed."* `eas.json`
  and CI are ready; someone needs to `eas login` (or set `EXPO_TOKEN`)
  and run `eas init` (sets `app.json`'s `expo.extra.eas.projectId`)
  before any real build/OTA-update command in `CLAUDE.md` will work.
- **No Apple/Google developer accounts** — needed only for real-device
  builds, not simulator/EAS-dev-client builds.

## Next up

Write `docs/tasks/06+` for Sprint 1 (PLAN.md §6: auth, circle creation,
invites, roles, storyteller onboarding), then implement in the same
branch-per-task pattern. Nothing is blocking this — it just hasn't been
started.
