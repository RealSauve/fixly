# TEST-CHECKLIST.md

Run this after slice 7 and again on the live Netlify link. Tick every box.

## A. Manual checks

### Create (FR-1 to FR-3)
- [ ] Empty form shows errors and focuses the first invalid field
- [ ] Name only (no email or phone) shows "Add an email or a phone number."
- [ ] Bad email and bad phone formats are rejected with clear messages
- [ ] Valid form adds a complaint at the top with status New and the next reference (CMP-0169)
- [ ] Double-clicking "Log complaint" creates only one complaint
- [ ] Same name and subject within 60 seconds shows the duplicate warning; "Log anyway" works; "Cancel" does not create one
- [ ] The new complaint's timeline shows "Complaint logged"

### Find (FR-4 to FR-6)
- [ ] Search finds by reference (e.g. "0007"), by subject word and by customer name, ignoring case
- [ ] Status filter and priority filter work alone and together with search
- [ ] "No complaints match your filters." appears with a working "Clear filters"
- [ ] Sort toggle flips between newest and oldest first

### Update (FR-7 to FR-11)
- [ ] Changing status from the list row updates the row, the dashboard and the timeline
- [ ] Changing status, priority and assignee on the detail screen each add the correct timeline line
- [ ] Setting a field to the value it already has adds no event
- [ ] Moving a complaint to Resolved shows a Resolved date; moving it back clears it
- [ ] An empty or spaces-only note cannot be added
- [ ] A valid note shows author and time and looks different from system events
- [ ] Notes are added to the correct complaint only

### Dashboard (FR-12)
- [ ] The four counts match what you see by filtering the list (seed data starts at New 9, In Progress 21, Waiting on Customer 28, High priority 18 active)
- [ ] Clicking a card filters the list; clicking it again clears the filter

### Data (FR-13, FR-14)
- [ ] Refresh keeps everything, including new complaints and notes
- [ ] "Reset demo data" asks for confirmation, then restores the 168 seed complaints
- [ ] Deleting the saved data in browser dev tools and refreshing loads the seed data

### Layout and keyboard (FR-15, FR-16)
- [ ] 375px: no horizontal scroll; list is cards; drawer is full screen
- [ ] 768px: table without the Category column
- [ ] 1280px: full table and two-column detail
- [ ] "/" focuses search, "N" opens the drawer, Esc closes it, shortcuts do nothing while typing
- [ ] The whole flow (log, find, change status, add note) works with the keyboard only
- [ ] Focus is visible everywhere and returns to "New complaint" after the drawer closes

## B. Usability test (3 people, about 20 minutes each)

Give each tester the live link and no instructions. Ask them to think aloud.

Tasks:
1. A customer says their order arrived damaged. Log a new complaint for it.
2. Find the complaint from "Ngozi Okafor" and assign it to a colleague.
3. Mark it as Waiting on Customer and leave a note about what you asked for.
4. Tell me how many complaints are still new.

Record for each task:

| Task | Completed unaided? (Y/N) | Time | Where they hesitated | Quote |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |

End with: "How easy was this, from 1 (very hard) to 5 (very easy)?" Score: ___

Targets: 90% or more tasks done unaided, task 1 under 30 seconds, average ease 4 or higher.
