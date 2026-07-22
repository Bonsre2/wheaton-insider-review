# Tag Audit — Findings

**Account:** Bons Realty (GHL sub-account `uo1qqCnDNokVbugAPqHi`, Naperville IL)
**Date:** 2026-07-22
**Mode:** Read-only. No tags/contacts/workflows were created, edited, renamed, or deleted. Only GET-equivalent reads were run.

---

## 0. How this audit was run (and its limits)

The task specified direct `curl` calls to `https://services.leadconnectorhq.com` using `$GHL_TOKEN`.
**That token is not present in this execution environment** (this is an isolated remote container; the `export` from your local shell did not carry over). No GHL credential exists here under any name.

A **GoHighLevel MCP connector** *is* attached to this session and is authenticated to the correct sub-account (`uo1qqCnDNokVbugAPqHi`, verified via `locations/get-location`). All read-only data below came through that connector. What it can and cannot reach:

| Audit item | Specified endpoint | Reachable here? | How |
|---|---|---|---|
| Actual tag **usage** (page all contacts) | `GET /contacts/` | ✅ Yes | MCP `contacts_get-contacts` |
| Pipelines + stages | `GET /opportunities/pipelines` | ✅ Yes | MCP `opportunities_get-pipelines` |
| Custom fields | `GET /locations/{id}/customFields` | ✅ Yes | MCP `locations_get-custom-fields` |
| **Defined-tag registry** | `GET /locations/{id}/tags` | ❌ **No** | No MCP tool; needs `$GHL_TOKEN` |
| **Workflow inventory** | `GET /workflows/` | ❌ **No** | No MCP tool; needs `$GHL_TOKEN` |
| Workflow **trigger/action configs** | (none) | ❌ **No** | GHL v2 API never returns this — **UI-only**, even with the token |

**Two consequences, stated plainly:**

1. **"Defined-in-settings (y/n)" and "orphaned (defined but unused)" cannot be answered from here.** I can prove a tag *is applied to N contacts*; I cannot prove a tag is *defined in settings but applied to nobody*, because that requires the tags-registry endpoint. Those cells are marked **UNKNOWN — needs `/locations/{id}/tags`**.
2. **No tag can be confirmed as a workflow trigger or a workflow action from any API.** GHL's v2 `GET /workflows/` returns only workflow `id` / `name` / `status` / `version` — **never** the trigger type or the Add-Tag/Remove-Tag/If-Else steps. Every trigger/action classification in Section 5 is therefore **inference to be confirmed in the UI**, and is listed as such in Section 7.

---

## 1. Tag inventory & actual usage

Source: all **29 contacts** (`contacts_get-contacts`, `limit=100`; API returned `meta.total: 29`, single page — full census, not a sample).

Seven distinct tags are applied across the account:

| Tag | Defined in settings? | # contacts using | Example contact (id) | Notes |
|---|---|---|---|---|
| `seller-engaged` | UNKNOWN — needs `/locations/{id}/tags` | **6** | apoorve mohate (`wq8lOU3yV8iWjNeUMWv3`) | Always co-occurs with `long-term-nurture` |
| `long-term-nurture` | UNKNOWN | **6** | apoorve mohate (`wq8lOU3yV8iWjNeUMWv3`) | Always co-occurs with `seller-engaged`; **overlaps** Seller Leads stage "Long-Term Nurture" and Sequence Status="Nurture" |
| `seller-followup` | UNKNOWN | **5** | nicholas gervase (`TxCZpVGqAJwpWvY1nhdL`) | Never co-occurs with `seller-engaged` |
| `sequence-paused` | UNKNOWN | **1** | harold lao (`FOAdVx8UsvRjvS9TzDC8`) | Co-occurs with `seller-followup`; **overlaps** Sequence Status field ="Paused" |
| `lead - seller` | UNKNOWN | **1** | tim vandergriff (`w1wnXHSe8bYvQDCvQesq`) | Spaced-naming variant; walk-in contact |
| `source - phone` | UNKNOWN | **1** | tim vandergriff (`w1wnXHSe8bYvQDCvQesq`) | Spaced-naming variant; same contact's `lead_source` field = "Direct" (inconsistent) |
| `website-lead` | UNKNOWN | **1** | charu sondhi (`lrzJSyQqKKh3f1Kv9dhM`) | Hyphenated; from Private-Network form |

**All 7 tags you listed are present and in use** — none is orphaned *at the contact level*. Whether additional tags exist that are defined-but-applied-to-nobody is UNKNOWN until the tags registry is read.

### 1a. Confirmation of the two "already removed" bad tags

You said `website lead` (spaced) and `source - {{inboundwebhookrequest.source}}` (broken merge-field) were removed from the only contact using them.

**Confirmed removed at the contact level.** Scanning all 29 contacts, neither string appears on any contact. The only similar live tags are `website-lead` (hyphenated, 1 contact) and `source - phone` (1 contact) — distinct from the two bad ones.
**Caveat:** "removed from contacts" ≠ "deleted from settings." A tag with zero contacts can still linger in the tags registry. Confirm deletion from settings via `GET /locations/{id}/tags` or the UI (see Section 7).

