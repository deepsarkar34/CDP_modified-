# CDP Journey: Dr. Ortiz (Snowflake + Salesforce Data 360)

A live, presenter-driven demo that follows one medical oncologist, Dr. Lena Ortiz, from six source systems through Snowflake engineering and AI, Salesforce Data 360, a decided next action, live channels and a learning loop.

**Question → Capture → Clean → Master → AI and ML → Resolve → Audiences → Decide → Activate → Learn**

All people, IDs, scores, counts and company names are illustrative. Content names are placeholders for MLR-approved assets. Built from the "Dr. Ortiz's Data Journey" HTML brief; it started as a copy of the Dr. Brown demo in `deepsarkar34/CDP`, which is unchanged.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the build, http://localhost:4173
```

## Presenting

| Key | Action |
|---|---|
| → / Space / PageDown | next beat (most clickers work) |
| ← / PageUp | previous beat |
| 1–9, 0 | jump to a step (0 = step 10, Learn) |
| D | technical detail on/off |
| C | toggle Dr. Ortiz's email consent (what-if) |
| M | Decide step: Rules only vs Rules plus machine learning |
| P | presenter notes (notes, next beat, 18:00 timer) |
| F | fullscreen |
| T | light/dark theme |
| R | reset |

## What each step shows

1. **Question**: six fragments, one per system, merge into Lena Ortiz, MD.
2. **Capture**: 8 records across 6 systems; batch through Openflow to Snowflake, web streamed to Data 360.
3. **Clean**: bronze to silver in Snowflake; patient tokens re-tokenized to the company's own token space.
4. **Master**: one golden record, golden ID HCP-00731, matched in Snowflake against OneKey.
5. **AI and ML**: Snowflake ML likelihood score 0.81; Cortex turns a call note into a topic; Snowflake Intelligence answers a plain-English question.
6. **Resolve**: Zero Copy into Data 360; on Day 3 a tracked email click links her anonymous web device.
7. **Audiences**: brand manager builds Side effect priority (4,120 to 342); a real-time audience she enters at 10:16.
8. **Decide**: two passes, rules then ML. ML picks the side effect guide email (34%); Rules only picks the webinar invite.
9. **Activate**: push and pull to five channels; what she sees; the 10:14 to 10:42 real-time path; one story across channels.
10. **Learn**: three outcomes and what changes next week; what flows back to Snowflake; a 34-oncologist holdout (31% vs 12%).

## Customize

- `src/scenario/scenario.json`: every name, number and piece of copy for Dr. Ortiz.
- `src/beats.ts`: the script, one presenter note per beat.
- `src/decision.ts`: the two-pass decision logic.
- Logo: put a white version at `src/assets/logo.svg` (or `.png`).

## Quality checks

```bash
npm test                               # unit tests for the story numbers and the decision
npm run build && npm run preview &
npm run walkthrough                    # every beat, both decision modes, narrow screen; screenshots in artifacts/
```
