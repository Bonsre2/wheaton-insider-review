# Tag Migration Plan — Bons Realty (proposed, DO NOT EXECUTE)

**Status:** Draft for your approval. **Nothing in this plan has been run.** No tags, contacts, or workflows have been changed. Every step below is written for *you* to approve and then execute (or hand back to me with write access + the token).

**Golden rule (why this is ordered the way it is):**
> In GHL, **renaming a tag on contacts does not update workflow references to it.** If a workflow triggers on `seller-engaged` or adds/removes it, and you rename the tag on contacts first, the workflow silently breaks (trigger never fires / action targets a now-nonexistent tag). **Therefore: update the workflow reference BEFORE renaming the tag on any contact.** For every rename below, the workflow-reference step is a hard prerequisite.

**Also:** adding a tag can enroll a contact into a workflow and fire live email/SMS. Do migration on a **quiet window**, and where possible move a workflow to **draft** before touching its tags.

---

## Phase 0 — Prerequisites (must clear before ANY write)

These close the gaps that the API could not answer (see `tag-audit-findings.md` §7). **Do not start Phase 1 until all are done.**

- [ ] **P0.1 Pull the tags registry.** `GET /locations/uo1qqCnDNokVbugAPqHi/tags` (needs `$GHL_TOKEN`) or Settings → Tags. Record orphans and confirm the two bad tags are gone from settings.
- [ ] **P0.2 Pull the workflow list.** `GET /workflows/?locationId=uo1qqCnDNokVbugAPqHi` (needs `$GHL_TOKEN`) or Automation → Workflows. Record every workflow name + status.
- [ ] **P0.3 Map tag dependencies in the UI.** For each workflow, record whether any of `seller-engaged / long-term-nurture / seller-followup / sequence-paused` is (a) a **tag trigger**, (b) added/removed by an **action**, or (c) read in an **If/Else**. This produces the per-tag "referenced by" list every rename step depends on. **The API cannot provide this.**
- [ ] **P0.4 Full backup/export.** Export all contacts (with tags) to CSV so any rename is reversible. Snapshot/export each workflow you will touch.
- [ ] **P0.5 Pick a quiet window** (no active sends expected) and note who else has account access during it.

**Risk: none (all reads/exports). Rollback: n/a.**

---

## Migration steps, ranked low → high risk

Each step: **prerequisite → exact actions → rollback.**

---

### Step 1 — Delete confirmed-dead tags from settings *(LOWEST RISK)*

**Targets:** `website lead` (spaced) and `source - {{inboundwebhookrequest.source}}` — proven applied to **0 contacts** (audit §1a), pending confirmation they're still in the registry (P0.1).

- **Prerequisite:** P0.1 confirms they're in settings and P0.3 confirms **no workflow triggers on or references them**. (A merge-field tag as a trigger is implausible but check.)
- **Actions (UI):** Settings → Tags → locate each → Delete. *(No documented v2 API DELETE for tags; treat as UI-only.)*
- **Rollback:** Recreating a tag is trivial; since no contact/workflow uses them, deletion is effectively irreversible-but-harmless. If in doubt, leave them and just document them as deprecated.

---

### Step 2 — Fix the two spaced tags on the single walk-in contact *(LOW RISK)*

**Targets:** `lead - seller` → `type-seller`; `source - phone` → `source-phone`. Both exist **only** on tim vandergriff (`w1wnXHSe8bYvQDCvQesq`), who is marked *"do not enroll in any workflow yet."*

- **Prerequisite:** P0.3 confirms no workflow triggers on `lead - seller` or `source - phone`. (Expected: none — single manual contact.) Because GHL has no "rename tag" API, this is **add-new + remove-old** on one contact.
- **Why low risk:** one contact, flagged do-not-enroll. But note: **adding a tag can trigger a workflow** — so still verify P0.3 first.
- **Actions (choose ONE path):**
  - **UI:** open the contact → add `type-seller` and `source-phone` → remove `lead - seller` and `source - phone`.
  - **API (needs token + your approval):**
    - `POST /contacts/{id}/tags` body `{"tags":["type-seller","source-phone"]}`
    - `DELETE /contacts/{id}/tags` body `{"tags":["lead - seller","source - phone"]}`
    - (These are **writes** — outside this read-only audit; listed only for completeness.)
- **Rollback:** re-add `lead - seller` / `source - phone` and remove the new ones on that one contact (from the P0.4 export).

---

### Step 3 — Standardize `seller-followup` → `status-followup` *(MEDIUM RISK — 5 contacts)*

**Targets:** 5 contacts carry `seller-followup` (nicholas, ismael, harold, katie, monica).

