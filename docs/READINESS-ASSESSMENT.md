# Complaint Tracker: Product Readiness Assessment and Execution Plan

Version 0.1 · 21 November 2026 · Owner: Product and Technical Lead
Status: **Draft for approval. No code has been written. No Figma copy has been created.**

---

## 0. Bottom line

The written product definition is stronger than most capstone briefs: scope, routes, data model, event wording, design tokens, seed data, functional requirements and a manual test checklist are all present. The project is **not yet ready for implementation**, for three reasons:

1. **There is no Figma design to copy or implement.** The linked file contains an empty "Hi Fi" page and a set of unrelated generic templates on another page. No Complaint Tracker screens, components or variables exist.
2. **Several product decisions are unresolved or contradictory.** The most serious are the brand name, the missing "unassigned" view, filter state being lost when opening a complaint, the reference/ID counter rules, and the duplicate guard.
3. **The brief now asks for more than the PRD describes.** Production-quality frontend, loading/error states, backend-ready structure, responsive QA and an editable Figma source are not covered by the current PRD, DESIGN or PROMPTS files.

**Verdict: Conditional GO for Phase 0 and Phase 1. NO-GO for frontend implementation until the decisions in section 7 are made and the Figma source exists.**

| Area | Readiness | Why |
| --- | --- | --- |
| Vision and scope | 9/10 | Clear positioning, users, goals and non-goals. |
| Product requirements | 7/10 | Strong FR list, but edge cases and acceptance criteria are incomplete. |
| UX flows | 6/10 | Happy paths are clear; back-navigation, filter persistence, mobile order and empty/error states are not. |
| Data model | 6/10 | Good shape, but ID generation, reset, versioning and actor rules conflict. |
| Visual design specification | 7/10 | Tokens and component direction are good; states and layout details are missing. |
| Figma source of truth | 1/10 | No project design exists in the linked file. |
| Technical architecture | 7/10 | Stack and hook boundary are clear; no repository boundary, error boundary or test setup. |
| QA and release | 6/10 | Manual checklist is good; no automated tests, browser matrix or deployment config. |
| **Overall** | **6.5/10** | **Strong brief, incomplete delivery system.** |

---

## 1. What I reviewed

| File | What it gives us | Assessment |
| --- | --- | --- |
| `AGENTS.md` | Stack, folder structure, working rules, out-of-scope list | Strong. Needs updating for design-first workflow, tests and the new definition of done. |
| `docs/PRD.md` | Behaviour, data model, FR-1 to FR-16, business rules | Strong foundation. Contains contradictions and gaps listed in section 5. |
| `docs/DESIGN.md` | Direction, tokens, type scale, component specs, responsive rules | Good visual direction. Not a complete state or layout specification. |
| `docs/PROMPTS.md` | 10 build slices with "Done when" checks | Good sequencing, but code-first and light on acceptance criteria and QA. |
| `docs/TEST-CHECKLIST.md` | Manual checks and usability script | Good coverage of the happy paths. Missing resilience and edge cases. |
| `docs/PERSONAS.md` | Five personas, six themes | Useful. The persona-to-feature table is still blank. |
| `docs/seed-data.json` | 5 staff, 15 complaints, 53 events | Valid and internally consistent. Counts match the checklist (New 5, In Progress 3, Waiting 3, High priority 4). |
| `README.md` | Placeholder run/build notes | Fine for now; replaced at delivery. |
| `assets/Logo.png` | 80 x 28 "Fixly" wordmark, blue `#0F52FF` and cyan `#5BD0F4` | Usable as a wordmark, not as a favicon. Brand name conflicts with the PRD. |
| `design-references/` | 8 screenshots of Freshdesk and Kiri Desk | Useful for density and hierarchy only. Visually much busier than the calm direction in DESIGN.md. |

Environment check: Node `v26.13.0` and Git `2.56.0` are installed. There is no `package.json`, no `src/` folder, and the folder is not yet a Git repository. This is the raw starter kit.

---

## 2. Figma inspection

**File:** `https://www.figma.com/design/52VWe1F3Z6mpsGdM40JB73/Untitled?node-id=128-93`
**File key:** `52VWe1F3Z6mpsGdM40JB73`

### What is in the file

