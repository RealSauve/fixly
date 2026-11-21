# PRD: Fixly (Complaint Tracker MVP, build specification)

Version 1.1 · 20 November 2026 · Owner: Owoidoho Ukoh · Builder: OpenCode (AI-assisted)

This document is written for the builder. It states exactly what to build, how each screen behaves, the rules for the data, and when a feature counts as done.

---

## 1. Overview

Fixly is a lightweight B2B complaint tracker for small and medium-sized businesses. A support team uses it to **log** customer complaints, **assign** an owner, **track** status and priority, and keep **internal notes**, all from one place. A manager can see at a glance what still needs attention.

**Positioning:** essential complaint tracking without the complexity of a full helpdesk (Freshdesk, Zoho Desk). The reference product is Freshdesk, used for patterns only, not copied.

**Prototype constraints:** runs only in the browser, data in localStorage, one user, sample staff, no login.

## 2. Goals and non-goals

**Goals**
1. Every complaint is recorded in one place with a unique reference.
2. Every complaint has a visible status, priority and owner.
3. A support rep can log a complaint in under 30 seconds.
4. A manager can see what is new, in progress, waiting and high priority in one glance.
5. The app is so simple that a first-time user completes the core tasks without help.

**Non-goals (do not build)**
Login, roles, backend, email/WhatsApp/social intake, SLA timers, escalation, automation, AI, customer portal, CSAT surveys, exports, real-time collaboration, dark mode, settings, multi-language.

## 3. Users and jobs to be done

| User | Needs to | Notes |
| --- | --- | --- |
| Support representative (primary) | Log a complaint fast, find a complaint, update status, add a note | Works in the list and detail view all day |
| Business manager (secondary) | See what is open, urgent and unowned; reassign work | Uses the dashboard strip and filters |

In the prototype both roles use the same screens. The "current user" is always the first staff member in the sample data (Adaeze Obi), shown as the actor on events.

## 4. Scope

**Must have:** dashboard strip, complaint list with search/filters/sort, new complaint drawer, detail view, inline status/priority/assignee, unified timeline with internal notes, localStorage persistence, sample data with reset.

**Should have:** empty states, toasts, responsive layout, keyboard shortcuts, accessible labels.

**Later (not now):** Open and Closed statuses, Urgent priority, export, backend, authentication.

## 5. Screens and behaviour

The app has **two screens and one drawer**. Routes use the URL hash so refresh and deep links work.

| Route | Screen |
| --- | --- |
| `#/` | Complaints (home) |
| `#/complaint/<id>` | Complaint detail |
| (overlay) | New complaint drawer, opened from the home screen |

An unknown route or unknown complaint id shows a short "Complaint not found" message with a link back to the list.

### 5.1 Global layout
- **Top bar** (all screens): product name "Fixly" on the left (links to `#/`), "New complaint" primary button on the right (home screen only; on the detail screen the button is hidden).
- **Footer** (small, muted): "Prototype. Data is saved in this browser only." and a "Reset demo data" text button.
- Page content is centred, max width 1120px, 24px side padding (16px on mobile).

### 5.2 Complaints screen (home)

From top to bottom:

1. **Stat strip:** four cards in one row (2 x 2 on mobile).

   | Card | Counts complaints where |
   | --- | --- |
   | New | status = New |
   | In Progress | status = In Progress |
   | Waiting on Customer | status = Waiting on Customer |
   | High priority | priority = High AND status is not Resolved |

   Each card shows the number large and the label small. Clicking a card applies that filter to the list (status filters for the first three; priority = High plus "hide resolved" for the fourth, see 5.2.3). Clicking the active card again clears it. Counts are always derived from the data.

2. **Toolbar:** search box (placeholder "Search by reference, subject or customer"), Status select, Priority select, Sort toggle ("Newest first" / "Oldest first"). A "Clear filters" text button appears only when any filter or search is active.

3. **List.**
   - **Desktop table columns:** Reference (mono), Subject (with customer name in muted text underneath), Category, Priority (pill), Status (inline select styled as a pill), Assigned to (inline select), Updated (relative, e.g. "2h ago", full date on hover).
   - **Mobile (below 640px):** each complaint is a card showing reference, subject, customer, priority pill, status pill, assignee name and updated time. Inline selects are not shown on mobile; the user opens the detail view to change them.
   - Clicking anywhere on a row (except the inline selects) opens the detail screen. Rows are focusable and open on Enter.
   - Inline status and assignee changes follow exactly the same rules as on the detail screen (events, updatedAt, toast).
   - **Result count** above the list: "12 complaints".

4. **Filtering rules**
   - Search is case-insensitive and matches reference, subject or customer name (substring).
   - Status filter: All, New, In Progress, Waiting on Customer, Resolved. Priority filter: All, High, Medium, Low.
   - Search, status and priority combine with AND.
   - The "High priority" card sets priority = High and status filter = "Active" (all statuses except Resolved). "Active" appears as an extra option in the status select ("All active") so the state is visible and clearable.
   - Sort is by `createdAt`. Default: newest first.
   - Filter state is kept in component state only (not persisted).

