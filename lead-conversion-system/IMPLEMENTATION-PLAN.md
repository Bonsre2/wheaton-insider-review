# Lead Conversion System — Implementation Plan

**Source:** "Realtors: Increase your LEAD CONVERSION by 1600% with 1 simple change" — Mike Sherrard × Joshua Smith
**Goal:** Turn every idea in the transcript into a running system built on **GoHighLevel (GHL)** + **Claude Skills** + **Claude Routines**, with Claude doing as much of the build and the recurring work as possible.

---

## 0. The one idea everything hangs on

> *"Most agents don't have a lead-generation problem. They have a lead-conversion problem."*

You do **not** need more leads. You need to plug the holes in the bucket you already have. The math from the transcript: fixing two conversion ratios took one agent to **2.7× the business with zero extra leads or hours**. So the entire build is oriented around **measuring and lifting conversion ratios**, not adding traffic.

**The two numbers we are optimizing above all else:**

| Ratio | Industry avg | Target | What lifts it |
|---|---|---|---|
| Appointment **set → show** | 50% | **75%+** | Comfort, close date, confirmation, selling the value |
| Appointment **conducted → client signed** | ~50% | **85%+** | Mastered buyer consult / listing presentation |

Supporting funnel benchmarks from the transcript:
- ~**10%** dial → conversation (≈10 dials per conversation)
- **6** conversations → 1 appointment set
- ~**60** reachouts → 1 appointment set
- **5** "no"s from the same lead before the "yes"

---

## 1. Architecture — who does what

Three tools, three distinct jobs. Keeping these lanes clean is what makes it maintainable.

| Layer | Role | Owns |
|---|---|---|
| **GoHighLevel** | System of record + execution engine | Contacts, pipeline stages, custom fields, calendars, the drip/SMS engine, appointment reminders, property-alert triggers, call-task creation, mass-email sends |
| **Claude Skills** | On-demand content + knowledge + decision helpers | Writing every email/text/script, building GHL workflow blueprints, generating market updates, prepping call briefs, QA-ing presentations, computing KPIs |
| **Claude Routines** | Scheduled triggers that run skills automatically | Friday "what's happening" email, monthly market update, weekly KPI digest, holiday emails, "who to call today" briefs |

**The glue (Claude ↔ GHL):** three possible connection paths, pick one in kickoff —
1. **GHL native workflows** — Claude writes the blueprint, you paste/configure it in GHL. Zero integration risk, most manual.
2. **Zapier / Make bridge** *(both available in this workspace)* — Claude generates content, Zapier/Make pushes it into GHL (create campaign, create task, tag contact). Good middle ground.
3. **GHL API direct** — Claude reads funnel data and writes campaigns/tasks itself. Most automated; needs a GHL API key with the right scopes.

