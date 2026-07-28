# Task 01 — Data model + RLS policy spec

**Type:** Design doc only. No app code, no migrations yet — this is the spec that task 03 implements.

**Recommended model:** Opus, plan mode. This is the highest-stakes design decision in the MVP — a wrong RLS policy is a privacy breach in a product whose entire brand is "private by default, nothing public, ever" (PLAN.md §7). Get it right once here; task 03 then becomes mechanical.

## Context

Read `PLAN.md` §5 (Technical Architecture) and §7 (Trust, Privacy & Ethics) first.

Core tables (from the plan): `users`, `circles`, `memberships (user, circle, role)`, `storytellers`, `prompt_packs`, `prompts`, `family_questions`, `stories (audio_url, transcript, title, chapter, duration, status)`, `story_media`, `reactions`, `comments`, `time_capsules`, `subscriptions`, `orders`, `voice_consents`.

Roles per §2: **Organizer** (full control), **Member** (record voice comments, submit questions, react), **Viewer-only** (extended family/friends — read + hearts only, no comments/questions).

## Deliverable

Write `docs/architecture/data-model.md` containing:

1. **Full schema** — every table, column, type, foreign keys. Every user-data table must carry `circle_id` (directly or via a join path) so RLS can scope on it.
2. **RLS policy for every table** — expressed as the actual Postgres policy logic (not just prose), covering:
   - Circle membership check (a user can only see rows for circles they belong to)
   - Role gating (Viewer-only cannot insert comments/questions; only Organizer can manage memberships/subscriptions)
   - Storyteller device sessions — per PLAN.md §5, "storyteller devices get a long-lived scoped session." Decide and document exactly what that session can and cannot read/write (should almost certainly be limited to their own circle, insert-only on `stories`, no access to `subscriptions`/`orders`/other circles).
   - Service-role bypass points (Edge Functions doing transcription need to write `stories.transcript`/`title`/`chapter` on behalf of the pipeline — document how that's scoped so a compromised Edge Function can't write cross-circle).
3. **Storage bucket policy** — audio/photo/video objects must be similarly circle-scoped; document the path convention (e.g. `stories/{circle_id}/{story_id}/audio.m4a`) and the matching Storage RLS.
4. **Deferred flags** — mark anything intentionally deferred past MVP (e.g. `voice_consents` enforcement is v3, but the table should exist now so `time_capsules`/`orders` foreign keys don't need later migration).

## Acceptance criteria

- A member of circle A cannot read/write any row scoped to circle B, under any role.
- A Viewer-only member cannot write `comments`, `reactions` (voice), or `family_questions` if the plan intends Viewer-only as read+hearts-only — confirm this against PLAN.md §2 and state the decision explicitly if it's ambiguous there.
- No table lacks a documented RLS policy — “not yet enforced” is acceptable only for `voice_consents` (v3), stated explicitly.
- The storyteller long-lived session's exact permission boundary is spelled out, not left implicit.