| Page | Node | Contents |
| --- | --- | --- |
| Page 1 | `0:1` | Eight unrelated template frames: Dashboard, Auth, Task list, Music, Chat, "Music – Real content", a long marketing "Home" page, plus three logo frames. |
| Hi Fi | `128:93` | **Empty.** The linked node is a 0 x 0 canvas with no children. |

The Page 1 frames are generic Figma community-style templates: an analytics dashboard with revenue charts, a sign-up screen, a task list, a music player, a chat screen and a SaaS marketing landing page. They are not Complaint Tracker screens.

### Design system status

- No Complaint Tracker components.
- No Figma variables or text styles for this product.
- The team library is subscribed but returns zero components, variables and styles.
- No comments on the file.

### Access status

Access is confirmed. The authenticated user has a Full seat on a team plan and can read the file and create a new file. The limitation is not permission; it is that **the design does not exist**.

### What this means

I cannot create an editable copy of project designs that are not there. Copying Page 1 would produce a copy of unrelated templates, not the product. Editing the original would violate your instruction to preserve it.

**Recommended path:** create a **new** Figma file named `Fixly — Complaint Tracker (Product Design)` and build the design from the PRD and DESIGN.md. The original file stays untouched.

Suggested structure:

```
00 Cover and changelog
01 Foundations: colour, type, spacing, radius, elevation, grid, icons, motion
02 Components: Button, IconButton, Field, Textarea, Select, SegmentedControl,
   Pill, StatCard, TableRow, ComplaintCard, Drawer, Toast, TimelineEvent,
   NoteCard, EmptyState, TopBar, Footer, ConfirmDialog
03 Screens: List (desktop, tablet, mobile), Drawer (default, error, duplicate,
   saving), Detail (desktop, tablet, mobile; resolved, unresolved, not found),
   Empty list, No matches, Reset confirmation, Toast
04 Flows and prototype: log, find/filter, update, add note, resolve
05 Handoff: annotations, token mapping, accessibility notes, redlines
```

**MCP limitation to note:** the Figma MCP server has no "duplicate file" tool. Creating a new file and rebuilding the design is the practical equivalent. If Figma variables are restricted on the current plan, I will use colour and text styles and keep the token names identical to `tokens.css`.

**Alternative if you have the real design:** send the correct file or node link. If the design exists in another file or in a branch, I will inspect and copy that instead.

---

## 3. What is strong

- The product has a clear, narrow positioning: complaint tracking without full helpdesk complexity.
- Goals and non-goals are explicit. The scope is defensible.
- Routes are simple and refresh-safe (`#/`, `#/complaint/<id>`).
- The data model is small and readable. Derived counts are required to be computed, not stored.
- Event wording is specified exactly, which prevents inconsistent copy.
- The visual direction is coherent: warm neutral surfaces, one accent, thin borders, almost no shadows.
- Tokens are already defined in a copy-pasteable block.
- Seed data is realistic, internally consistent and includes full timelines.
- The manual test checklist is concrete and covers the main journeys.
- The slice plan is well sequenced for incremental delivery.
- Accessibility is treated as a requirement, not an afterthought.

---

## 4. Gap register

Severity key: **P0** blocks design or build; **P1** should be resolved before design freeze; **P2** can be handled during polish.

### P0: blockers

