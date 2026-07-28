# Task 03 — Supabase migrations implementing the schema + RLS spec

**Recommended model:** Sonnet — this is mechanical translation of task 01's design doc into SQL, not new design work. Escalate to Opus only if a policy interaction turns out to be genuinely ambiguous once written as real SQL.

**Depends on:** task 01 (`docs/architecture/data-model.md` must exist and be reviewed/approved first).

## Deliverable

- `supabase/migrations/` — one migration per logical unit (e.g. `0001_core_tables.sql`, `0002_rls_policies.sql`, `0003_storage_buckets.sql`), implementing `docs/architecture/data-model.md` exactly. If implementing it surfaces a gap or contradiction in the design doc, stop and flag it rather than silently resolving it — the design doc is the source of truth and should be corrected first.
- `lib/supabase/types.ts` — generated TypeScript types from the schema (via `supabase gen types typescript`), plus a thin typed client wrapper in `lib/supabase/client.ts`.
- A seed script (`supabase/seed.sql` or equivalent) with enough fake data (2–3 circles, a few memberships across roles, a couple of stories) to manually verify RLS boundaries locally.

## Acceptance criteria

- `supabase db push` (or local `supabase start` + migrate) applies cleanly from empty.
- Manual verification (document how, e.g. a short script or SQL snippet under `supabase/tests/`) that a user in circle A genuinely cannot read circle B's rows via the anon/authenticated client — not just "the policy looks right," but an actual failed query against seeded data.
- Storage bucket policies match the path convention and RLS documented in task 01.
- Generated types compile and are imported by at least a placeholder call site so a future task doesn't have to wire that up separately.