5. **Empty states**
   - No complaints at all: "No complaints yet. Log your first one." with a primary button.
   - No matches: "No complaints match your filters." with a "Clear filters" button.

### 5.3 New complaint drawer
Opens from the right on desktop (width 440px) and full-screen on mobile. Focus moves to the first field; `Esc` or the close button closes it. Closing with unsaved text asks nothing (keep it simple); the form resets on close.

Fields, in order:

| Field | Type | Rules |
| --- | --- | --- |
| Customer name | text | Required, 2 to 80 characters |
| Email | email | Optional, but at least one of Email or Phone is required. Basic format check |
| Phone | tel | Optional. Digits, spaces, `+`, `-`, parentheses; at least 7 digits |
| Subject | text | Required, 3 to 100 characters |
| Description | textarea (4 rows) | Required, 10 to 1000 characters; show character count |
| Category | select | Required. Options: Delivery, Billing & Refunds, Product Quality, Service Outage, Account Access, Other |
| Priority | segmented control | Low / Medium / High. Default Medium |
| Assigned to | select | Optional. Default "Unassigned" |

Behaviour:
- Validate on submit; after the first submit attempt also validate on blur. Show the error text under the field in red, linked with `aria-describedby`. On failure, focus the first invalid field.
- A top-level message appears if both contact fields are empty: "Add an email or a phone number."
- **Duplicate guard:** while saving, the Save button is disabled. If a complaint with the same customer name (case-insensitive) and the same subject was created in the last 60 seconds, show an inline warning "This looks like a complaint you just logged." with two buttons: "Log anyway" and "Cancel".
- On success: create the complaint with status New, generate the reference, add a `created` event, close the drawer, show toast "Complaint CMP-0016 logged", and keep the user on the list (the new complaint is at the top).
- Buttons: "Log complaint" (primary), "Cancel" (text).

### 5.4 Complaint detail screen

Layout on desktop: two columns (main 2/3, side panel 1/3). On mobile: single column, side panel first.

**Header:** "Back to complaints" link, reference (mono, muted), subject (large), created date.

**Main column**
1. **Description** card: the description text, preserving line breaks.
2. **Customer** card: name, email (mailto link), phone (tel link). Show "Not provided" in muted text for an empty contact field.
3. **Timeline** (see 5.5).

**Side panel (all edit on change, no Save button)**
- Status: select with 4 options.
- Priority: select with 3 options.
- Assigned to: select with "Unassigned" plus all staff.
- Category (read only), Created, Last updated, Resolved (only when resolved).

Each change shows a toast: "Status updated", "Priority updated", "Assigned to Tunde Bakare" or "Unassigned".

### 5.5 Timeline and internal notes
One chronological feed, **newest first**, with a note composer on top.

- **Composer:** textarea (placeholder "Add an internal note. Customers never see this."), button "Add note" disabled until the text has at least one non-space character. Max 500 characters. `Ctrl/Cmd + Enter` submits. On submit the note is added, the field clears and stays focused.
- **System events** are one-line items with a small icon, the text, the actor name and a relative time, in muted text.
- **Notes** are visually different: a tinted card with a lock icon and the label "Internal note", the note text (line breaks kept), the author and time. They must be clearly distinct from system events.
- Event wording (exact):

  | Type | Text |
  | --- | --- |
  | created | "Complaint logged" |
  | status | "Status changed from {old} to {new}" |
  | priority | "Priority changed from {old} to {new}" |
  | assignee (from none) | "Assigned to {name}" |
  | assignee (change) | "Reassigned from {old} to {new}" |
  | assignee (to none) | "Unassigned (was {old})" |
  | note | the note text |

- Setting a field to its current value creates no event.

## 6. Functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| FR-1 | Create a complaint | Valid submit adds a complaint with status New, a unique reference, createdAt = updatedAt = now, and a `created` event. It appears at the top of the list |
| FR-2 | Validation | Rules in 5.3 enforced; errors are specific and shown next to the field |
| FR-3 | Duplicate guard | Rapid double submit creates one complaint. Same name + subject within 60s shows the warning |
| FR-4 | List | Shows all complaints with the columns in 5.2; count updates with filters |
| FR-5 | Search and filters | Search, status and priority work alone and together; empty state shows when nothing matches |
| FR-6 | Sort | Toggle flips order by createdAt |
| FR-7 | Status change | Updates record, sets updatedAt, adds a `status` event, updates the dashboard immediately |
| FR-8 | Priority change | Same as FR-7 with a `priority` event |
| FR-9 | Assignment | Select any staff member or Unassigned; adds an `assignee` event |
| FR-10 | Internal notes | Only non-empty notes accepted; shown with author and time; visually distinct |
| FR-11 | Timeline | All events and notes on one complaint appear in time order, newest first |
| FR-12 | Dashboard | Four cards derived from data; clicking applies the matching filter |
| FR-13 | Persistence | After a browser refresh, all data is intact |
| FR-14 | Reset | "Reset demo data" asks for confirmation, then restores the seed data |
| FR-15 | Responsive | Usable at 375px, 768px and 1280px widths with no horizontal scroll |
| FR-16 | Keyboard | `/` focuses search, `N` opens the New complaint drawer, `Esc` closes it. Shortcuts are ignored while typing in a field |