| ID | Finding | Evidence | Recommendation |
| --- | --- | --- | --- |
| P0-01 | No Figma source design exists. The linked node is an empty page. | `128:93` returns a 0 x 0 canvas; Page 1 contains unrelated templates. | Create a new file from the PRD. Keep the original untouched. |
| P0-02 | Brand conflict: the logo says "Fixly"; the PRD and microcopy say "Complaint Tracker". Logo blue `#0F52FF` also differs from accent `#3B5BDB`. | `assets/Logo.png`; PRD 5.1; DESIGN tokens. | Decide the product name and whether to align tokens to the logo. |
| P0-03 | Reference and ID generation rules conflict. The store has one `counter`, but complaints and events also need IDs. Reset restores `counter: 15`, which can reuse references after a user has created CMP-0016. | PRD 7 (reference, IDs), PRD 8 (`Store`), PRD FR-14. | Define ID derivation and decide whether reset preserves the highest reference counter. |
| P0-04 | Duplicate guard is underspecified: normalisation, warning placement, what "Cancel" does, whether editing clears the warning, and how "Log anyway" behaves on repeat submits. | PRD 5.3, FR-3. | Write Given/When/Then acceptance criteria before design. |
| P0-05 | The brief asks for loading, success and error states and backend-ready structure; the PRD defines only a toast and a not-found state. | PRD 9; new brief section 4. | Define "no loading state for synchronous localStorage", add an error boundary and a persistent storage-failure state, and define a repository boundary. |
| P0-06 | The list row is both a click target and a container for two inline selects. This is an accessibility anti-pattern: nested interactive controls inside a focusable row. | PRD 5.2.3, FR-16, NFR accessibility. | Make the reference or subject the real link/button. Keep row click as a convenience only. Define keyboard behaviour for selects. |
| P0-07 | Filters are lost when opening a complaint and returning. The list unmounts, and filter state is component-only. | PRD 5.2.4 ("Filter state is kept in component state only"). | Persist filters in the URL hash query (`#/?status=New&priority=High&q=...`) or lift them to App. URL is recommended. |
| P0-08 | The manager goal is to see what is "open, urgent and unowned", but there is no unassigned filter or view. | PRD 3 (manager), 5.2.1 (four cards), 5.2.4 (filters). | Add an "Assigned to" filter with `All`, `Unassigned` and each staff member. This is the cheapest way to close the gap. |

### P1: resolve before design freeze

| ID | Finding | Recommendation |
| --- | --- | --- |
| P1-01 | Category is read-only after creation, so a miscategorised complaint cannot be corrected. | Make Category editable on detail and add a `category` event, or explicitly accept the limitation. |
| P1-02 | The list shows an "Updated" column but sorts by `createdAt`; "Newest first" is ambiguous. | Keep `createdAt` for v1 but label the toggle "Newest created / Oldest created", or switch to `updatedAt` and label it "Recently updated". |
| P1-03 | "Active" and "All active" are used for the same status filter option. | Standardise on "All active" everywhere. |
| P1-04 | PRD says every event actor is s1; seed events use s2 to s5. | Treat seed events as historical actors and attribute new events to s1. Update the PRD wording. |
| P1-05 | Events store display text only, which makes backend migration and wording changes harder. | Keep `text` for the prototype but add optional `from`, `to` and `meta` fields to the event schema. |
| P1-06 | Relative time has no refresh cadence, timezone rule or tie-breaker for equal timestamps. | Define a 60-second tick, `Intl` formatting, and stable ordering by `createdAt` then `id` descending. |
| P1-07 | Keyboard shortcuts are underspecified for modifiers, open drawers, selects and contenteditable fields. | Define: ignore when `ctrl/meta/alt` is pressed, when the drawer is open, or when focus is in an input, textarea or select. `Esc` only closes the drawer. |
| P1-08 | The responsive strategy is incomplete: tablet stat strip, toolbar and detail widths are not defined; two-column detail at 640px will be cramped. | Use a single column below 900px for detail; define tablet stat and toolbar layouts; keep the table on tablet with Category hidden. |
| P1-09 | Toast behaviour with rapid changes is undefined. | One toast at a time; replace content and reset the 3-second timer; pause on hover/focus; `aria-live="polite"`. |
| P1-10 | Reset confirmation is unspecified (native or custom) and post-reset navigation is undefined. | Use a custom confirm dialog for visual consistency; navigate home and clear filters after reset. |
| P1-11 | Storage failure, corrupt data and schema-version mismatch are only partly defined. | Add a persistent banner for write failures, a toast for corrupt/older data, and a documented reset-on-version-mismatch rule. |
| P1-12 | Validation details are missing: regexes, trimming, Unicode counting, error clearing, character counter format. | Specify exact rules in the PRD and implement them as pure functions with tests. |
| P1-13 | Reference formatting beyond 9999 is undefined. | Define `CMP-10000` behaviour and whether padding is dropped. |
| P1-14 | Search normalisation is undefined (diacritics, multiple spaces, reference without prefix). | Define trim + lowercase + collapse spaces; match reference, subject and customer name only. |
| P1-15 | Mobile detail puts the side panel first, before the description. | Challenge: users open detail to read the complaint. Put a compact status card under the header, then description and timeline. |
| P1-16 | No pagination or virtualisation; unlimited complaints can degrade the list. | Document a small-team assumption (under 500 complaints) or add a simple cap. |
| P1-17 | The primary persona wants an order or account reference, and a source (WhatsApp, phone, walk-in); neither exists. | Decide: add optional fields in v1, or document as a known limitation. |
| P1-18 | The primary persona wants "last action" in the list; the list shows only an updated timestamp. | Add a subtle last-action line or tooltip, or defer to v1.1. |

