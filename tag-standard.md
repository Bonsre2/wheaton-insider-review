# Tag Standard — Bons Realty (proposed)

**Status:** Proposal for your review. Nothing here has been applied. This defines how tags should be named and used going forward, and maps each existing tag onto the new standard.

---

## 1. Naming convention

**Rule: `lowercase-hyphenated`, ASCII only, no spaces, no punctuation other than the hyphen, no dynamic content.**

- Format: `prefix-descriptor` (e.g. `status-nurture`, `source-egen`, `temp-hot`).
- All lowercase. Words separated by single hyphens. No spaces, slashes, colons, emojis, or trailing punctuation.
- No `{{merge fields}}` — ever (see §5, Governance).
- Keep to ≤ 3 words after the prefix.

**Why lowercase-hyphenated (vs the current mix of `seller-engaged` and `lead - seller`):**
1. **GHL tag matching is case-insensitive but string-literal on spacing.** `lead - seller` and `lead-seller` are *different* tags. A single style eliminates accidental near-duplicates.
2. **Spaces are fragile in automations and exports.** ` - ` (space-hyphen-space) is easy to mistype (`lead- seller`, `lead -seller`), and each typo is a new silent tag. Hyphen-only removes the ambiguity.
3. **It's already the majority style** — 5 of 7 tags are hyphenated. Standardizing on it is the smaller migration.
4. **Filtering/searching** in smart lists is predictable when every tag shares one shape.

---

## 2. Category prefixes

Every tag must start with one of a **small, closed set** of prefixes so tags are self-describing and filterable. Proposed set:

| Prefix | Meaning | Use for | Examples |
|---|---|---|---|
| `source-` | Where the lead came from | Acquisition channel (mirror of `lead_source` field for quick filtering) | `source-egen`, `source-phone`, `source-private-network` |
| `status-` | Where the lead is in its lifecycle | Coarse lifecycle state **only when a pipeline stage/field can't do it** | `status-followup`, `status-nurture` |
| `type-` | What kind of contact/deal | Persona / deal type | `type-seller`, `type-buyer` |
| `temp-` | Operational, temporary flags | Short-lived automation flags that get removed | `temp-sequence-paused`, `temp-dnc-review` |
| `campaign-` | Campaign / list membership | One-off campaign or list enrollment | `campaign-fall-2026-seller` |

**Guidance:** prefer **not** creating a tag at all if a pipeline stage or custom field already carries the meaning (see §3). Prefixes are for the residue that genuinely needs to be a tag.

---

## 3. Tag vs. custom field vs. pipeline stage

The audit found the same lifecycle state represented as a tag *and* a stage *and* a field. Decision rules to stop that:

**Use a PIPELINE STAGE when** the state is a step in a deal's forward progress and only one applies at a time.
- Seller lifecycle → **Seller Leads** stages (New Lead → … → Long-Term Nurture).
- ➜ `seller-engaged` and `long-term-nurture` are **stage concepts** ("Engaged / Qualifying", "Long-Term Nurture"). Prefer the stage; keep a tag only if automations must trigger off it (confirm in UI first).

**Use a CUSTOM FIELD when** the value is a discrete attribute you filter/report on, especially if a field already exists.
- Sequence state → **Sequence Status** field (Active/Paused/Complete/Nurture/Lost) already exists.
- Source → **lead_source** field already exists (and already lists `egen`, `private-network`, `Direct`, …).
- ➜ `sequence-paused` → **Sequence Status = Paused**. `long-term-nurture` (as a state) → **Sequence Status = Nurture**. `source-*`/`website-lead` → **lead_source**.

**Use a TAG only when** all of these hold:
- It's a **boolean membership** ("is / is not in this set") that no stage or field already expresses, **or** an automation genuinely keys off a tag trigger; **and**
- it can be **multi-valued** (a contact can have several at once), unlike a single-select field or a single stage; **and**
- it's cheap to add/remove and doesn't need history/reporting beyond presence.

**Rule of thumb:** *Stage = where the deal is. Field = what's true about the lead. Tag = a set the lead belongs to, or an automation switch.* If two of these fit, the tag loses.

---

## 4. Existing tags → proposed mapping

| Current tag | Verdict | Proposed target | Rationale |
|---|---|---|---|
| `seller-engaged` | **Prefer stage/field; keep tag only if it's a live trigger** | Pipeline stage **Engaged / Qualifying** (+ optional `status-engaged` tag *only if* a workflow triggers on it) | Duplicates the stage + Last Engagement Date field |
| `long-term-nurture` | **Retire in favor of stage + field** | Stage **Long-Term Nurture** and/or **Sequence Status = Nurture** | Triple-represented today |
| `seller-followup` | **Rename; keep as tag if used by automation** | `status-followup` | Coarse state; no dedicated stage exists for "needs follow-up" |
| `sequence-paused` | **Retire in favor of field**; if a workflow reads it, keep as `temp-sequence-paused` until logic moves to the field | **Sequence Status = Paused** (interim `temp-sequence-paused`) | Exact duplicate of an existing field option |
| `lead - seller` | **Rename** | `type-seller` | Fix spacing; it's a persona/deal-type |
| `source - phone` | **Rename → then migrate to field** | `source-phone` now; long-term move into **lead_source** | Fix spacing; source belongs in the field |
| `website-lead` | **Rename → then migrate to field** | `source-private-network` (or the correct channel); long-term move into **lead_source** | Ambiguous; the field is the system of record for source |

> Every "keep as tag if a workflow triggers on it" verdict is **gated on the UI trigger check** in `tag-audit-findings.md` §7C. Do not retire a tag that turns out to be a live trigger without first updating the workflow (see migration plan).

---

## 5. Governance (lightweight)

1. **Who may create tags:** only the account admin (you) or a documented, reviewed workflow. No ad-hoc tag creation by integrations or team members typing a new tag into a contact.
2. **No dynamic / merge-field tags, ever.** Tags must be literal strings. A value like `source - {{inboundwebhookrequest.source}}` means a webhook wrote an unrendered field — fix the webhook to write the **field**, not a tag. (This is what produced the broken tag already cleaned up.)
3. **Prefix-or-reject:** a tag that doesn't start with an approved prefix (`source- / status- / type- / temp- / campaign-`) shouldn't exist. Review the tag list quarterly and fold offenders back in.
4. **Field/stage first:** before adding a tag, check whether **Sequence Status**, **lead_source**, **Lead Score**, or a **pipeline stage** already carries the meaning. If so, use that.
5. **`temp-` tags must be removed** by the same automation that adds them (or on a documented schedule). They are switches, not history.
6. **One source of truth per concept:** source → `lead_source`; sequence state → `Sequence Status`; lifecycle → pipeline stage. Tags mirror these only when needed for filtering/triggering, and never contradict them (today `source - phone` contradicts `lead_source = Direct` on the same contact — exactly what to avoid).

---

## 6. Target end-state tag list

After migration, the sanctioned tag set should be small — roughly:

- `type-seller`, `type-buyer`
- `source-egen`, `source-phone`, `source-private-network` *(only if you want tag-level source filtering in addition to the `lead_source` field)*
- `status-followup` *(if no stage covers "needs follow-up")*
- `temp-sequence-paused` *(only until pause logic is fully driven by the Sequence Status field)*

Everything else (`seller-engaged`, `long-term-nurture`, `sequence-paused` as a permanent tag, `website-lead`, `lead - seller`, `source - phone`) is either renamed into the above or retired into a stage/field.
