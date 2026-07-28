# Task 05 — Design system components

**Recommended model:** Sonnet.

**Depends on:** task 02 (theme tokens must exist).

## Context

Every component must work correctly in **both** the standard type scale (Organizer/Member navigators) and the extra-large scale (Storyteller navigator) — see `CLAUDE.md` conventions and PLAN.md §3.1 "Access & accessibility."

## Deliverable

Build the core primitives in `components/ui/`, each accepting a `scale` prop (or reading from navigator context) that switches between standard and extra-large presentation:

- `Button` — standard and a "giant" variant (this becomes the record button in task 11; build it generic here).
- `Card` — used for story feed items and prompt cards.
- `Text` (or a small set: `Heading`, `Body`, `Caption`) wrapping the type scale from task 02 so no screen ever hardcodes a font size.
- `TouchTarget` wrapper or convention ensuring every interactive element meets the 60pt+ touch target requirement in extra-large mode, and standard platform minimums otherwise.
- A component-preview screen (e.g. `app/_dev/components.tsx`, dev-only) rendering every component in both scales side by side — this is your fastest way to catch accessibility regressions later without a real accessibility audit each time.

## Acceptance criteria

- Every component passes WCAG AAA contrast in extra-large mode (verify with an actual contrast-checker calculation on the token colors, not eyeballing).
- No component hardcodes a pixel font size or color outside the theme tokens.
- VoiceOver/TalkBack labels are present on every interactive primitive from the start — don't defer this to the Sprint 5 accessibility audit; that audit should find nothing new at the primitive level.
- The dev preview screen renders without crashing and is excluded from production builds.
