# PROMPTS.md: build slices for OpenCode

Paste one prompt at a time into OpenCode. After each one: run the app, click through it, check the "Done when" line, then commit. Do not start the next prompt until the current one passes.

Commit message pattern: `slice 3: new complaint drawer`

---

## Prompt 0: Project setup

```
Read AGENTS.md, docs/PRD.md and docs/DESIGN.md fully before doing anything.

Task: set up the project.
1. Create a Vite + React (JavaScript) app in this folder. Keep my existing files (AGENTS.md, docs/, assets/, design-references/) untouched.
2. Install only: @tabler/icons-react.
3. Create the folder structure from AGENTS.md.
4. Create src/styles/tokens.css using the exact tokens from docs/DESIGN.md, plus base.css (reset, body font, focus ring) and components.css (empty for now).
5. Add the Google Fonts links to index.html and set the page title to "Complaint Tracker".
6. Replace the starter content with a blank App that shows the top bar (product name only) and an empty page area.
7. Copy docs/seed-data.json to src/data/seed.json.

Restate the task in two lines and list the files you will create before writing code. When finished, run npm run build and give me three bullets (what changed, how to test, doubts).
```
**Done when:** `npm run dev` shows a blank page with the top bar, correct font and background; build passes.

---

## Prompt 1: Data layer (slice 1)

```
Build slice 1: the data layer. Follow PRD sections 7, 8 and 11.

Create:
- src/lib/constants.js (STATUSES, PRIORITIES, CATEGORIES)
- src/lib/storage.js (load, save, with try/catch; key "complaint-tracker:v1"; fall back to seed.json when missing or corrupt)
- src/lib/format.js (relative time and full date formatting)
- src/hooks/useComplaints.js exposing: complaints, events, staff, currentUser, createComplaint, updateStatus, updatePriority, updateAssignee, addNote, resetData. Every change creates the correct event with the exact wording from PRD 5.5 and updates updatedAt/resolvedAt per PRD 7.
- src/hooks/useToast.js and a Toast component.
- A temporary debug view on the home route that prints the number of complaints and lets me click a button to change the first complaint's status, so I can test persistence. I will remove it in slice 2.

Do not build any other UI yet.
```
**Done when:** the count shows 15; changing a status survives a refresh; "reset" restores the seed.

---

## Prompt 2: Complaint list (slice 2)

```
Build slice 2: the Complaints screen. Follow PRD 5.2 and DESIGN.md. Remove the debug view from slice 1.

Create the hash router (src/hooks/useHashRoute.js), the top bar, the footer with "Reset demo data" (with confirmation), and ComplaintsView with:
- toolbar: search, status select (All, All active, New, In Progress, Waiting on Customer, Resolved), priority select, sort toggle, Clear filters
- desktop table with the exact columns from PRD 5.2.3, mobile card layout below 640px
- inline status and assignee selects in table rows (use the useComplaints functions)
- result count and both empty states
- Pill component for status and priority

Leave the stat strip, the New complaint drawer and the detail screen for later (rows may link to #/complaint/<id> but that route can show a placeholder).
```
**Done when:** search, both filters and sort combine correctly; empty states appear; inline status change updates the row and persists.

---

## Prompt 3: New complaint drawer (slice 3)

```
Build slice 3: the New complaint drawer. Follow PRD 5.3, FR-1 to FR-3 and DESIGN.md (Drawer, Form field, Segmented control).

- "New complaint" button in the top bar opens the drawer; the N key opens it too (ignore when typing in a field).
- All fields, validation rules, error messages, character counter, focus handling and focus return exactly as in the PRD.
- Duplicate guard: disabled button while saving and the 60-second same name + subject warning with "Log anyway" and "Cancel".
- On success: create the complaint, close the drawer, toast "Complaint CMP-0016 logged" (use the real reference).
- Put validation in src/lib/validate.js as pure functions.
```
**Done when:** submitting an empty form shows errors and focuses the first one; a valid form adds CMP-0016 at the top of the list; double-clicking creates only one.