### P2: polish and operations

| ID | Finding | Recommendation |
| --- | --- | --- |
| P2-01 | No favicon, meta description, OG tags or per-route page titles. | Add at delivery. |
| P2-02 | No automated tests, lint/format configuration or CI. | Add Vitest and React Testing Library for lib and hook tests; keep ESLint from Vite; add a CI check if the repo is on GitHub. |
| P2-03 | No browser test matrix. | Test current Chrome, Edge, Firefox and Safari; document results. |
| P2-04 | No `netlify.toml`, cache headers or Node version pin. | Add at delivery. |
| P2-05 | Design tokens exist in CSS but not in a shared source or Figma. | Keep `tokens.css` as the code source of truth and mirror it in Figma. |
| P2-06 | Usability kit lacks a moderator script, consent note and observation template. | Add to the test kit. |
| P2-07 | No defined case-study deliverables. | Agree the final artefacts: live link, 4 screenshots, usability table, next steps. |
| P2-08 | Seed dates age; after a few weeks all relative times become dates. | Accept for a portfolio demo, or add a demo clock offset. |
| P2-09 | Logo is a wordmark, not a square icon; no favicon. | Crop or generate a square mark for the favicon; keep the wordmark for the top bar. |
| P2-10 | Some token pairs may fail 4.5:1 contrast, especially `--text-faint`; 36px buttons are below the 44px mobile touch target. | Audit contrast and increase mobile touch targets. |
| P2-11 | No body scroll lock, scroll restoration or route-change scroll reset. | Add at polish. |
| P2-12 | Singular/plural microcopy is undefined ("1 complaints"). | Add a pluralisation helper. |
| P2-13 | Note composer has a 500-character limit but no counter. | Add a counter or show it near the limit. |
| P2-14 | Timeline icon mapping is not specified per event type. | Define the mapping in DESIGN.md. |
| P2-15 | Category is not used for filtering or the dashboard; it adds a required field without a clear job. | Keep it as context, or remove it to simplify the drawer. Decide explicitly. |
| P2-16 | No resolution note prompt when moving to Resolved. | Optional: add a non-blocking prompt. |

---

## 5. Assumptions to validate

| ID | Assumption | Risk if wrong | How to validate |
| --- | --- | --- | --- |
| A1 | One user, one browser, no multi-tab sync. | Confusing last-write-wins behaviour. | Confirm with the product owner. |
| A2 | Seed data is final and fictional. | Rework of data and tests. | Confirm names and scenarios are acceptable. |
| A3 | English only, Nigerian business context. | Copy and date formatting changes. | Confirm. |
| A4 | No real customer data is used. | Privacy and consent issues. | Confirm and document. |
| A5 | Netlify static deploy. | Deployment rework. | Confirm. |
| A6 | Future backend is a REST/JSON API, not Firebase or Supabase. | Repository contract changes. | Confirm before Phase 3. |
| A7 | Small data volume, under 500 complaints. | List performance. | Confirm or add pagination. |
| A8 | Current Chrome, Edge, Firefox and Safari. | Polyfills or layout fixes. | Confirm and test. |
| A9 | This is a portfolio prototype, not production. | Over-engineering or under-testing. | Confirm the quality bar. |
| A10 | The eight screenshots are inspiration only, not visual targets. | Design drift toward a busy helpdesk UI. | Confirm. |
| A11 | The Fixly logo is the intended brand mark. | Renaming and rework. | Confirm. |
| A12 | No dark mode. | Scope creep. | Confirm (already in non-goals). |
| A13 | No delete or archive. | Missing user need. | Confirm. |
| A14 | Filters should survive opening a complaint and coming back. | Annoying workflow; P0-07. | Confirm URL persistence. |
| A15 | Category earns its place in the form and table. | Extra friction for no benefit. | Confirm or remove. |
| A16 | Seed events are historical; new events are s1. | Timeline actor inconsistency. | Confirm. |