> Recommendation: start with **path 1** for the automations (they're one-time GHL setups anyway) and **path 3** for the *reporting + content push* so Claude can pull live numbers and drop drafts straight into GHL.

---

## 2. What Claude can do vs. what stays human

**Claude does (maximize here):**
- Writes the entire drip library — every email + text, in your voice, value-first.
- Generates the weekly newsletter, holiday emails, and monthly market-update scripts.
- Produces lead-source-specific call scripts + the pre-frame / objection frameworks.
- Builds copy-paste GHL workflow blueprints (stages, tags, timings, triggers).
- Prepares a **pre-call brief** on each contact (goal, timeline, kids' names, last touch) before you dial.
- Pulls funnel numbers, computes the ratios, and flags the single biggest leak each week.
- QAs your buyer consult / listing presentation and (if you feed it call recordings) your live calls.

**Stays human (by design — the transcript is explicit):**
- The actual phone calls and the human connection. *"When it comes to follow-up I don't use any element of AI… it takes away from the human connection."* Claude preps you; **you** make the call.
- Signing clients on appointments.
- MLS / property-alert credentials and setup inside GHL.
- Final send approval on anything outbound (until you trust a routine enough to auto-send).

---

## 3. The staged rollout

Each phase is shippable on its own and delivers value before the next starts. Rough cadence assumes you're doing this alongside normal work.

### Phase 0 — Foundation & measurement (Week 1)
*You can't lift a ratio you don't track.*

- **GHL:** rebuild the pipeline to mirror the real funnel:
  `New Lead → Attempting Contact → Conversation Had → Appointment Set → Appointment Shown → Client Signed → Under Contract → Closed → Past Client` (+ a `Long-Term Nurture` and `Lost` bucket).
- **GHL custom fields:** `Goal`, `Timeline Bucket` (<6mo / 6–12mo / 12mo+), `Lead Source`, `Kids/Family notes`, `Personal notes`, `Last Conversation date`.
- **Claude Skill:** `kpi-definitions` — the canonical definitions + targets so every report is consistent.
- **Claude Routine:** `weekly-kpi-digest` — pulls the funnel counts, computes set→show, show→signed, dial→conversation, names the biggest leak, recommends the one tweak. (Goes live once the GHL data path is connected.)
- **Deliverable:** your baseline numbers. This is the "before" the 1600% is measured against.

### Phase 1 — CRM as your "technology assistant" (Weeks 1–2)
*Automate what can be delegated; make the CRM remind you of what can't.*

Build the tag-driven cadence engine in GHL:
- **No-Timeframe cadence:** call task day 1 → every other day for 14 days → every 21 days for a year.
- **Timeline buckets:** `<6mo` → call every 30 days; `6–12mo` and `12mo+` → their own intervals. (Rule baked in: **cut whatever timeline they tell you in half** before bucketing.)
- **1000-day email/text drip:** everyone enrolled on entry.
- **26-day / 12-touch** sequence for appointments that didn't sign (6 emails + 6 call tasks), then auto-returns them to lead follow-up.
- **Past-client** sequence: every 90 days for 20 years.
- **Sender-name trick** on all email: from-name `"<You> Realtor"` so even trashed emails plant the brand.

- **Claude Skills:** `drip-library-writer` (the whole email/text library), `ghl-cadence-blueprint` (the workflow spec you build in GHL).

### Phase 2 — Property alerts (Week 2)
- **Buyers:** instant saved-search alerts — beat them to Zillow.
- **Sellers (reverse alert):** weekly "just sold near you" — every comparable sold in the last 7 days. **Not** an automated AVM/CMA (the transcript warns those are inaccurate and create bait-and-switch on listing appts).
- **Claude Skill:** `property-alert-templates` — the buyer + seller alert copy. If MLS "sold" data can be exported/fed in, a routine can compile the weekly seller digest.

### Phase 3 — The mass-email engine (Weeks 2–3)
*This is the "one newsletter that works like magic." Target ≈5.5 broadcasts/month.*

- **Weekly "What's Happening This Weekend" (Friday) — the flagship.** Non-real-estate value: local events, concerts, sports, comedy. *"Happy Friday… here's a list of everything going on in the area this weekend."*
- **Holiday emails** — ~7 core US holidays, non-real-estate, from a real-estate sender.
- **Monthly market update** — short video preferred: "here's what's going on in [Month Year] in [your metro]; if you own a home this means X; if you're buying it means Y."

- **Claude Skills:** `weekly-whats-happening` (pulls local events for your area), `holiday-email` , `monthly-market-update` (script + shot list for the video).
- **Claude Routines:** `friday-newsletter` (every Fri 7am → draft + push to GHL), `holiday-emails` (fires days ahead of each holiday), `monthly-market-update` (1st of month).
- **The transcript's proof point:** an agent's client subscribed silently for **18 months**, then reached out from one Friday email and closed. Consistency is the whole game — routines guarantee it.

### Phase 4 — Phone conversion system: scripts, frameworks, mindset (Weeks 3–4)
*Appointments get set on the phones.*

- **Call-1 objective framework:** identify goal → identify timeline → set appointment if appropriate.
- **Pre-frame mirroring:** raise the objection before they do ("I know you're probably just browsing…").
- **De-anchoring language + soft/slow tone** to keep them out of fight-or-flight; **multiple-choice timeline** ("3 months, 6 months, a year, two years?").
- **Follow-up-call framework:** connection & rapport first (kids' names, job, that soccer tournament) → reconfirm goal + timeline → set appointment. *88% go with the first agent they connect with.*
- **Daily schedule** (put yourself on it): 7–8 CRM/prep · 8–10 phones (**50 reachouts, 5 conversations min**) · 10–10:30 SOI/past clients · 10:30–12 admin · 12+ appointments/showings/more lead gen. Best answer windows: **8–10am and 4–6pm**.
- **Mindset:** the call-reluctance reframe (the "funeral" story) — belongs in your morning prep.

- **Claude Skills:** `call-script-generator` (per lead source — Zillow / open house / YouTube / FSBO / expired), `pre-call-brief` (one-pager per contact before you dial), `objection-preframe-library`.
- **Claude Routine:** `daily-call-brief` (each morning → today's call list from GHL + a prep card per contact).

### Phase 5 — Appointment show-rate & conversion (Weeks 4–5)
*Lift the two money ratios directly.*

- **The 4 show-rate levers:** (1) make them comfortable — the **"no-pressure policy"** script; (2) set the appointment **close** (same day / 24h / 48h max — beyond that, no-shows skyrocket); (3) **confirm properly** (multi-touch confirm sequence); (4) **sell the value** of the appointment (why it's worth their time even if they're a year out).
- **Master the buyer consultation & listing presentation** → the 85% take-rate. (Transcript: an agent who finally mastered the buyer consult did 20 deals in one quarter.)

- **GHL:** appointment-confirmation sequence, pre-appointment "sell the value" email/video.
- **Claude Skills:** `no-pressure-appointment-script`, `appointment-confirmation-sequence`, `presentation-builder-qa` (build + stress-test your buyer/listing decks), `post-appointment-26day` (the non-signed follow-up content).

### Phase 6 — The optimization loop (ongoing)
- Weekly: `weekly-kpi-digest` routine names the biggest leak and the one tweak.
- Monthly: deeper funnel review + adjust cadences/scripts based on what's converting.
- This is where the 1600% compounds — small hinges, big doors.

---

## 4. Skills to build (catalog)

| Skill | Purpose | Phase |
|---|---|---|
| `kpi-definitions` | Canonical funnel metrics + targets | 0 |
| `drip-library-writer` | Full 1000-day email/text library, your voice | 1 |
| `ghl-cadence-blueprint` | Copy-paste GHL workflow specs | 1 |
| `property-alert-templates` | Buyer instant + seller reverse-alert copy | 2 |
| `weekly-whats-happening` | Friday local-events newsletter | 3 |
| `holiday-email` | 7 core holiday emails | 3 |
| `monthly-market-update` | Market video script + shot list | 3 |
| `call-script-generator` | Per-lead-source call scripts | 4 |
| `pre-call-brief` | Per-contact prep one-pager | 4 |
| `objection-preframe-library` | Pre-frame + objection handling | 4 |
| `no-pressure-appointment-script` | Comfort/close appointment setting | 5 |
| `appointment-confirmation-sequence` | Multi-touch confirm to hit 75% show | 5 |
| `presentation-builder-qa` | Build + QA buyer/listing presentations | 5 |
| `post-appointment-26day` | 12-touch non-signed follow-up | 5 |

## 5. Routines to schedule (catalog)

| Routine | Cadence | Runs |
|---|---|---|
| `daily-call-brief` | Weekdays ~7am | Today's call list + prep cards |
| `friday-newsletter` | Fri ~7am | Draft + stage the weekend email |
| `holiday-emails` | ~3 days before each holiday | Draft holiday email |
| `monthly-market-update` | 1st of month | Market update script |
| `weekly-kpi-digest` | Mon ~7am | Funnel ratios + biggest leak + one tweak |

---

## 6. Dependencies / what I need from you to start building

1. **GHL connection path** — API key (path 3), Zapier/Make (path 2), or manual blueprints (path 1)?
2. **Your market/metro + primary lead sources** — so the content and scripts are tuned (Phoenix-style examples in the transcript become *your* market).
3. **Your voice** — a few of your existing emails/texts, or I draft fresh in a "helpful, no-pressure, local-expert" tone and you edit.
4. **Where to start** — foundation first (Phase 0–1), or a quick win first (the Friday newsletter skill+routine, live this week)?

---

*This plan is the reference. Each skill/routine will be built as its own file under `lead-conversion-system/skills/` and `lead-conversion-system/routines/` as we work through the phases.*
