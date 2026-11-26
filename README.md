# Fixly

Fixly is a minimal complaint tracker for small support teams. Log a customer complaint, give it an owner, track its status and priority, and keep internal notes, all from one screen.

It is a portfolio prototype. Everything runs in the browser, there is no backend and no login, and data is saved in `localStorage`.

## Screenshot

_Add a screenshot of the Dashboard screen here before publishing._

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

The static site is written to `dist/`. On Netlify use build command `npm run build` and publish directory `dist`.

## Screens

| Route | What it does |
| --- | --- |
| `#/` | Dashboard: totals, queue health, resolution rate, 21-day activity trend, status/priority/source charts and recent complaints |
| `#/complaints` | Full complaint list with search, status/priority/source filters and sort |
| `#/inbox` | Split list and detail view for quick triage (one column below 1024px) |
| `#/assigned` | Complaints assigned to the signed-in user |
| `#/unassigned` | Complaints without an owner |
| `#/sources` | Intake mix and performance for each source |
| `#/team` | Workload and resolution performance by person |
| `#/reviews` | Placeholder for review-platform complaints (Phase 2) |
| `#/complaint/<id>` | Complaint detail: description, customer, controls and timeline |

The New complaint drawer opens from the top bar or with the `N` key. `/` focuses search. On mobile the sidebar becomes an overlay and each complaint is a card.

## Stack

- Vite + React 19, JavaScript only
- Plain CSS with variables in `src/styles/` (no Tailwind, no UI library)
- `@tabler/icons-react` for icons
- DM Sans, Sora and JetBrains Mono from Google Fonts
- A small hash router (`#/` and `#/complaint/<id>`), no router library
- All state in `useComplaints`, persisted to `localStorage`
- Charts are hand-built SVG/CSS components, with no chart library

## Folder structure

```
src/
  components/    Sidebar, TopBar, ComplaintTable, Status, Priority, SourceTag,
                 Timeline, NewComplaintDrawer, Field, Toast, EmptyState,
                 charts/ (DonutChart, BarList, TrendChart)
  views/         DashboardView, ComplaintsView, SourcesView, TeamView,
                 DetailView, NotFoundView
  hooks/         useComplaints, useHashRoute, useToast
  lib/           analytics, sources, storage, format, validate, constants,
                 stats, slug
  styles/        tokens.css, base.css, layout.css, components.css,
                 dashboard.css
  data/          seed.json
  App.jsx
  main.jsx
```

## Data

- 15 sample complaints, 5 staff and their full timelines load on first run.
- Everything is saved under the `complaint-tracker:v1` key in `localStorage`.
- **Reset demo data** in the sidebar restores the sample set. Reference numbers are never reused, so a new complaint after a reset continues from the last counter.
- Deleting the key in browser dev tools and refreshing reloads the seed data.

## What's next

From the PRD's "Later" list:

- Review-platform intake behind the Reviews placeholder
- Open and Closed statuses, and an Urgent priority
- Export (CSV)
- A real backend and authentication

## Project docs

- `AGENTS.md`: standing instructions for OpenCode
- `docs/PRD.md`: what to build and how it behaves
- `docs/DESIGN.md`: visual rules and tokens
- `docs/PROMPTS.md`: build slices
- `docs/TEST-CHECKLIST.md`: manual tests and usability script
- `docs/PERSONAS.md`: discovery inputs
- `docs/seed-data.json`: sample data