---

## 6. Decisions required before build

### Decide now (block design or architecture)

| ID | Question | Recommendation | Why |
| --- | --- | --- | --- |
| D1 | Is the product called "Complaint Tracker" or "Fixly"? | Use **Fixly** as the brand in the top bar and **Complaint Tracker** as the descriptor in the page title and README. Update microcopy accordingly. | Uses the supplied logo and gives the portfolio a distinct identity. If the logo is a placeholder, use "Complaint Tracker" and replace it. |
| D2 | Do we create a new Figma file? | **Yes.** Create `Fixly — Complaint Tracker (Product Design)` and leave the original untouched. | The linked file has no project design to copy. |
| D3 | Where should the Figma file live? | Team project or Drafts; default to Drafts unless you name a project. | Avoids creating clutter in the wrong place. |
| D4 | Add an "Assigned to" filter? | **Yes:** All, Unassigned, each staff member. | Closes the manager's "unowned" gap. |
| D5 | Preserve filters in the URL? | **Yes:** `#/?q=&status=&priority=&assignee=&sort=`. | Back button, refresh and deep links keep context. |
| D6 | Mobile detail order? | Status card under the header, then description, customer, timeline. | Users open detail to read the complaint. |
| D7 | Make Category editable? | **Yes**, with a `category` event. | Prevents a dead end; low cost. |
| D8 | Sort by created or updated? | Keep `createdAt` for v1; label the toggle "Newest created / Oldest created". Add "Recently updated" later. | Matches the PRD and removes ambiguity. |
| D9 | Align tokens to the logo? | Use `#0F52FF` as primary and `#5BD0F4` as a mark-only secondary; re-check contrast. | The current `#3B5BDB` is close but visibly different from the logo. |
| D10 | Add Vitest and React Testing Library? | **Yes**, as dev dependencies only. | Pure selectors and the hook are worth testing; manual checks alone are not enough. |

### Decide during Phase 1 (not blocking design)

| ID | Question | Recommendation |
| --- | --- | --- |
| D11 | Reset and reference reuse | Preserve the highest reference counter across reset, or document reset as a demo exception. Recommended: preserve the counter. |
| D12 | ID generation | Derive next IDs from the maximum numeric suffix at load; keep `counter` for references. No schema change. |
| D13 | Actor model | Seed events keep historical actors; new events use s1. Update the PRD. |
| D14 | Backend boundary | Add `lib/repository.js` with sync methods; document the async migration path. Do not add async UI states now. |
| D15 | Loading states | No spinner for synchronous data. Add an error boundary and a persistent storage-failure banner. |
| D16 | Reset confirmation | Custom dialog for visual consistency; native `confirm` only as a fallback. |
| D17 | Order/source fields | Add optional `orderReference` and `source` in v1.1, or document as limitations. Recommended: defer. |
| D18 | Category value | Keep as context, or remove to simplify. Recommended: keep, but do not add a filter yet. |

---

## 7. Documentation changes recommended

### PRD v1.2

- Fix the "Active" / "All active" inconsistency.
- Add the "Assigned to" filter and its interaction with the stat cards.
- Add URL-persisted filter state and deep-link behaviour.
- Resolve the actor rule (seed historical vs new s1).
- Resolve the reference counter and reset rule.
- Define ID generation.
- Make Category editable, or state explicitly that it is immutable.
- Expand the duplicate guard into Given/When/Then acceptance criteria.
- Define validation regexes, trimming, Unicode counting and error-clearing behaviour.
- Define loading, storage-failure, corrupt-data, version-mismatch and error-boundary states.
- Define mobile detail order and tablet layout.
- Define toast replacement, reset confirmation and post-reset navigation.
- Add "Definition of Done" per slice, not only per project.
- Add a decision log update.

### DESIGN.md v1.1

- Add a state matrix for every component: default, hover, focus, active, disabled, error, loading, empty.
- Specify table row height, borders, hover, selected state and inline select styling.
- Specify the mobile complaint card.
- Specify drawer states: default, validation errors, duplicate warning, saving, scrolled body.
- Specify timeline event icon mapping and note card.
- Specify toast, confirm dialog, not-found and empty states.
- Specify tablet stat strip and toolbar layouts.
- Specify detail breakpoints; recommend single column below 900px.
- Add contrast and touch-target checks.
- Add the Figma file link and token mapping.

