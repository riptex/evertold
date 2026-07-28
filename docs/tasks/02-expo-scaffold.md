# Task 02 — Expo scaffold, navigation shell, design tokens

**Recommended model:** Sonnet.

**Depends on:** none (can run in parallel with task 01, but task 01's decisions don't block scaffolding).

## Context

Read `CLAUDE.md` for repo layout and conventions before starting.

## Deliverable

- Expo (TypeScript template) project initialized at repo root, using Expo Router.
- Three root navigators per `CLAUDE.md`'s layout: `(organizer)`, `(storyteller)`, `(auth)` — stub screens only, no real logic yet.
- Design tokens: color palette, spacing scale, and **two type scales** — a standard scale and an "extra-large" scale meeting WCAG AAA contrast, used by the Storyteller navigator. Tokens should be a single source of truth (e.g. `lib/theme.ts`) that both navigators consume.
- `npx expo start` runs clean on iOS simulator / Android emulator / Expo Go.
- `npx tsc --noEmit` passes.
- Basic ESLint + Prettier config matching Expo defaults.
- Update the "Commands" section in `CLAUDE.md` with the real, working commands once they exist (replace the placeholder block).

## Acceptance criteria

- Fresh clone → `npm install` → `npx expo start` works with no manual steps.
- Storyteller navigator stub renders with the extra-large type scale and has **no** tab bar, no settings entry point, no navigation chrome — confirms the "separate root navigator" rule in `CLAUDE.md` from the very first commit.
- `npx tsc --noEmit` and lint both pass in CI (or document why CI isn't wired yet if task 04 hasn't landed).
