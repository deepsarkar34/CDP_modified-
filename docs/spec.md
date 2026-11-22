# CDP Journey: Dr. Ortiz — Design Spec

_Last updated: 2026-11-22_

## Purpose
A 15–18 minute live demo for a pharma client. Mixed room (brand and technical). Shows how a client's Snowflake and Salesforce Data 360 work together for one oncologist, end to end. Source brief: "Dr. Ortiz's Data Journey" HTML.

## Decisions
| Topic | Decision |
|---|---|
| Starting point | Copy of the Dr. Brown demo (stack, Indegene look, presenter flow, tests) |
| HCP | Dr. Lena Ortiz, medical oncologist, Houston; golden ID HCP-00731 |
| Client | No real company named. On-screen copy is generic; only the header uses the fictional client name, Acme Pharma (configurable in `scenario.json`) |
| Platform switch | Removed: the story is Snowflake + Salesforce Data 360 throughout |
| Opening screen | Six fragments, one per system (Veeva, IQVIA, Claims and EHR, SFMC, HCP website, OneKey) |
| Record count | Eight records across six systems (the brief said seven; the cards add to eight) |
| Decide | Two passes from the brief: rules, then ML; Rules only uses the brand priority list |
| Timer | 18 minutes |

## Steps and beats (30 beats)
Question (2), Capture (3), Clean (4), Master (3), AI and ML (3), Resolve (4), Audiences (2), Decide (2), Activate (4), Learn (3).

## What-if levers
- `M`: Rules only vs Rules plus machine learning. Pass 2 is crossed out on the map in Rules only.
- `C`: email consent off blocks every email option at pass 1 (both modes fall back to the rep visit), skips email touches, keeps her out of the email real-time audience and removes her from the email count.

## Copy and visual rules
Indegene look: navy chrome, white stage, Outfit, one gradient word per heading, magenta only for conflicts and alerts. Screens look like the systems they represent. Short labels on screen; explanations live in presenter notes. No bold lead-ins, slogans or middle-dot separators. The language model never decides: an Agentforce agent only writes the rep's explanation.

## Removed from the Dr. Brown version
Platform switch, five-sublayer decision (lift, value, capacity), clean room beat, recap beat.