---

## 2. Usage patterns (verified from contact data)

- **`seller-engaged` + `long-term-nurture` are a fixed pair** — all 6 "engaged" contacts carry both, none carries one without the other. Consistent with your statement that eGEN intake applies both.
- **`seller-followup` is mutually exclusive with `seller-engaged`** — 5 contacts, none overlapping the engaged set. These read as two **status states** of the same lead, which is exactly the kind of thing that belongs in a pipeline stage or a status field, not two independent tags (see `tag-standard.md`).
- **`sequence-paused`** appears only alongside `seller-followup` (harold lao) and duplicates the **Sequence Status** custom field (which already has a "Paused" option).
- **eGEN source contacts (11 total)** split: 7 carry `seller-engaged`+`long-term-nurture`, 4 carry `seller-followup` (one of those also `sequence-paused`). So the "seller-engaged + long-term-nurture at intake" rule holds for most eGEN contacts but not all — either the creation workflow branches, or tags were changed later by hand. **The branch/After-intake logic is not visible via API — confirm in UI (Section 7).**
- The two spaced-naming tags (`lead - seller`, `source - phone`) exist **only** on the one manual walk-in contact (tim vandergriff), whose notes say *"do not enroll in any workflow yet."*

---

## 3. Workflow inventory

**Not retrievable from this environment.** The MCP connector exposes no workflows endpoint, and `$GHL_TOKEN` is absent, so `GET /workflows/?locationId=...` could not be run. This section must be completed either by supplying the token (to get the name/status list) or from the UI.

**Flagged, per your brief:** the eGEN lead-creation workflow **`7d7151d3-414a-4781-a4bf-c9535b3654e6`**. Contact data is consistent with it creating leads with `source: "egen"` into **Seller Leads → New Lead** and applying seller tags at intake — but its trigger and its Add-Tag steps are **not** API-visible and must be confirmed in the UI (Section 7).

**What the contact data lets us infer about workflow activity (inference, not confirmation):**
- 11 contacts have `source: "egen"` and attribution `{utmSessionSource: "CRM Workflows", medium: "Manual"}` — consistent with programmatic creation by a workflow.
- Tag pairing patterns (Section 2) are consistent with Add-Tag actions inside that workflow.

---

## 4. Custom fields & pipeline stages that overlap tags (verified)

This is the evidence base for the tag-vs-field-vs-stage rules in `tag-standard.md`.

**Relevant custom fields (from `locations_get-custom-fields`):**

| Field name | Key | Type | Options (if any) | Overlaps tag |
|---|---|---|---|---|
| Sequence Status | `contact.sequence_status` | SINGLE_OPTIONS | Active, Paused, Complete, Nurture, Lost | `sequence-paused`, `long-term-nurture` |
| lead_source | `contact.lead_source` | SINGLE_OPTIONS | foreclosure-landing, private-network, home-valuation, equity-check, should-i-sell, timeline-check, consultation, idx-buyer, Emma Chat, Direct, egen | `source - phone`, `website-lead` |
| Last Engagement Date | `contact.last_engagement_date` | DATE | — | `seller-engaged` (partial) |
| Lead Score | `contact.lead_score` | NUMERICAL | — | (lead temperature) |
| urgency_level | `contact.urgency_level` | SINGLE_OPTIONS | Right away / Within 30 days / 30-60 days / Just researching | (lead temperature) |
| timeline | `contact.timeline` | SINGLE_OPTIONS | ASAP / 1–3 months / 3–6 months / Just exploring | (lead temperature) |
| campaign_tag | `contact.campaign_tag` | TEXT | — | (campaign membership) |

**Seller Leads pipeline stages (`opportunities_get-pipelines`, id `RBTF7p6rkplOPZi9A5GD`):**
New Lead → Attempting Contact → **Engaged / Qualifying** → Consultation Booked → Consult Done - Decision Pending → **Long-Term Nurture**

So `seller-engaged` overlaps the **"Engaged / Qualifying"** stage, and `long-term-nurture` overlaps the **"Long-Term Nurture"** stage *and* the Sequence Status "Nurture" value. The same lifecycle state is currently represented in up to three places (tag + stage + field). This is the core hygiene problem to resolve in the standard.

Other pipelines: **Active Listing Pipeline** (`tHESDfMTLKOs33Fc5R3Q`, 8 stages, Listing Agreement Sent → … → Closed) and **Buyer Leads** (`vW977vdEl6kjGNaUyq5j`, same 6-stage shape as Seller Leads).

---

## 5. Tag ↔ automation dependency map (best-effort; confirm all in UI)

**Reminder:** no API (MCP *or* token-based v2) reveals workflow triggers or Add/Remove-Tag/If-Else steps. Every "role" below is an **inference from contact data + your notes**, to be confirmed in the UI. None is asserted as fact.