## 7. Business rules

- **Statuses:** New, In Progress, Waiting on Customer, Resolved. Any status can change to any other (no forced order).
- **Priorities:** Low, Medium, High.
- **resolvedAt:** set to now when status becomes Resolved; cleared to null if the complaint is moved out of Resolved.
- **updatedAt:** set to now on any status, priority, assignee change or new note.
- **Reference:** `CMP-` plus a 4-digit number. The number is `counter + 1`, where `counter` is stored in the data and only ever increases. Never reuse a number.
- **IDs:** complaints `c-<number>`, events `e-<number>`, staff `s1`..`s5`. Use a simple incrementing counter, not random UUIDs, to keep the data readable.
- **Actor:** every event is attributed to the current user (staff `s1`).
- **Time:** store ISO 8601 strings. Show relative time ("just now", "5m ago", "2h ago", "3d ago", then a date like "12 Nov") with the full date and time as a tooltip.
- **Names and text** are trimmed before saving. Render all text as plain text (React escapes by default; never use `dangerouslySetInnerHTML`).

## 8. Data model

```
Staff       { id, name, role }
Complaint   { id, reference, customerName, customerEmail, customerPhone,
              subject, description, category, priority, status,
              assigneeId (null or staff id), createdAt, updatedAt, resolvedAt (null or ISO) }
Event       { id, complaintId, type, text, actorId, createdAt }
              type = "created" | "status" | "priority" | "assignee" | "note"
Store       { version: 1, counter, staff[], complaints[], events[] }
```

Storage: a single localStorage key `complaint-tracker:v1` holding the Store as JSON. On first load (or if the key is missing or the JSON is corrupt) load `src/data/seed.json` and save it. When corrupt data is replaced, show a toast "Saved data could not be read, so demo data was restored."

The seed file `docs/seed-data.json` has 5 staff and 15 complaints with realistic Nigerian business scenarios and a complete timeline for each.

Constants (in `lib/constants.js`):
- STATUSES = ["New", "In Progress", "Waiting on Customer", "Resolved"]
- PRIORITIES = ["Low", "Medium", "High"]
- CATEGORIES = ["Delivery", "Billing & Refunds", "Product Quality", "Service Outage", "Account Access", "Other"]

## 9. States and feedback

| Situation | What the user sees |
| --- | --- |
| Success actions | Toast at bottom centre for 3 seconds, `aria-live="polite"` |
| Validation error | Red text under the field plus focus on the first invalid field |
| Storage failure (quota or blocked) | Toast "Could not save changes in this browser." and the app keeps working in memory |
| Unknown complaint id | "Complaint not found" with a link back |
| Empty list | See 5.2.5 |

## 10. Non-functional requirements

- **Responsive:** breakpoints at 640px and 1024px (see DESIGN.md).
- **Accessibility:** every input has a visible label; errors are announced; focus is visible; the drawer traps focus and returns it to the "New complaint" button on close; colour is never the only signal (pills always carry text); contrast at least 4.5:1 for text.
- **Performance:** instant interactions with the seed data; no network calls.
- **Privacy:** customer details are only shown on the detail screen and in the list as name. No analytics, no third-party scripts except the Google Fonts stylesheet.
- **Browser support:** current Chrome, Edge, Safari and Firefox.

## 11. Technical approach

See `AGENTS.md` for the stack and folder structure. Key decisions:
- `useComplaints` is the only place that reads or writes localStorage and the only place that creates events. Components call its functions: `createComplaint(input)`, `updateStatus(id, status)`, `updatePriority(id, priority)`, `updateAssignee(id, staffId|null)`, `addNote(id, text)`, `resetData()`.
- Selectors (filtering, sorting, counts) are pure functions in `lib/` so they are easy to test.
- No external state library. React state plus the hook is enough.

## 12. Success metrics (prototype)

| Metric | Target |
| --- | --- |
| Task success in usability tests | 90% or more of tasks without help |
| Time to log a complaint | Under 30 seconds |
| Ease rating (1-5) | Average 4 or higher |
| Manual checklist | 100% pass before deploy |

localStorage and sample data cannot prove real response times or adoption, so success is measured through functional tests and usability sessions only.

## 13. Definition of done

- A live Netlify link works on desktop and phone.
- All FR-1 to FR-16 pass (see `docs/TEST-CHECKLIST.md`).
- Data persists after refresh; reset restores the seed.
- `npm run build` passes with no errors or warnings that affect behaviour.
- README explains how to run the project.

## 14. Decisions log

| Decision | Reason |
| --- | --- |
| 4 statuses, not 6 | Open overlapped with New and In Progress; Closed overlapped with Resolved |
| 3 priorities, not 4 | High vs Urgent is hard to explain; add later if users ask |
| Notes and history in one timeline | One place to look is simpler |
| Inline edits, no Save buttons | Fewer clicks; matches the "easy to use" goal |
| Hash router, no library | Keeps the project small |
| localStorage only | Prototype; backend is a later release |