### PROMPTS.md v2

- Add a design phase before Prompt 0.
- Add a "read the decision log and acceptance criteria" step to every slice.
- Add test steps and commit gates.
- Add an explicit "do not add features" check.
- Replace the temporary debug view with a small test harness or Storybook-free component demo.
- Add the error boundary, repository boundary and test setup to the setup slice.

### TEST-CHECKLIST.md v1.1

- Add corrupt storage, quota failure, version mismatch and blocked storage.
- Add duplicate guard: warning, Cancel, Log anyway, repeat submit.
- Add same-value changes (no event).
- Add equal-timestamp event ordering.
- Add reference overflow beyond 9999.
- Add long text, Unicode and whitespace-only inputs.
- Add filter persistence across detail navigation and refresh.
- Add reset while on a detail page.
- Add keyboard shortcuts with modifiers and inside selects.
- Add console-error and network-tab checks.
- Add mobile drawer focus and scroll lock.
- Add contrast and 200% zoom checks.

### New documents

- `docs/TECH-SPEC.md`: architecture, repository contract, ID/reference rules, error model, storage versioning.
- `docs/ACCEPTANCE-CRITERIA.md`: Given/When/Then for FR-1 to FR-16 plus edge cases.
- `docs/DECISIONS.md`: decision log with owner, date, status and consequence.
- `docs/RISK-REGISTER.md`: risks, likelihood, impact, mitigation and owner.
- `docs/QA-PLAN.md`: test levels, browser matrix, accessibility and performance checks.
- `docs/DELIVERY.md`: deploy, smoke test, usability kit and case-study artefacts.

---

## 8. Execution roadmap

### Recommended path: design-first, 4 to 5 weeks full-time

| Phase | Duration | Work | Exit gate |
| --- | --- | --- | --- |
| 0. Decisions and sign-off | 1 day | Answer D1 to D10; confirm scope and brand. | Signed decision log. |
| 1. Requirements hardening | 2 days | PRD v1.2, TECH-SPEC, acceptance criteria, risk register, persona-to-feature table. | No open P0 or P1; requirements frozen. |
| 2. Figma design | 4 days | Foundations, components, screens, states, prototype, design review. | Design approved; tokens match code. |
| 3. Frontend foundation | 1.5 days | Vite scaffold, structure, tokens, router, repository, error boundary, toast, test setup. | Build passes; shell renders. |
| 4. Vertical slices | 7 days | Data layer, list, drawer, detail, timeline, dashboard, polish. | All FRs pass; each slice committed and demoed. |
| 5. QA and hardening | 2 days | Automated tests, manual checklist, accessibility, responsive, resilience, cross-browser. | Zero P0/P1 defects; QA sign-off. |
| 6. Delivery | 1.5 days | README, screenshots, Netlify config, deploy, live smoke test. | Live link works on desktop and phone. |
| 7. Usability and write-up | 3 to 5 days elapsed | Three testers, results table, blocking fixes, case study. | Usability targets met or documented. |

### Lean path: 2 weeks, if the deadline is fixed

- Days 1 to 2: decisions and PRD fixes.
- Days 3 to 5: Figma for six key screens only (list, drawer, detail, mobile list, mobile detail, empty state), with a small component set.
- Days 6 to 11: build slices 1 to 7.
- Days 12 to 13: manual QA only.
- Day 14: deploy and README.

**Trade-off:** the lean path skips the full design system, automated tests, the repository boundary and advanced error states. It is a visual prototype with good happy paths, not the production-quality frontend described in the new brief.

**Recommendation:** take the recommended path unless the deadline is immovable. The Figma source and the acceptance criteria are the two things that prevent expensive rework later.

---

## 9. Backlog and slice plan

### MoSCoW

**Must**
- Create, validate and persist a complaint.
- List with search, status, priority, assignee filter and sort.
- Inline status and assignee changes.
- Detail with instant edits.
- Timeline with system events and internal notes.
- Dashboard counts and card filters.
- localStorage persistence and reset.
- Responsive layout at 375, 768 and 1280.
- Keyboard access and visible focus.
- Error boundary and storage-failure handling.