| Tag | Inferred role | Basis | API-confirmable? |
|---|---|---|---|
| `seller-engaged` | (b) Applied by eGEN workflow at intake; possibly (a) a trigger for a nurture sequence | Fixed pairing on eGEN contacts | ❌ No — confirm in UI |
| `long-term-nurture` | (b) Applied by eGEN workflow at intake; possibly (a) trigger for long-term nurture | Fixed pairing; overlaps LT-Nurture stage/field | ❌ No — confirm in UI |
| `seller-followup` | (b) Applied by workflow branch or manual; possibly (a) a trigger for a follow-up sequence | On 4 eGEN + others; mutually exclusive with engaged | ❌ No — confirm in UI |
| `sequence-paused` | (a/b) Likely a "pause" flag read by a workflow If/Else to suppress sends | Name + co-occurrence with followup; duplicates Sequence Status | ❌ No — confirm in UI |
| `lead - seller` | (d) Organizational (manual walk-in), *unless* a workflow keys off it | Only on 1 manual contact marked "do not enroll" | ❌ No — confirm in UI |
| `source - phone` | (c/d) Source label, likely manual | Only on same manual contact | ❌ No — confirm in UI |
| `website-lead` | (c) Form/webhook-applied on web leads | On a Private-Network form contact | ❌ No — confirm in UI |

---

## 6. Hygiene issues

1. **Naming inconsistency (spacing) — duplicates-in-spirit.**
   - `lead - seller` and `source - phone` use `word - word` spacing; the rest use `lowercase-hyphenated` (`seller-engaged`). No two tags are exact-duplicate variants of each other today, but the two styles will *produce* collisions (e.g. someone later creates `seller` vs `lead - seller`). Standardize now.
2. **Broken merge-field tag — CONFIRMED GONE at contact level.**
   - `source - {{inboundwebhookrequest.source}}` (an unrendered webhook merge field) is on no contact. Confirm it is also deleted from the tags registry (Section 7). This is the strongest argument for the "no dynamic/merge-field tags" governance rule.
3. **Redundant with structured data (biggest issue).**
   - `sequence-paused` duplicates **Sequence Status** = "Paused".
   - `long-term-nurture` duplicates **Sequence Status** = "Nurture" *and* the Seller Leads **"Long-Term Nurture"** stage.
   - `seller-engaged` overlaps the **"Engaged / Qualifying"** stage and the **Last Engagement Date** field.
   - `source - phone` / `website-lead` duplicate the **lead_source** field (which even lists `egen`, `private-network`, etc.).
   These are candidates to *retire in favor of* the field/stage, not merely rename. Handled in `tag-standard.md` and `tag-migration-plan.md`.
4. **Orphaned (defined-but-unused) tags — UNDETERMINED.**
   - Cannot be computed without `GET /locations/{id}/tags`. Every tag *in use* is accounted for; the registry may hold extras. Listed in Section 7.
5. **Test/junk data (contacts, not tags).**
   - Contact `deawf afde` (`Q3bPlY3aNdgOxHUf8zlh`, email `ababc12@gmail.com`, +91 India number, Asia/Calcutta) looks like a test record. It carries **no tags**, so it does not create tag junk — noted only for your awareness. No tag qualifies as test/junk except the already-removed merge-field tag.

---

## 7. Confirm in GHL UI (checklist — API cannot answer these)

**A. Tags registry (needs `GET /locations/{id}/tags` or Settings → Tags):**
- [ ] List every tag defined in settings; compare to the 7 in-use tags to find **orphans** (defined, 0 contacts).
- [ ] Confirm `website lead` (spaced) and `source - {{inboundwebhookrequest.source}}` are **deleted from settings**, not just removed from the contact.

**B. Workflow inventory (needs `GET /workflows/` or Automation → Workflows):**
- [ ] List all workflows with name + status (published/draft).
- [ ] Locate workflow `7d7151d3-414a-4781-a4bf-c9535b3654e6` (eGEN creation) and record its name + status.

**C. Per-workflow trigger/action detail (UI-only — never in the API):**
For **each** workflow found in (B), open it and record:
- [ ] **Trigger(s)** — is any of `seller-engaged`, `long-term-nurture`, `seller-followup`, `sequence-paused` a **"Contact Tag" trigger**? (This is the make-or-break dependency for renaming — see migration plan.)
- [ ] **Add Tag / Remove Tag actions** — which tags does the workflow write? (Confirm the eGEN workflow adds `seller-engaged`+`long-term-nurture` and where `seller-followup` gets applied.)
- [ ] **If/Else conditions** — does any branch read `sequence-paused` (or any tag) to gate sends?
- [ ] For the eGEN workflow specifically: confirm it drops leads into **Seller Leads → New Lead** and whether it branches to `seller-followup` vs `seller-engaged`.

**D. Forms/webhooks (UI-only):**
- [ ] Confirm which form/webhook applies `website-lead` (Private-Network form suspected) so the source can be migrated to the `lead_source` field cleanly.

---

## 8. Summary of what is proven vs pending

**Proven (read-only, this session):** 7 tags in use with exact counts; the two bad tags are off all contacts; tag co-occurrence patterns; overlap of 4 tags with existing fields/stages; full pipeline + custom-field inventory.

**Pending (needs token or UI):** defined-tag registry / orphan list; workflow name+status list; every trigger/action dependency. These are the gates that must clear before any rename in `tag-migration-plan.md` is executed.