- **Prerequisite (HARD):** From P0.3, determine if any workflow **triggers on** or **adds/removes** `seller-followup`.
  - **If YES:** first **edit the workflow** to reference `status-followup` (add the new tag to the trigger/action; keep the old one temporarily so in-flight contacts aren't dropped), **then** proceed to re-tag contacts, **then** remove the old reference. Consider setting the workflow to **draft** during the swap.
  - **If NO:** proceed directly to re-tagging.
- **Actions:** for each of the 5 contacts, add `status-followup`, then remove `seller-followup` (UI bulk action on a smart-list filtered to `seller-followup`, or per-contact API writes with your approval). **Do the workflow edit first if the tag is referenced.**
- **Rollback:** re-add `seller-followup` to the 5 contacts (from P0.4 export) and revert the workflow reference.

---

### Step 4 — Retire `sequence-paused` into the Sequence Status field *(MEDIUM–HIGH RISK)*

**Target:** `sequence-paused` (1 contact, harold lao). Duplicates **Sequence Status = "Paused"** (existing field).

- **Prerequisite (HARD):** P0.3 — **very likely a workflow reads this tag** in an If/Else to suppress sends. Confirm exactly which workflow(s) and how.
  - **If a workflow gates sends on the tag:** do **not** simply delete it. First **rewire the workflow** to gate on `Sequence Status = Paused` (or, as an interim, rename the tag to `temp-sequence-paused` and update the reference). Verify the branch behaves identically in a test.
- **Actions:**
  1. Set harold lao's **Sequence Status = Paused** (field write).
  2. Update workflow If/Else to read the field (or interim `temp-sequence-paused`).
  3. Only after the workflow reads the field, remove `sequence-paused` from the contact.
- **Rollback:** re-add `sequence-paused`, revert the workflow condition. **Higher risk because a wrong move here can un-pause a paused sequence and fire live messages** — validate in a draft/test copy first.

---

### Step 5 — Reconcile `seller-engaged` + `long-term-nurture` with stage/field *(HIGHEST RISK — 6 contacts + likely core automations)*

**Targets:** `seller-engaged` and `long-term-nurture` (6 contacts each, always paired). These overlap the **Engaged / Qualifying** and **Long-Term Nurture** pipeline stages and the **Sequence Status** field, and are **applied by the eGEN workflow `7d7151d3-…` at intake** (per your notes).

- **Prerequisite (HARD):** P0.2 + P0.3 — fully map how the eGEN workflow and any nurture workflows use these tags:
  - Does eGEN **add** both at intake? (Expected yes.)
  - Does any workflow **trigger** on either tag to start a nurture sequence?
  - Are they read in If/Else anywhere?
- **Decision to make (yours):** keep them as trigger tags (just standardize/rename), or migrate the *meaning* to stage + Sequence Status and rewire automations to trigger on stage/field changes. The audit recommends **not** removing them until every automation that reads them is rewired — this is the account's live lead engine.
- **Actions (only after the map is complete and you approve):**
  1. **Edit the eGEN workflow first** (draft it): update its Add-Tag actions and any downstream triggers to the new scheme, keeping old tags in parallel during transition.
  2. Backfill the 6 contacts' **pipeline stage** / **Sequence Status** to match.
  3. Re-tag or retire on contacts **last**.
  4. Re-publish the workflow; verify a test lead flows correctly end-to-end **before** removing the old tags.
- **Rollback:** revert the eGEN workflow from its pre-change snapshot (P0.4), re-add both tags to the 6 contacts from the export. **This step can enroll/de-enroll contacts into live nurture sequences — treat as a change-controlled release, not an inline edit.**

---

## Ordering summary (risk-ranked)

| # | Step | Contacts touched | Workflow edit needed first? | Risk |
|---|---|---|---|---|
| 1 | Delete dead tags from settings | 0 | Verify no reference | **Lowest** |
| 2 | Fix spaced tags on walk-in contact | 1 | Verify no trigger | **Low** |
| 3 | `seller-followup` → `status-followup` | 5 | If referenced, yes | **Medium** |
| 4 | `sequence-paused` → Sequence Status field | 1 | Almost certainly yes | **Medium–High** |
| 5 | `seller-engaged`/`long-term-nurture` → stage+field | 6 | Yes (eGEN + nurture) | **Highest** |

**Do Phase 0 fully, then Steps 1→5 in order.** Never rename/retire a tag on contacts before its workflow references are updated. Nothing here runs without your explicit go-ahead; several steps also require write access and the `$GHL_TOKEN` that this environment does not currently have.
