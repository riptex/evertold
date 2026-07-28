# Evertold — Product & Build Plan
*Working title. Alternates: Kindred Voices, Hearthlight, Told.*
A mobile app for capturing the voices, stories, and memories of elderly loved ones — built to be handed to Claude Code for implementation.

---

## 1. Vision & Positioning

**One-liner:** Evertold helps families capture the voice and life stories of aging loved ones before it's too late — and keeps those stories alive for generations.

**Emotional core:** urgency without morbidity. Marketing speaks of "while the stories are still being told," never of dying. The product must feel like a warm family ritual, not end-of-life paperwork.

**Positioning:** the family-first alternative to StoryWorth (text/email-centric) and Remento — differentiated by *voice-first capture*, elder-grade accessibility, and a living family feed rather than a one-shot book.

---

## 2. Users

| Persona | Role in app | Key needs |
|---|---|---|
| **Storyteller** (75–95) | Records stories | One-tap recording, huge type, zero navigation, forgiving UX |
| **Family Organizer** (40–65, usually a daughter) | Buys, sets up, invites | Easy setup, remote assist, visible progress, gifting |
| **Circle Members** (grandkids, siblings, extended) | Listen, react, ask questions | Feed, notifications, submitting questions |
| **Caregiver / hospice staff** (B2B) | Facilitates sessions | Multi-resident management, session mode, privacy compliance |

**Family Circle** is the core object: one storyteller (or a couple), unlimited members, role-based permissions (Organizer, Member, Viewer-only for extended friends/family).

---

## 3. Feature Set

### 3.1 MVP (v1)

**Capture**
- One-tap voice recording: app opens directly to a giant record button (Storyteller mode). No login friction after first setup — biometric/PIN optional, session stays alive.
- Interview mode: a family member holds the phone, taps a prompt, hands it over. Prompt shown in huge type + read aloud (TTS).
- Photo + voice caption: snap or import an old photo, record the story behind it.
- Typed stories as fallback (some elders prefer writing).
- Offline-first: recordings queue locally, sync when online (rural users).

**Prompting**
- Guided question packs: *Childhood, School Days, First Love, Work Life, War & Hard Times, Raising a Family, Recipes & Traditions, Faith & Beliefs, Advice for the Grandkids.* ~15 questions each.
- Family question box: any circle member submits questions remotely; they appear in the storyteller's queue.
- Free-form recording always available.

**Family experience**
- Private circle feed: chronological stories with photo, duration, transcript preview.
- Push notification when a new story lands ("Grandma June recorded a new story: *The winter the pond froze over*").
- Hearts + comments (comments can be voice replies — grandkids talk back).
- Weekly digest email for low-engagement members.

**AI (MVP-level)**
- Auto-transcription (Whisper) of every recording; searchable.
- Auto-title + chapter suggestion (Claude): each story gets a title and is filed into a life chapter (Childhood, Family, Career...).

**Access & accessibility**
- Extra-large type mode (default for Storyteller role), WCAG AAA contrast, 60pt+ touch targets.
- Caregiver remote-assist: Organizer can start/configure a recording session on the elder's device remotely.
- Full VoiceOver/TalkBack support.

**Monetization (MVP)**
- Freemium: free = 10 stories, 1 circle, streaming only. Paid = unlimited stories, downloads/export, transcripts, question packs beyond the first two.
- Family Plan subscription: **$9.99/mo or $79/yr** (one sub covers the whole circle; any member can pay — gifting flow built in).
- Gift subscriptions (holiday revenue spike is the biggest seasonal driver in this category).

### 3.2 v1.5 — Keepsakes (first revenue expansion)

- **Legacy Vault** — one-time **$199**: permanent storage guarantee, full raw-audio export, "your stories outlive the subscription" promise. Strong conversion at end-of-life moments; also de-risks churn objections.
- **Printed keepsake book** — **$59–$149** by size: transcribed stories + photos, auto-laid-out, human-editable before order. Print-on-demand partner (Lulu/Blurb API). Highest-margin emotional purchase; ordered by multiple family members (siblings each buy one).
- **QR keepsake cards**: printed card or plaque with QR linking to a chosen story ("scan to hear Grandpa tell it himself"). Works for memorial services.
- **Time capsules**: record a message that unlocks on a future date — a grandchild's 18th birthday, a wedding day. Extremely high perceived value, near-zero build cost, powerful marketing story.

### 3.3 v2 — AI Biographer & Video

- **AI interviewer**: after a story, Claude asks one warm follow-up question aloud ("You mentioned your brother Salvatore — what was he like?"). Opt-in, gentle, never robotic-pushy.
- **AI-written memoir**: Claude assembles transcripts into a flowing first-person memoir organized by life chapters; family edits; feeds the printed book pipeline. Premium add-on **$49** or included in an annual "Biography" tier ($149/yr).
- **Video recording** with the same one-tap UX; auto-generated highlight clips (30–60s, captioned) shareable outside the app — this is the growth loop (every shared clip is an ad).
- **Duet stories**: two voices on one recording (couples, siblings).
- **Recipe cards**: structured capture for family recipes with voice instructions.

### 3.4 v3 — Voice Legacy & B2B

- **Voice preservation** (premium, **$99** one-time): with explicit recorded consent, clone the storyteller's voice so future generations can hear them read new text — bedtime stories for great-grandchildren, the memoir read in their own voice. Strict ethics: consent recorded on-device, family-only access, audible disclosure watermark, deletable forever.
- **Memorial mode**: after passing, the circle converts — softened palette, "In memory of," story resurfacing on birthdays/anniversaries ("One year ago, June told this story"), condolence-safe onboarding for new members.
- **B2B portal** for hospices, senior living, funeral homes: multi-resident dashboard, staff session mode, family handoff, white-label option. Pricing **$3–6/resident/mo** or per-facility license. Funeral homes as *distribution* partners (they gift Legacy Vaults as part of pre-need packages).
- Legacy contact / digital-inheritance flow (who controls the account after death).

