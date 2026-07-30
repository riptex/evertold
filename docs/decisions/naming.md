# Product naming — research record

`evertold.com` is registered (confirmed live via RDAP — status `active`,
registrar Tucows/eNom), so "Evertold" needs replacing before it's used
anywhere user-facing. This records the actual research done, not just
the requirement to do it, so it doesn't get re-derived later.

**Decision: "Kindred Voices"** — applied throughout the codebase
(`package.json`, `app.json`, `PLAN.md`, `CLAUDE.md`, the auth screen).
Still provisional — real trademark clearance (see "Still needed" below)
hasn't happened yet, and it's cheap to revisit before anything ships.

## Method

Domain availability checked via RDAP (`https://rdap.org/domain/<name>`
— the modern HTTPS-based WHOIS replacement; raw WHOIS on port 43 is
blocked in the sandbox this was run from). HTTP 200 + a domain object =
registered. HTTP 404 = not registered = available. Trademark/product-
collision spot-checked via web search on the strongest candidates only,
not exhaustively — real clearance (USPTO search, app-store name
collision check) still needs doing before final commitment.

## Round 1 — PLAN.md's existing alternates, `.com`

| Name | `.com` |
|---|---|
| Kindred Voices | taken |
| Hearthlight | taken |
| Told | taken |

All three already-brainstormed alternates are gone. (`told.com` — no
surprise, it's a dictionary word.)

## Round 2 — new coinages, `.com`

| Name | `.com` |
|---|---|
| Storyloom | taken |
| Heirloom Voices | taken |
| Fondly | taken |
| Tellkin | taken |
| Storyhearth | taken |
| Vocalegacy | taken |
| Kinlore | taken |
| Elderlore | taken |
| Wovenvoice | taken |
| Legacyloom | taken |
| Tellwise | taken |
| Storyvine | taken |

**15 of 15 `.com` candidates checked across both rounds are registered.**
This isn't a sign the names are bad — short, pronounceable,
brand-plausible `.com` domains are almost universally squatted/parked
regardless of how obscure the compound is. `.com`-first naming for a new
consumer app in 2026 without a five-figure domain-acquisition budget is
not realistic; `.app` is the more honest primary target.

## Round 3 — `.app` for the five strongest concepts

| Name | `.app` | Trademark/collision spot-check |
|---|---|---|
| **Kindred Voices** | **available** | No direct product/app match. "Kindred" alone is heavily used across unrelated companies (an AI-companion app, a VC firm, a property-management SaaS, a Passion Pit album) — the word itself is crowded, but "Kindred Voices" as a phrase isn't a live product. |
| Hearthlight | taken | — |
| **Storyhearth** | **available** | ⚠️ **Real collision** — "The Story Hearth" is an existing, active writing community (`storyhearth.net`, a Circle.so community run by author Nicholas Kotar). Same name, adjacent space (storytelling/writing). Would not recommend despite the open `.app`. |
| **Vocalegacy** | **available** | No collision found. Coined word — less immediately warm/intuitive than the others, and "vocal" + "legacy" runs together in a way that may need a spelled-out pronunciation guide in early marketing. |
| Kinlore | taken | — |

## Recommendation

**Kindred Voices** is the strongest option: available `.app`, no direct
product collision, already vetted once by whoever wrote PLAN.md's
alternates list, and it reads warmly without needing an invented-word
pronunciation explainer. `.com` is gone, so the domain strategy would be
`kindredvoices.app` as primary (matches "app-first product" positioning
honestly) with a redirect/landing-page `.com` acquired later if wanted
(via a broker, or just accept it as a lost cause and lean on `.app` +
app-store presence).

**Vocalegacy** is the fallback if "Kindred" is ruled out on trademark
grounds after real clearance (it's a crowded word) — fully clean
domain-wise, just needs the name itself to earn its pronunciation.

**Storyhearth is not recommended** despite the open `.app` — real,
same-space naming collision.

## Still needed before finalizing

- Real trademark clearance (USPTO TESS search at minimum) on whatever's
  chosen — the spot-check above is a sanity check, not clearance.
- App Store / Play Store name-availability check (separate from
  trademark — a name can be legally clear and still be taken as a store
  listing name).
- Once decided: rename cascade — `package.json` `name`, `app.json`
  `name`/`slug`/`scheme`, `PLAN.md` and `CLAUDE.md`'s title, this repo's
  own name (can't be changed by Claude Code — needs a GitHub UI rename
  or `gh repo rename`), EAS project (created fresh under the new name,
  since no EAS project exists yet anyway per `docs/PROGRESS.md`).