**Should**
- Empty states, toasts, duplicate guard, not-found.
- URL-persisted filters.
- Category editing.
- Last-action context in the list.
- Automated tests for lib and hook.
- Reduced-motion support.

**Could**
- Order/account reference field.
- Source field.
- Resolution note prompt.
- "Recently updated" sort.
- Custom reset dialog (if not already).
- Demo clock for seed dates.

**Won't (v1)**
- Login, roles, backend, real-time, email/WhatsApp intake, SLA timers, automation, AI, customer portal, CSAT, exports, dark mode, settings, multi-language, delete/archive, pagination.

### Slice order

| Slice | Deliverable | Acceptance focus |
| --- | --- | --- |
| 0 | Setup and shell | Build passes; tokens load; fonts load; empty shell. |
| 1 | Data layer and repository | 15 complaints; status change persists; reset works; events correct; unit tests for selectors and format. |
| 2 | List and filters | Search, status, priority, assignee, sort combine; URL persistence; empty states; inline edits. |
| 3 | New complaint drawer | Validation, focus, character count, duplicate guard, toast, one complaint per submit. |
| 4 | Detail screen | Instant edits, resolved date, not-found, responsive order, toast. |
| 5 | Timeline and notes | Newest first, exact event wording, note styling, composer limits, focus. |
| 6 | Dashboard | Counts derived, card filters, active states, immediate updates. |
| 7 | Polish and QA | Keyboard, accessibility, responsive, reduced motion, error states, console clean. |

**Definition of Done for every slice:** acceptance criteria pass; `npm run build` passes; no console errors; keyboard path works; 375/768/1280 checked; tests added or updated; commit made; demo recorded.

---

## 10. QA plan

| Level | What | Tooling |
| --- | --- | --- |
| Unit | `format.js`, `validate.js`, selectors, repository, ID/reference generation | Vitest |
| Hook | `useComplaints` create/update/note/reset/persistence | Vitest + React Testing Library |
| Component | Drawer validation, duplicate guard, inline selects, stat cards, timeline | React Testing Library |
| Manual | Expanded `TEST-CHECKLIST.md` | Browser |
| Accessibility | Keyboard-only, focus order, labels, `aria-live`, contrast, 200% zoom | Manual + axe |
| Responsive | 375, 768, 1024, 1280; no horizontal scroll | Browser dev tools |
| Resilience | Corrupt JSON, blocked storage, quota, version mismatch, rapid clicks | Manual + mocks |
| Cross-browser | Chrome, Edge, Firefox, Safari | Manual |
| Performance | Lighthouse, bundle size, no console errors | Lighthouse |
| Deploy | Live link, refresh, reset, deep link, mobile | Netlify + phone |

### Acceptance criteria examples

**AC-01 Create a valid complaint**
Given the drawer is open and all required fields are valid,
when I submit,
then exactly one complaint is created with status New, the next reference, `createdAt = updatedAt = now`, and a `created` event;
the drawer closes; a toast shows the real reference; the complaint is at the top of the list.

**AC-02 Duplicate guard**
Given a complaint with the same normalised customer name and subject was created less than 60 seconds ago,
when I submit,
then no complaint is created and the warning appears;
"Log anyway" creates exactly one complaint and dismisses the warning;
"Cancel" dismisses the warning and keeps the form values;
editing the name or subject clears the warning.

**AC-03 Inline status change**
Given a row with status New,
when I choose In Progress,
then the record updates, `updatedAt` becomes now, a `status` event with the exact wording is added, a toast appears, the dashboard counts update, and the change survives refresh;
choosing the current value adds no event.

**AC-04 Resolve and reopen**
Given a complaint is not resolved,
when I set status to Resolved,
then `resolvedAt` is set and the detail shows the resolved date;
when I move it out of Resolved,
then `resolvedAt` is null and the resolved date disappears.

**AC-05 Filters combine and persist**
Given search, status, priority and assignee are set,
when I open a complaint and return,
then the same filters are still applied and the result count matches;
refresh keeps them; "Clear filters" resets them.

**AC-06 High priority card**
Given the High priority card is clicked,
then priority = High and status = All active;
the count matches the filtered list; clicking the active card clears both;
a resolved High priority complaint is excluded from both.

