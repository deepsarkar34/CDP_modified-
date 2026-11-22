# CDP Journey Demo

A live, presenter-driven demo that explains how a customer data platform (CDP) works by following one HCP, Dr. Brown, from five messy source systems to five live channels. It is built for 10–15 minute pitches to pharma clients and prospects in a mixed room.

**Question → Capture → Clean → Master → Resolve → Segment → Decide → Activate → Learn**

It is vendor-neutral by default, with one-click relabelling for **Salesforce Data 360**, **Adobe Real-Time CDP** and a composable **Databricks** stack. All people, IDs and counts are fictional.

## Run it

```bash
npm install
npm run dev          # development, http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the build, http://localhost:4173
```

The build is static, so it runs offline. The fonts load from Google Fonts when online and fall back to system fonts otherwise.

## Presenting

| Key | Action |
|---|---|
| → / Space / PageDown | next beat (most clickers work) |
| ← / PageUp | previous beat |
| 1–9 | jump to a step |
| D | technical detail on/off |
| V | cycle vendor |
| C | toggle Dr. Brown's email consent (what-if) |
| M | Decide step: switch between Rules only and Rules plus machine learning |
| P | open presenter notes (notes, next beat, 12:00 timer) |
| F | fullscreen |
| T | light/dark theme |
| R | reset |

Put the main window on the projector (press F) and the presenter window on your laptop. The two windows stay in sync, so you can drive the demo from either one.

## Branding

The look follows indegene.com: navy chrome, white stage, the Outfit typeface, and one blue to purple to magenta gradient word per heading. Magenta is reserved for conflicts and alerts. The colour tokens are at the top of `src/styles.css`.

To use the official logo, put a white version at `src/assets/logo.svg` (or `logo.png`). Until then the name is shown as plain text.

## Customize per client

- `src/scenario/scenario.json`: brand name, Dr. Brown's data, segment counts and channel reach.
- `src/beats.ts`: the script, with one presenter note per beat.
- `src/vendors/index.ts`: product terms for each vendor. Check them against current vendor docs before an important pitch, because vendors rename products often.

## Quality checks

```bash
npm test                 # unit tests (beat engine, consent logic, vendor packs)
npm run build && npm run preview &   # then:
npm run walkthrough      # clicks every beat in every vendor mode; fails on console errors; screenshots in artifacts/
```

Design decisions are recorded in [`docs/spec.md`](docs/spec.md).
