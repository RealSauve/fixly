# DESIGN.md: Complaint Tracker

Direction: **clean, light, calm SaaS.** White and warm-neutral surfaces, one accent colour, generous spacing, thin borders, almost no shadows. It should feel quiet and trustworthy, like a well-made notebook rather than a dashboard full of widgets.

## Fonts
Load in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```
- Body and headings: **DM Sans**
- References such as CMP-0012: **JetBrains Mono**, 13px, muted

## Tokens (`src/styles/tokens.css`)
```css
:root {
  /* surfaces */
  --bg: #FAFAF9;
  --surface: #FFFFFF;
  --surface-muted: #F5F5F3;
  --border: #E7E5E0;
  --border-strong: #D6D3CC;

  /* text */
  --text: #1C1C1A;
  --text-muted: #6B6B66;
  --text-faint: #8F8F89;

  /* accent */
  --accent: #3B5BDB;
  --accent-hover: #3050C4;
  --accent-soft: #EDF1FD;
  --focus-ring: 0 0 0 3px rgba(59, 91, 219, 0.35);

  /* status pills (bg / text) */
  --status-new-bg: #E8F0FE;       --status-new-text: #2447B8;
  --status-progress-bg: #FFF3D6;  --status-progress-text: #8A5A00;
  --status-waiting-bg: #F0E9FF;   --status-waiting-text: #5B3BB0;
  --status-resolved-bg: #E3F5E8;  --status-resolved-text: #1F7A3E;

  /* priority pills (bg / text) */
  --priority-low-bg: #F0F0ED;     --priority-low-text: #5F5F59;
  --priority-medium-bg: #E6EEF5;  --priority-medium-text: #2F5878;
  --priority-high-bg: #FDE8E6;    --priority-high-text: #B02A1F;

  /* note */
  --note-bg: #FFF9E6;
  --note-border: #F1E2A8;

  /* error / success */
  --error: #C0392B;
  --success: #1F7A3E;

  /* shape and space */
  --radius: 8px;
  --radius-sm: 6px;
  --radius-pill: 999px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px;
}
```

## Type scale
| Use | Size / weight / line height |
| --- | --- |
| Page title (detail subject) | 24px / 600 / 1.3 |
| Stat number | 28px / 600 / 1 |
| Section title | 16px / 600 / 1.4 |
| Body | 15px / 400 / 1.55 |
| Small, labels, meta | 13px / 500 / 1.4 |
| Reference (mono) | 13px / 500 |

Never use more than these sizes.

## Layout
- App background `--bg`. Cards `--surface` with 1px `--border`, radius 8px, no shadow (drawer gets a soft shadow: `0 8px 32px rgba(0,0,0,0.12)`).
- Content max width 1120px, centred. Page padding 24px, 16px under 640px.
- Breakpoints: **mobile < 640px**, **tablet 640 to 1023px**, **desktop 1024px and up**.
- Top bar: 56px high, white, bottom border. Product name in 600 weight with a small accent square icon.
- Vertical rhythm: 24px between major blocks, 12px inside cards' groups.

## Components

**Button**
- Primary: accent background, white text, 36px high, radius 8px, 500 weight. Hover `--accent-hover`.
- Secondary: white with border `--border-strong`.
- Text button: no border, accent text.
- Disabled: 50% opacity, `cursor: not-allowed`.
- Focus: `--focus-ring` on every focusable element.

**Pill (status and priority)**
- 24px high, 10px horizontal padding, radius pill, 13px / 500.
- A 6px dot in the text colour before the label for status pills.
- In the table, the status pill is a native `<select>` styled like a pill (no arrow clutter: small chevron on the right).

**Stat card**
- White card, 16px padding, number on top, label below in muted. Active card gets a 2px accent border and `--accent-soft` background. Cursor pointer; it is a `<button>` for accessibility.

**Form field**
- Label above (13px / 500), input below: 40px high, 1px `--border-strong`, radius 8px, 12px padding. Focus: accent border plus ring. Error: red border plus message below in 13px red.
- Textarea min height 96px.
- Segmented control for priority: three equal buttons joined, selected one filled with accent-soft and accent text.

**Drawer**
- Slides in from right (200ms ease-out), 440px wide, full screen on mobile, with a 40% black scrim. Header with title "New complaint" and a close icon button. Footer fixed to the bottom with the two buttons.

**Toast**
- Bottom centre, dark `#1C1C1A` background, white text, 14px, radius 8px, check icon. Fades in and out. One at a time.

**Timeline**
- Left rail line in `--border`, small round icon markers (20px).
- System event: one line, 14px, muted text, marker with a tiny icon.
- Internal note: card with `--note-bg`, 1px `--note-border`, radius 8px, padding 12px; header row with lock icon, "Internal note", author and time; body text below in `--text`.

**Empty state**
- Centred in the list area: a 40px muted icon, one line of text in 15px, one button. No illustrations.

## Icons (Tabler, stroke 1.5, size 18 unless noted)
IconPlus, IconSearch, IconArrowLeft, IconLock, IconCheck, IconX, IconChevronDown, IconSortDescending, IconSortAscending, IconUser, IconMail, IconPhone, IconClock, IconFlag, IconArrowsExchange, IconCircleDot, IconInbox (empty state).

## Microcopy
| Where | Text |
| --- | --- |
| Top bar button | New complaint |
| Search placeholder | Search by reference, subject or customer |
| Empty list | No complaints yet. Log your first one. |
| No matches | No complaints match your filters. |
| Note placeholder | Add an internal note. Customers never see this. |
| Note button | Add note |
| Drawer title | New complaint |
| Drawer submit | Log complaint |
| Footer | Prototype. Data is saved in this browser only. |
| Reset confirm | Reset demo data? This replaces everything in this browser. |
| Not found | Complaint not found. Back to complaints |

Tone: short, calm, friendly. No exclamation marks.

## Responsive behaviour
- **Desktop:** full table, two-column detail, 440px drawer.
- **Tablet:** table without the Category column; detail stays two columns at 2/3 and 1/3.
- **Mobile:** stat cards 2 x 2, list becomes cards, detail is one column with the side panel first, drawer is full screen, toolbar controls stack (search full width, filters side by side).

## Motion
Only two animations: drawer slide (200ms) and toast fade (150ms). Respect `prefers-reduced-motion` by removing them.

## Quality bar (check before saying a slice is done)
- Spacing follows the 8px grid and tokens, with no random pixel values.
- No more than one accent colour on a screen apart from the status and priority pills.
- Text contrast at least 4.5:1; focus ring visible on every control.
- Looks right at 375px, 768px and 1280px.