---

## 4. Sellability & Growth Angles

1. **Gifting is the wedge.** Mother's Day, Father's Day, Christmas, Grandparents Day. The buyer is the adult child; the product is a gift SKU. Build the gift flow beautifully.
2. **Physical goods anchor the price.** Books and QR keepsakes make the subscription feel cheap and produce 50%+ margin line items.
3. **Multiple family members pay.** Siblings independently buy books, vaults, and prints from the same story pool — one storyteller, many wallets.
4. **Shared clips are the ad.** Captioned 45-second story clips shared to family group chats drive organic acquisition.
5. **Urgency converts, handled gently.** Hospice/funeral-home channel reaches families at maximum motivation; tone must be impeccable.
6. **The vault kills churn objections.** "Even if you cancel, the stories are safe" — trust is the whole brand.
7. **Anniversary resurfacing retains.** Stories resurface on meaningful dates for years — the app stays installed across generations.

---

## 5. Technical Architecture

**Stack (recommended):**
- **App:** React Native + **Expo** (EAS builds, OTA updates, expo-av for recording, expo-notifications). One codebase, iOS + Android.
- **Backend:** **Supabase** — Postgres, Auth (email/phone/Apple/Google), Storage (audio/photo/video), Row-Level Security for circle privacy, Realtime for feed updates, Edge Functions for AI pipelines.
- **AI:** OpenAI Whisper API (transcription, ~$0.006/min); Anthropic Claude API (titling, chapters, follow-ups, memoir). v3 voice cloning: ElevenLabs API.
- **Payments:** RevenueCat (App Store + Play subscriptions + gifting), Stripe for web gifting/book orders.
- **Print:** Lulu or Blurb print API.
- **Analytics/crash:** PostHog + Sentry.

**Key implementation notes for Claude Code:**
- Offline-first recording: record to local file, background upload queue with retry (expo-task-manager); never lose a recording.
- Audio: AAC 64kbps mono is plenty for voice; keep raw file until upload confirmed.
- RLS policies: every table keyed to `circle_id`; storyteller devices get a long-lived scoped session.
- Storyteller mode = separate root navigator: giant record button, prompt card, playback. No tabs, no settings.
- Remote assist via Supabase Realtime channel (organizer pushes a "start session with prompt X" event to the elder's device).
- Transcription pipeline: Storage upload → Edge Function → Whisper → Claude (title/chapter) → row update → push notification.

**Data model (core tables):**
`users`, `circles`, `memberships (user, circle, role)`, `storytellers`, `prompt_packs`, `prompts`, `family_questions`, `stories (audio_url, transcript, title, chapter, duration, status)`, `story_media`, `reactions`, `comments`, `time_capsules`, `subscriptions`, `orders`, `voice_consents`.

---

## 6. Roadmap, Sprints & Cost Projection

Assumes 1 senior full-stack dev working with Claude Code (2-week sprints), + part-time designer in Sprints 0–2, + PM/founder time. Rates: freelance blended $85–110/hr.

### MVP — 12 weeks (Sprints 0–5)

| Sprint | Scope |
|---|---|
| 0 (1 wk) | Expo + Supabase setup, CI/EAS, design system, data model, RLS |
| 1 | Auth, circle creation, invites, roles, storyteller onboarding |
| 2 | One-tap recording, offline queue, upload, playback |
| 3 | Prompt packs, family question box, interview mode, photo+voice |
| 4 | Feed, notifications, comments/hearts, transcription pipeline |
| 5 | Paywall (RevenueCat), gifting, export, accessibility audit, beta |

**MVP cost:**
- DIY founder + Claude Code: **$3–6k** hard costs (services, devices, design assets, app store fees)
- Freelance dev + Claude Code: **$45–70k**
- Small agency: **$100–160k**

### Follow-up sprints

| Phase | Duration | Freelance cost |
|---|---|---|
| v1.5 Keepsakes (vault, books, QR, time capsules) | 6 wks | $22–35k |
| v2 AI Biographer + video + clips | 10 wks | $38–60k |
| v3 Voice legacy + memorial + B2B portal | 12 wks | $45–75k |

### Running costs (at ~1,000 active families)
- Supabase Pro + storage/egress: $100–300/mo
- Whisper + Claude: $150–400/mo
- Expo EAS $99/mo, RevenueCat free tier, Sentry/PostHog ~$50/mo
- Apple $99/yr, Google Play $25 once
- **Total ≈ $400–850/mo**, scaling roughly linearly with audio hours.

### Unit economics sketch
- Family Plan $79/yr; storage+AI cost per family ≈ $6–12/yr → ~85% gross margin
- Book $89 avg, COGS ~$25–35 → ~60% margin
- Legacy Vault $199, marginal cost <$10 lifetime (audio is small)

---

## 7. Trust, Privacy & Ethics (non-negotiable brand pillars)

- Private by default; nothing public, ever. Circle-scoped RLS.
- Explicit recorded consent for voice cloning; audible disclosure on synthetic audio; permanent deletion honored.
- Data inheritance: designated legacy contact; clear post-death account policy.
- No ads, no data resale — say so loudly; it's a selling point.
- Grief-safe design: memorial mode reviewed with hospice advisors.

---

## 8. What to Build First (instruction to Claude Code)

Start with Sprint 0–2 as a vertical slice: a working app where an organizer creates a circle, invites the storyteller, and the storyteller opens to a giant record button, records offline, and the story appears (with transcript) in the family feed. Everything else layers onto that spine.