**AC-07 Note composer**
Given the note field contains only spaces,
then "Add note" is disabled;
given valid text,
when I submit with the button or Ctrl/Cmd + Enter,
then one note is added to this complaint only, the field clears and keeps focus, and the note appears at the top of the timeline.

**AC-08 Reset**
Given I confirm reset,
then the 15 seed complaints, 5 staff and seed events are restored;
I am taken home; filters are cleared; the reference counter does not reuse a number (or the documented demo exception applies).

**AC-09 Keyboard**
Given focus is outside a field,
then `/` focuses search, `N` opens the drawer, `Esc` closes it, focus returns to "New complaint", and shortcuts do nothing while typing or when modifiers are held.

**AC-10 Corrupt storage**
Given the stored JSON is invalid,
when the app loads,
then the seed data is restored, a toast explains why, and the app remains usable.

---

## 11. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Figma rebuild takes longer than planned | High | Medium | Component-first, timebox foundations, reuse tokens, design six key screens first. |
| Brand decision is delayed | High | High | Decide D1 and D9 before Phase 2. |
| Figma variables unavailable on the plan | Medium | Low | Use colour and text styles; keep token names identical to CSS. |
| Row-with-selects accessibility pattern fails | High | Medium | Make the reference/subject the real link; keep row click as an enhancement. |
| Filter persistence adds routing complexity | Medium | Medium | Use a small `useHashRoute` query parser; test back/forward and refresh. |
| localStorage limits or corruption | Medium | Low | Repository boundary, try/catch, reset, persistent banner. |
| Schedule slips | High | High | Slice-based delivery; cut Could items, not QA. |
| Requirement drift during build | Medium | High | Decision log and change control; no unapproved features. |
| Seed dates age | High | Low | Accept for the demo, or add a demo clock. |
| Fonts fail to load | Low | Low | System font fallback stack. |
| Usability testers are hard to recruit | Medium | Medium | Schedule three testers in Phase 3. |

---

## 12. Status board

**Completed and verified**
- Read `AGENTS.md`, `PRD.md`, `DESIGN.md`, `PROMPTS.md`, `TEST-CHECKLIST.md`, `PERSONAS.md`, `README.md` and `seed-data.json`.
- Validated the seed data counts and timeline structure.
- Inspected the linked Figma file, its pages, frames, components and variables.
- Inspected the logo and the eight design references.
- Confirmed Node and Git are installed.
- Produced this assessment.

**Blocked**
- Figma copy: no project design exists. Needs D2 and D3.
- Brand: needs D1 and D9.
- IA changes: need D4, D5, D6, D7 and D8.

**Not started (correctly)**
- Figma build.
- Frontend code.
- Automated tests.
- Deployment.

---

## 13. What I need from you now

Please answer these ten decisions. A short reply per item is enough.

1. **Brand:** "Fixly" (logo brand) or "Complaint Tracker" (PRD name)? My recommendation: Fixly as the brand, Complaint Tracker as the descriptor.
2. **Figma:** approve creating a new editable file from the PRD, leaving the original untouched? My recommendation: yes.
3. **Figma destination:** Drafts, or a named team project?
4. **Unassigned view:** add an "Assigned to" filter with Unassigned? My recommendation: yes.
5. **Filter persistence:** put filters in the URL so back/refresh keep them? My recommendation: yes.
6. **Mobile detail order:** status card first, then description, or keep the side panel first? My recommendation: status card under the header, then description.
7. **Category:** editable with an event, or read-only? My recommendation: editable.
8. **Sort:** "Newest created / Oldest created" by `createdAt`, or switch to `updatedAt`? My recommendation: keep created for v1.
9. **Brand colour:** align tokens to the logo blue `#0F52FF`, or keep `#3B5BDB`? My recommendation: align.
10. **Testing:** approve Vitest and React Testing Library as dev dependencies? My recommendation: yes.

After your answers, I will produce, in order:

1. `docs/DECISIONS.md` with the signed decisions.
2. `docs/PRD.md` v1.2 and `docs/ACCEPTANCE-CRITERIA.md`.
3. `docs/TECH-SPEC.md` and `docs/RISK-REGISTER.md`.
4. The new Figma file, foundations, components and screens.
5. The frontend, slice by slice, with tests and demos.

I will not write code or create the Figma file until you approve.