---

## Prompt 4: Detail screen (slice 4)

```
Build slice 4: the Complaint detail screen. Follow PRD 5.4 and DESIGN.md.

- Route #/complaint/<id>, back link, header, Description card, Customer card with mailto and tel links.
- Side panel with Status, Priority and Assigned to selects that save instantly, plus Category, Created, Last updated and Resolved (only when resolved). Toast after each change.
- "Complaint not found" state for unknown ids.
- Two columns on desktop, one column on mobile with the side panel first.
- Leave the timeline area as a placeholder card for now.
```
**Done when:** changing any field on the detail screen is reflected in the list after going back, and persists after refresh.

---

## Prompt 5: Timeline and notes (slice 5)

```
Build slice 5: the timeline. Follow PRD 5.5 and DESIGN.md (Timeline).

- Note composer at the top: disabled button until there is non-space text, 500 character limit with counter, Ctrl/Cmd + Enter submits, field clears and keeps focus after adding.
- Render all events for the complaint newest first. System events are one muted line with an icon. Notes are the tinted "Internal note" cards with lock icon, author and time.
- Relative time with the full date as tooltip (title attribute).
- Confirm that changing status, priority or assignee adds the right event line immediately.
```
**Done when:** every change from the side panel shows up on the timeline in order; notes look clearly different; empty notes cannot be added.

---

## Prompt 6: Dashboard strip (slice 6)

```
Build slice 6: the stat strip on the Complaints screen. Follow PRD 5.2.1 and 5.2.4.

- Four stat cards (New, In Progress, Waiting on Customer, High priority) computed from the complaints data with a pure function in src/lib.
- Clicking a card applies the matching filter; clicking the active card clears it. The "High priority" card sets priority = High and the status filter to "All active".
- Cards are real buttons, with aria-pressed for the active state.
```
**Done when:** counts match the list; changing a status on any screen updates the counts immediately; clicking a card filters the list.

---

## Prompt 7: Polish, responsive, keyboard, accessibility (slice 7)

```
Build slice 7: polish. Follow PRD 10, FR-15, FR-16 and the quality bar in DESIGN.md.

1. Check every screen at 375px, 768px and 1280px. Fix overflow, spacing and tablet layout (hide Category column on tablet).
2. Keyboard: "/" focuses search, "N" opens the drawer, Esc closes it, the drawer traps focus and returns it to the New complaint button.
3. Accessibility: visible labels, aria-describedby on errors, aria-live on the toast, visible focus rings, aria-pressed on stat cards, accessible names on icon buttons.
4. prefers-reduced-motion support.
5. Remove unused code and any console warnings.

List everything you changed. Do not add features.
```
**Done when:** the full flow works with the keyboard only and the layout holds at all three widths.

---

## Prompt 8: Self-review (before testing)

```
Review the whole codebase against docs/PRD.md section by section. For each FR (FR-1 to FR-16) say PASS or FAIL with the file and line that proves it. Fix every FAIL. Then list any code that is unused, duplicated or too complex, and simplify it without changing behaviour. Run npm run build.
```

## Prompt 9: README

```
Write README.md: what the app is, a screenshot placeholder, how to run it (npm install, npm run dev), how to build (npm run build), the stack, the folder structure, a note that data is stored in the browser only, and a short "what's next" list from PRD section 4 (Later).
```

## Deploy notes (no prompt needed)
1. Push the repo to GitHub.
2. In Netlify choose "Add new site", then "Import from Git", pick the repo.
3. Build command `npm run build`, publish directory `dist`.
4. Open the live link on your phone and run the checklist once more.

## If OpenCode goes off track
Say: "Stop. You changed things outside this slice. Revert to the last commit state for those files and only do what the slice asks." Then re-paste the prompt.
