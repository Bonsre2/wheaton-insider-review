# GoHighLevel Automation — Video vs. Bons Realty Build

**Gap analysis & improvement report**
**Prepared:** 2026-06-16 · **For:** Sean Bonselaar, Bons Realty
**Source video:** *"The Best GoHighLevel Automations for Real Estate Agents in 2026"* — Noah Halpern (YouTube ads agency)
**Compared against:** live GHL build documented in `Obsidian Vault/Sean's Brain/01 Bons Realty/Projects/GHL/` — `CLAUDE.md`, `Inventory.md`, `Integrations.md` (read in full, current as of session 8, 2026-06-16)

---

## TL;DR

The video is a **beginner-level template walkthrough** built to sell a YouTube-ads service and a GHL affiliate snapshot. Measured against it, **your build already covers roughly 80% of what it describes — and is materially more advanced** on compliance, cost control, branching, the kill-switch, long-term nurture, and the call-connect bridge. None of those exist in the video.

So this is **not** a "you're behind" report. It's a list of **specific mechanics the video uses that your build either lacks, has parked, or implements differently** — plus an explicit note of where you're already ahead so you don't regress while "filling gaps."

There are **5 genuine gaps worth acting on**, **3 that are already on your roadmap** (the video just reinforces them), and **1 place where the video's advice is actively worse than what you've built** (don't adopt it).

---

## The video's blueprint (condensed)

The whole video is one paid-lead funnel made of seven pieces:

1. **New-lead notification + opportunity creation** — form submit → create/update opportunity, drop into a pipeline stage, internal SMS alert to the agent.
2. **New-lead SMS speed-to-lead sequence** — instant text, then a 7-day / 11-touch cadence of simple yes/no questions ("Is this the right number?"), with a contact-timezone send window (8a–10p) and small humanizing waits (30s) so an email + SMS don't land simultaneously.
3. **Reply-handling with sentiment branching** — on customer reply, internal alert **and** an If/Else on **positive vs. negative intent**: positive → move opportunity to a **"Follow Up Now"** stage; negative → remove from workflow / do nothing.
4. **Follow-up reminder tasks** — a daily "Follow Up Now" queue the agent works manually.
5. **Appointment-booked notification** — calendar booking → internal alert + opportunity → "Appointment Booked" stage.
6. **Appointment reminders** — confirmation email asking the lead to **reply "YES" to confirm**, then 24h-before email + SMS, 2h-before SMS, 10-min-before SMS; humanizing 30s gaps; separate cloned workflows for **phone** vs **in-person** appointments.
7. **Conversational AI SMS bot** — on reply, wait ~3 min, hand off to Conversation AI that asks scripted qualifying questions one at a time with 20-second waits to look human.

Plus a recurring theme: **duplicate the new-lead workflow per lead source** (YouTube / Facebook / Google) and only swap the trigger.

---

## Coverage matrix

| # | Video component | Bons Realty status | Where it lives |
|---|---|---|---|
| 1 | New-lead alert + opportunity creation | ✅ **Have (better)** | `Master Lead Router` (`e216a5aa`, web forms) + `Egen Inbound Lead Workflow` (`7d7151d3`) → instant SMS alert to `+16304470884`, opp into **Seller Leads / New Lead** |
| 2 | Speed-to-lead SMS cadence | ✅ **Have (better)** | `Seller Lead Follow-Up` engine (`2d6e0fab`, PUBLISHED v17) — branch-first opener, 5-min first touch, ~30-day cadence (3 emails / 5 SMS / 5 call tasks), GSM-7, 8a–9p/7d |
| 3 | Reply sentiment branching → "Follow Up Now" | 🟡 **Partial — real gap** | `Stop Seller Follow-Up` (`de4095e2`, v8) stops the sequence on **any** reply, but does **not** classify positive vs negative or push to a prioritized stage |
| 4 | "Follow Up Now" daily task queue | ✅ **Have** | 5 call tasks in the engine + Stage = `Attempting Contact` / `Engaged-Qualifying`; no dedicated "call these today" stage tied to intent (see #3) |
| 5 | Appointment-booked notification | ✅ **Have** | `Appointment Status Alerts` (`95c6b86b`, v4) → alert + confirm SMS + email |
| 6 | Appointment reminder ladder | 🟡 **Have, two small gaps** | Same workflow: 3-day / 24h / 2h reminders, GSM-7, skip-if-past. **Missing:** reply-to-confirm mechanic and a 10-min-before nudge |
| 7 | Conversational AI SMS bot | 🟡 **Built, not live** | `Sean – Seller Booking (SMS)` bot (`X73NjlTB11SltMWuQePa`) — gated in the engine, conversation-tested, but global **Off**/non-primary; per-contact activation **unverified** |
| 8 | Humanizing micro-waits (30s before SMS) | 🟡 **Partial** | Send windows + 5-min first touch exist; no deliberate 20–30s offset between a same-moment email and SMS |
| 9 | Duplicate workflow per lead source | ✅ **Have (better)** | You **branch on `source`** inside one engine (Egen→Mia opener / web→general) instead of cloning — cleaner, less drift |
| — | No-show / cancelled handling | 🟡 **Roadmap** | Known TODO: 2 separate workflows (GHL can't If/Else on appt status) |
| — | Long-term nurture | ✅ **Have — video has none** | `Long-Term Seller Nurture` (`8c23a04a`, v5/6) |
| — | Kill-switch / stop-on-response | ✅ **Have — video has none** | `Stop Seller Follow-Up` |
| — | A2P / opt-out / GSM-7 cost control | ✅ **Have — video ignores entirely** | A2P approved 6/6; opt-out auto-append disabled; GSM-7 discipline; fee research |
| — | Call-connect auto-bridge | ✅ **Have — video has none** | Appended to Egen Inbound (v12): assign Sean → whisper + press-to-connect |

---

## Genuine gaps worth acting on

### P1 — Reply **sentiment branching** into a prioritized "Follow Up Now" stage
This is the one real conceptual gap. Today **any** inbound reply fires the kill-switch and yanks the lead out of the cadence into `Sequence-Paused` + an alert to you. That's correct for *stopping the robot*, but it treats "YES call me" and "stop texting me" identically — both just land in your inbox.

The video's move: classify reply intent and, on **positive**, push the opportunity to a dedicated **Follow Up Now** stage so there's a clean daily call list of hand-raisers, separate from everyone who merely replied.

**Recommendation:** keep the kill-switch as-is, but add an intent classification on reply (Conversation-AI sentiment, or a keyword If/Else as a cheap first pass) that moves positive repliers to a new **"Follow Up Now / Hot Reply"** stage on the **Seller Leads** pipeline. This is the highest-leverage change in the whole video for you.
*Caveat:* Conversation-AI billing is still UNVERIFIED per your fee research — a keyword If/Else avoids per-message AI cost for the first version.

### P2 — Reply-to-confirm on the appointment confirmation
Your booking flow auto-confirms and reminds, but never asks the lead to **actively reply "YES"**. The video's confirmation email/SMS ("reply YES to confirm, otherwise I'll cancel") is a cheap no-show reducer — an explicit micro-commitment and a live signal of who's actually coming.

**Recommendation:** add a "reply YES to confirm" line to the existing confirm SMS/email in `Appointment Status Alerts`, and (optionally) tag confirmed-repliers so you can see unconfirmed appointments at a glance. Keep it GSM-7, no opt-out language — consistent with your rules.

### P3 — 10-minutes-before final nudge
Your reminder ladder ends at 2h. The video adds a 10-min-before "I'll be calling shortly, make sure you're by your phone" SMS, which meaningfully lifts live-answer rates on phone consults.

**Recommendation:** add a 10-min-before SMS step (skip-if-past, GSM-7) to `Appointment Status Alerts`. Trivial add, real connect-rate impact.

### P4 — Take the Seller Booking bot live (already your roadmap, video validates the pattern)
The video's headline feature — a conversational SMS bot that qualifies while you're "watching Netflix" — is **exactly your Seller Booking bot**, which is built and conversation-tested but still global-**Off** and non-primary. The video reinforces that this is worth finishing.

**Recommendation:** run the **per-contact activation test** you already scoped (assign bot to a test contact, text the 708, confirm the *seller* bot replies and not Emma) and confirm Conversation-AI billing before flipping it on broadly. Nothing new to design — just close it out.

### P5 — Deliberate humanizing offset between simultaneous email + SMS
Minor polish, but cheap and on-brand with your "reads as personal, not automated" rule. When a step sends an email and an SMS at the same node (e.g. appointment confirmation), a 20–30s wait between them avoids the dead giveaway of both arriving in the same second.

**Recommendation:** insert short waits where an email and SMS currently fire together. Watch the send-window interaction so a wait doesn't accidentally hold a message overnight (you already hit this on the Call Connect proceed-time bug).

---

## Already on your roadmap — the video just reinforces it

- **No-show / cancelled workflows** — video doesn't even cover these (it's a weakness of the video). You already know they must be 2 separate workflows because GHL can't If/Else on appointment status. Build remains worthwhile.
- **Egen name mapping** — unrelated to the video, still open.
- **Disable wallet "Smart Adjustment"** — cost hygiene, unrelated to the video but still pending in the UI.

---

## Where you are already ahead — do **not** regress

The video would actually be a **downgrade** in several places. Don't let "filling gaps" pull you backward:

- **Compliance & cost.** The video has **zero** A2P/10DLC, opt-out, or GSM-7 awareness, and casually suggests emoji and "wait 0.5 min" patterns. Your GSM-7 discipline, disabled opt-out auto-append, and per-segment fee control are real money and real deliverability — keep them.
- **One branching engine vs. cloned per-source workflows.** The video tells you to **duplicate** the whole new-lead workflow for every ad source. You correctly **branch on `source`** inside one engine. Cloning is exactly the workflow sprawl you spent two sessions consolidating (26 → 5). **Do not adopt the duplicate-per-source pattern.**
- **Kill-switch + long-term nurture.** Neither exists in the video. Both are core to a durable system.
- **Call-connect auto-bridge.** The video's bot is impressive to a beginner; your auto-call→whisper→press-to-connect bridge is a tier above for actually getting you on the phone with hot leads.

---

## Suggested order of operations

1. **P1 — reply sentiment branch → "Follow Up Now" stage** (keyword version first; biggest payoff)
2. **P4 — finish the Seller Booking bot go-live test** (already scoped; video validates it)
3. **P2 + P3 — reply-to-confirm + 10-min-before nudge** (two small adds to `95c6b86b`)
4. **P5 — humanizing email/SMS offset** (polish)
5. Continue existing roadmap: No-Show/Cancelled workflows, Egen name split, disable Smart Adjustment.

All GHL builds per your standing rule: **snapshot the workflow JSON → direct backend-API edit where possible → AI-builder prompt only for triggers → re-read via API to verify** (topology, GSM-7, version bump, opt-out scrub).

---

*Anchored to the live build docs in the GHL project folder. Figures and IDs cited are as recorded there on 2026-06-16; verify against GHL before editing.*
