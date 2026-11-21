# AGENTS.md: Fixly

You are building **Fixly**, a minimal complaint tracker that lets a small support team log customer complaints, assign them, track their status and keep internal notes. It is a portfolio prototype that runs entirely in the browser.

## Read these first, in this order
1. `docs/PRD.md` is the source of truth for what to build and how it behaves.
2. `docs/DESIGN.md` is the source of truth for how it looks.
3. `docs/seed-data.json` is the sample data to load on first run.
4. `docs/PROMPTS.md` lists the build slices. I will give you one slice at a time.

If these files disagree, PRD.md wins on behaviour and DESIGN.md wins on visuals. If something is not covered, ask me instead of guessing.

## Product principles
- Minimal and easy to use. A new user should need no explanation.
- One primary action per screen. No settings pages, no menus, no onboarding tours.
- Changes on the detail page save instantly. No Save buttons there.
- Plain, friendly wording. No jargon.

## Stack (fixed, do not change)
- Vite + React + JavaScript (no TypeScript)
- Plain CSS with CSS variables in `src/styles/`. No Tailwind, no UI library.
- `@tabler/icons-react` for icons. DM Sans and JetBrains Mono from Google Fonts.
- No router library. Use a small hash router (`#/` and `#/complaint/<id>`).
- All data lives in one hook, `useComplaints`, which owns state and localStorage.
- Deploys to Netlify as a static site (`npm run build`, publish `dist`).

## Folder structure
```
src/
  components/    Button, Pill, Field, Drawer, Toast, EmptyState, StatCard...
  views/         ComplaintsView, DetailView
  hooks/         useComplaints.js, useHashRoute.js, useToast.js
  lib/           storage.js, format.js, validate.js, constants.js
  styles/        tokens.css, base.css, components.css
  data/          seed.json (copied from docs/seed-data.json)
  App.jsx
  main.jsx
```

## Rules
1. Build only the slice I ask for. Do not add features, pages or settings that are not in the PRD.
2. Do not add a dependency without asking me first.
3. Keep files small and readable. Prefer simple code over clever code. Add a short comment only where the logic is not obvious.
4. Never hard-code colours, spacing or fonts in components. Use the CSS variables from `tokens.css`.
5. Every interactive element must be keyboard reachable and have an accessible name.
6. Derived numbers (dashboard counts, filtered lists) must be computed from the complaint data, never stored separately.
7. Every change to status, priority or assignee, and every note, must create an event on the timeline.
8. Do not refactor or rename things from earlier slices unless I ask.

## How to work with me
- Before you write code, restate the slice in two lines and list the files you will create or change.
- After you finish, give me three bullets: what changed, how to test it in the browser, and anything you were unsure about.
- Run `npm run build` at the end of each slice and fix any errors.
- If a requirement is unclear, ask one short question and wait.

## Out of scope (do not build)
Login or roles, a backend or database, email or WhatsApp intake, SLA timers, automation, AI features, customer portal, exports, real-time collaboration, dark mode, settings.
