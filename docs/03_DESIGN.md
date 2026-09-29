# Zain OS — Design System (web)
*Replaces the June React Native `design.md`. Same soul, rebuilt for Next.js + Tailwind v4 + shadcn/ui.*

## 1. Feel
**"Bloomberg Terminal meets a leather notebook, lit by a gold lamp before Fajr."**
- Dark-first and calm, but **alive**: the streak flame, checkpoint pops and the "Day kept" moment are the emotional peaks. Everything else stays quiet.
- One accent, warm gold. Semantic colors (green, amber, red, blue) appear only as state.
- Typography does the hierarchy: an elegant serif for moments, the system sans for work, mono for numbers and times, Amiri for Arabic.
- Visual reference: `docs/reference/playbook.html` (open it in a browser). The app should feel like its sibling.

## 2. Tokens → `app/globals.css`
Define these as CSS variables and map them into Tailwind v4 with `@theme inline`. The dark values live on `:root` (default) and the light values under `[data-theme="light"]`. The app defaults to dark and follows the system setting only if the user picks "System".

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#0F0F0F` | `#F2F0EB` | page background |
| `--surface` | `#171615` | `#E9E6DF` | sections, tab bar |
| `--card` | `#201F1D` | `#FBFAF7` | cards, sheets |
| `--elevated` | `#2A2825` | `#FFFFFF` | popovers, active chips |
| `--line` | `#2F2C28` | `#D9D4C9` | hairlines, borders |
| `--line-strong` | `#3D3830` | `#C9C2B3` | focused borders |
| `--fg` | `#F3F0EA` | `#1B1914` | primary text |
| `--muted` | `#AAA59C` | `#5C5647` | secondary text |
| `--faint` | `#6E6961` | `#8C8575` | captions, disabled |
| `--gold` | `#C8A96E` | `#8C6A2A` | accent, CTA, streak, active |
| `--gold-dim` | `#8A6F3E` | `#B39359` | secondary accent |
| `--gold-glow` | `rgba(200,169,110,.13)` | `rgba(140,106,42,.10)` | halos, active backgrounds |
| `--night` | `#0D1524` | `#E3E7EF` | Deep-work mode surface, night bands |
| `--ok` | `#4CAF7D` | `#2E7D55` | done, comeback |
| `--warn` | `#E8A838` | `#A86A06` | at risk |
| `--bad` | `#E85C5C` | `#B53A3A` | missed, reset |
| `--frozen` | `#6F8FC7` | `#4E6FA8` | freeze used |

**shadcn mapping:** `background=--bg`, `card=--card`, `popover=--elevated`, `primary=--gold` (primary-foreground=`--bg`), `muted=--surface`, `muted-foreground=--muted`, `border=--line`, `ring=--gold`, `destructive=--bad`. Radius `--radius: 12px`.

## 3. Typography (next/font)

| Role | Font | Sizes |
|---|---|---|
| Display | Cormorant Garamond 600 (italic 500 for emphasis) | 40 / 32 / 24 |
| Body | system UI stack (`-apple-system, "SF Pro Text", "Segoe UI", Roboto, sans-serif`) | 17 / 15 / 13 |
| Numbers and times | JetBrains Mono 400/500, `tabular-nums` | 13 / 11 |
| Arabic | Amiri 400/700, `dir="rtl"`, line-height 1.9 | 22 / 18 |
| Labels | JetBrains Mono 500, uppercase, letter-spacing .14em | 11 |

- Display text is for moments only: the streak number, screen titles, "Day kept", the Why Card identity line.
- Everything operational uses the body stack.

## 4. Spacing, radius, elevation
- Spacing scale is 4-based: 4, 8, 12, 16, 24, 32, 48. The screen gutter is 16px and the gap between sections is 24px.
- Radius: 12px for cards and sheets, 999px for chips and pills, 8px for small controls.
- **No drop shadows on dark.** Show depth with the surface steps (bg → surface → card → elevated) plus 1px `--line` borders.
- Active or "now" items get a `--gold-glow` fill and a 1px `--gold` border.
- Use at most one gradient per screen. The only allowed gradient is the Why Card: `--surface` → `--bg`, top to bottom.

## 5. Components
- **Tab bar:** 4 tabs (Today `sun`, Streaks `flame`, Plan `target`, Coach `message-circle`), fixed to the bottom with safe-area padding, no badges. Active tab: gold icon and label.
- **Streak badge:**
  - Flame icon + number in JetBrains Mono 500.
  - Gold when kept, `--warn` when at risk, a frozen-blue ring when a freeze was used today.
  - A gentle scale pulse whenever the number increases.
- **Checkpoint chips:**
  - 5 equal chips in a row. Each has an emoji, the prayer name and a small mono jamaat time.
  - States: `done` (gold fill, dark text), `next` (gold border + glow + countdown), `pending` (surface), `missed` (bad border, only after the day closes).
- **Checkpoint sheet** (shadcn Drawer):
  - Title "Asr · العصر", then minimum toggles as 56px-high rows with big tick circles.
  - Targets below in muted text.
- **Big Rock card:** The largest card on Today. It shows:
  - the first action in body 17 semibold
  - a 5-4-3-2-1 countdown button (the final beat reads "Bismillah")
  - the timer in mono 40
  - the mode switch (Block / 60/10)
  - while running, the card surface turns `--night`.
- **Why Card:** identity line in display italic 24, niyyah in muted, a countdown line in mono, then the plan list and a Confirm button (gold, full width).
- **Day kept moment:** a full-screen overlay for 1.6s. The flame scales from 0.6 to 1 with a spring, "Alhamdulillah" appears in Amiri with "Day kept · 🔥 13" beneath, then it dismisses itself. Respect reduced motion (fade only).
- **Heatmap:** 12 columns (weeks) × 7 rows (days), 14px squares, 3px gap, one colour per state token.
- **Score ring:** SVG, 8px stroke, gold arc on a `--line` track, the percentage in mono in the centre.
- **Sheets and dialogs:** shadcn Drawer on mobile, Dialog at ≥ 768px.

## 6. Motion (motion/react)
- Interactive spring: `{ type: "spring", stiffness: 420, damping: 30 }`
- Reveal spring: `{ type: "spring", stiffness: 220, damping: 26 }`
- Tap feedback: scale to 0.96 on press, a spring back to 1, and `navigator.vibrate?.(10)`.
- Animate only `transform` and `opacity`.
- Count-ups on numbers take 600ms, ease-out.
- `prefers-reduced-motion`: replace all springs with 150ms opacity fades.

## 7. Copy voice
- Direct, warm, short. There's no hype and no emoji spam (emoji are allowed on checkpoints and the streak only).
- Name things the way Zain says them: *Big Rock, muhasaba, jamaat, Maker Block, WIG*.
- A miss is never shamed: "Good. Comeback day." Success is thanked: "Alhamdulillah."
- Arabic always appears with its meaning underneath.

## 8. Accessibility
- Contrast is AA in both themes. Tap targets are ≥ 44px. Focus is visible (a 2px gold ring).
- Every icon-only button has an `aria-label`. Arabic blocks carry `lang="ar"`.
