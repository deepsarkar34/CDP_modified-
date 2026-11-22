# CDP Journey Demo — Design Spec

_Last updated: 2026-11-12_

## 1. Purpose

A live, presenter-driven demo used in **10–15 minute pitch slots with pharma clients and prospects**. The goal is to make a **mixed room** (brand / commercial leaders and technical leaders) understand **what a customer data platform is and how it works**, by following one HCP — Dr. John A. Brown, retina specialist — from messy source systems to live channels.

Success looks like:
- A brand leader can retell the story: "six messy records became one doctor, reached the right way in five channels."
- A technical leader gets credible answers on demand (match rules, identity, connectors) without derailing the pitch.
- The presenter never hunts for buttons: everything is paced by the keyboard or a clicker.

Source of truth for the story: the original prototype `Dr. Brown's Data Journey` HTML.

## 2. Decisions made

| Topic | Decision |
|---|---|
| Format | Custom scripted demo app (not slides, not free-exploration) |
| Pacing | "Beats": each → press plays the next scripted moment |
| Length | ~15 minutes with Decide and Learn (Learn can be skipped) |
| Audience depth | Outcome-first default; `D` toggles a **deep-dive** technical layer |
| Vendor | **Vendor-neutral by default**, toggle for Salesforce Data 360, Adobe Real-Time CDP, Databricks (composable) |
| Data | Fully fictional; brand is "Acme Pharma" (rename in `src/scenario/scenario.json`) |
| Hosting | Static build, runs offline from a laptop |

## 3. Storyline (beats)

| Step | Wow moment | Deep dive |
|---|---|---|
| 1. Hook | "Is this one doctor or six?" — six scattered name variants | — |
| 2. Capture | Records stream in from five sources; inconsistencies light up | Feed cadence, de-identified patient data |
| 3. Clean | Raw values morph into clean values; duplicates collapse; patient token is re-tokenized | Bronze/silver rules, quality checks |
| 4. Master | Records fly together into one golden record with per-field source tags; master ID stamps on | Match rules, survivorship |
| 5. Resolve | Anonymous web cookie snaps onto his profile at portal login; insights appear | Identity ruleset, unified profile key |
| 6. Segment | Rules check off one by one while the HCP count falls to 1,240; publish cadence | Rule expressions, publish modes |
| 7. Activate | Push vs pull Sankey → his channel outputs → **live event** (dosing-guide download fires a rep alert + email) → clean room vs activation → recap | Connector per channel |

**What-if lever:** `C` flips Dr. Brown's email consent. Consent is a **per-channel activation filter**, not a segment rule: with consent off he stays in the segment (and for his rep, media, portal) but is removed from email; the email count drops by one.

> Note: the original prototype listed "Email consent is yes" as a segment rule *and* said consent is checked per channel. This spec resolves that in favour of per-channel filtering.

## 4. Vendor packs

Every on-screen product term comes from a vendor pack (`src/vendors/`). Packs: `neutral`, `salesforce`, `adobe`, `databricks`.

- **Salesforce:** Snowflake warehouse → Zero Copy → Data 360 (Identity Resolution ruleset, Unified Individual, Calculated Insights, Segments with Standard/Rapid/Real-time publish, Activation Targets, Data Actions).
- **Adobe:** warehouse → Sources / Federated Audience Composition → Real-Time CDP (XDM, Identity Service graph, Real-Time Customer Profile, computed attributes, batch/streaming/edge segmentation, Destinations, Journey Optimizer).
- **Databricks:** composable — lakehouse (Delta Lake, Unity Catalog, medallion layers) + identity partner (Amperity) or Databricks CustomerLake (announced June 2026, preview) + activation partner (Hightouch / Census reverse ETL). The UI marks steps that come from partners.

Vendor names change often; **verify labels against current vendor docs before each important pitch.**

## 5. Architecture

- **React 19 + TypeScript + Vite**, **framer-motion** for animation, **zustand** for state.
- `src/beats.ts` — the ordered beat list (id, step, local beat index, presenter note).
- `src/store.ts` — single store: beat index, vendor, deep dive, consent, presenter-sync.
- `src/sync.ts` — BroadcastChannel sync between the main window and the presenter window.
- `src/scenario/scenario.json` — all of Dr. Brown's data and counts.
- `src/stages/*` — one component per step; each receives its local beat index.
- `src/presenter/Presenter.tsx` — notes, next beat, elapsed timer vs 12:00 target (open with `P` or `?presenter`).

### Keyboard

| Key | Action |
|---|---|
| → / Space / PageDown | next beat |
| ← / PageUp | previous beat |
| 1–7 | jump to step |
| D | deep dive on/off |
| V | cycle vendor |
| C | toggle email consent (what-if) |
| P | open presenter window |
| F | fullscreen |
| R | reset |

## 6. Testing

- **Unit (vitest):** beat navigation bounds, step jumps, derived channel counts under consent on/off.
- **Walkthrough (Playwright):** steps through every beat in every vendor mode, fails on console errors, saves screenshots to `artifacts/`.

## 7. Visual and copy guidelines (v2)

- Indegene brand from indegene.com: ink `#07091D`, navy `#0F0A19`, blue `#0047AB`, bright blue `#1B70E0`, cyan `#04BEF2`, purple `#7167B8`, magenta `#DC1380`, cards `#F8F8F8`, Outfit.
- One gradient word per heading. Magenta only for conflicts and alerts.
- Screens look like the systems they represent (record windows, data tables, golden record, segment builder, inbox, rep app, phone notification).
- Copy: short labels and data, at most one line under a heading. No bold lead-ins, slogans, rule-of-three lines or middle-dot separators. Explanations live in presenter notes.

## 8. Decide and Learn steps (v3)

- **Decide** (step 07, between Segment and Activate). A segment says who; the decision layer decides what next for each person. One pipeline of five sublayers: 1 guardrails (rules), 2 predict response (ML), 3 lift over the 15% do-nothing baseline (ML), 4 value vs cost (lift × $2,000 − cost), 5 choose within capacity (6 rep slots, 8 doctors).
- Mode switch (`M`): Rules plus machine learning picks the remote call (+$230) and ranks slots by lift (Dr. Brown #1). Rules only switches off sublayers 2 to 4, picks the webinar email (brand priority 1) and ranks slots by propensity (Dr. Brown #7, misses the week).
- Sublayers auto-play at 1.4 s each, pulse on the map and in the step, can be clicked to jump, and are skipped/crossed out in Rules only. Reduced motion shows the finished state.
- The language model never decides: models and rules choose; an Agentforce agent (Salesforce mode) or an AI agent (other modes) only writes the rep's explanation.
- Email consent off (`C`) blocks the email options at the guardrail and skips email touches in the next best experience.
- Activate follows the decision: rep card and live-event decision line show the chosen action.
- **Learn** (step 09): three outcomes and what changes next week; holdout of 10% (124 of 1,240 HCPs) for 90 days.
- Data in `scenario.json` (`decide`, `learn`); logic in `src/decision.ts`, unit tested against the brief's tables. All numbers illustrative.
- Presenter target raised to 15 minutes.

## 9. Out of scope for v1

Second HCP / failure scenario, multiple audience lenses beyond deep dive, live data connections, backend.
