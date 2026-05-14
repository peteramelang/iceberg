# iceberg — UI Redesign Design Spec

**Date:** 2026-05-14
**Status:** Brainstorm complete; pending implementation plan.
**Builds on:** `docs/superpowers/specs/2026-05-13-iceberg-design.md` (initial app spec) and `docs/superpowers/plans/2026-05-14-iceberg-content-depth.md` (content-depth plan — adds `narrative`, `pitfalls`, `codeExamples`, `difficulty`, `estimatedHours`, learning paths, `/whats-new`, fuzzy search, SEO).

## Goal

Replace the current Berkeley-Mono cream/manpage chrome with a modern dark-themed (and light-mode-capable) course-platform shell — sidebar-led navigation, properly-sized right rails, sticky in-page section nav, typed-connection treatment, and content sections that match the richer data the content-depth plan introduces.

The redesign is structural (layout + information architecture + light/dark theming) — it does **not** redesign the content pipeline. All existing data fields are preserved and rendered; the five new fields from the content-depth plan get first-class UI treatment.

## Execution model

- **Branch:** `ui-redesign-v2`, off `main`. The app is rebuilt in parallel and merged when complete; `main` keeps shipping the current app until the switchover.
- **Approach:** treat `app/src/` as a rebuild rather than an in-place migration. The current Berkeley-Mono shell, the existing `PrimaryNav`, `Page`, and the per-route components are all replaced rather than refactored. Stores (`ProgressStore`, `BookmarkStore`, `NotesStore`) and the content loader / Zod schemas are reused unchanged.
- **Data layer is frozen:** the content-depth pipeline has run; `content/` is the source of truth for this redesign. No pipeline or schema work is in scope.
- **Session model:** the implementation plan is executed in a fresh session via subagent-driven development — this spec + the resulting plan are the only required context for that session.

## Out of scope

- Custom illustrated brand mark (iceberg-shaped logo). A gradient-square placeholder is used everywhere `brand-mark` appears. Designing the final mark is a separate task.
- Color palette specifics. The new `DESIGN.md` (rewritten separately by the project owner) will define the exact token values for light and dark themes. This spec specifies *which tokens exist*, not their hex values.
- Marketing/landing site. Only the in-app shell.

## Reference

Interactive mockups (dark theme, placeholder tokens) for the topic view, phase view, and home dashboard live in `.superpowers/brainstorm/5480-1778712465/content/topic-and-phase-mockups.html`. They are not pixel-perfect production artifacts; they are the design contract for layout, hierarchy, and information density.

---

## 1. App shell

### Layout

- **Two-pane grid:** 260px left sidebar + fluid main area.
- **Topbar** inside the main area: 52px tall, sticky to the top of the viewport.
- **Main content max-width:** 1480px (centered on ultra-wide; left-aligned within). Inside, the content area uses a 2-column layout where applicable (see route specs).
- **Mobile (< 768px):** sidebar slides over as a drawer triggered by a hamburger in the topbar; main area expands to full width.

### Theming

All colors are referenced via CSS custom property tokens (`--bg`, `--panel`, `--panel-2`, `--panel-3`, `--border`, `--border-soft`, `--text`, `--text-mute`, `--text-dim`, `--accent`, `--accent-soft`, `--green`, `--amber`, `--blue`, `--pink`, plus `--radius` and `--radius-sm`). Tokens are defined twice in the (separately-authored) new `DESIGN.md`:

- `[data-theme="dark"]` (or `:root`) — dark-mode values.
- `[data-theme="light"]` — light-mode values.

Theme is controlled by a `data-theme` attribute on `<html>`, set by a `ThemeProvider` that:

1. Reads `localStorage.theme` (values: `"light" | "dark" | "system"`).
2. Defaults to `"system"`; resolves at boot via `matchMedia('(prefers-color-scheme: dark)')`.
3. Listens for system theme changes when in `system` mode and updates live.
4. Provides a Settings toggle (Light / Dark / System).

**Graph palette flips per theme:** node fills, edge colors, and edge dash patterns all have light-mode token values tuned for accessibility on light surfaces (deeper saturation, darker hues) and dark-mode values (current placeholder values).

**No component renders raw hex values.** Components reference tokens only.

### Typography

- Body type: system sans (e.g., `ui-sans-serif, system-ui, "Inter", sans-serif`).
- Monospace: `ui-monospace, "JetBrains Mono", monospace` — reserved for code blocks and small uppercase labels (`section-title`).
- The current "everything is Berkeley Mono" rule is dropped.

### Motion

- **System-level transitions** (always on): sidebar phase expand/collapse 200ms ease-out, active-state changes 150ms, hover transitions 100ms. Theme changes have no transition (avoid color flash).
- **Completion moments** (significant): completing a topic triggers a brief animation — the right-rail progress ring fills, the topic's sidebar glyph flips from partial to done with a small scale-up (200ms), and any downstream topics newly unblocked by the completion highlight briefly in the topic-view connection-map mini-graph.
- **No page-transition cross-fades, no scroll-triggered animations, no streak counters.** Restraint over dopamine.

---

## 2. Sidebar

260px wide, always visible on desktop, drawer on mobile.

### Structure (top to bottom)

1. **Brand block (top, ~52px):** gradient-square placeholder mark + "iceberg" wordmark, both clickable, navigates to `/`.

2. **Utility section (pinned, no header):**
   - Continue (icon: progress glyph) — navigates to the last-touched topic, or first incomplete topic if none.
   - Bookmarks — `/bookmarks`.
   - Paths — `/paths`.
   - What's new — `/whats-new`.
   - Graph — `/graph`.
   - Settings — `/settings`.
   - Each row: icon + label, ~32px tall, hover changes background to `--panel-2`, active state has a 2px accent left rule and `--panel-2` background.

3. **Section label:** "Curriculum" — small uppercase, `--text-dim`, ~12px letter-spaced.

4. **Phase list:** all 9 phases, each rendered as a collapsible header:
   - Chevron (▸ collapsed / ▾ expanded) + phase title + right-aligned `N / M` topic count.
   - Click anywhere on the row to toggle expand.
   - **Auto-expand rule:** only one phase auto-expanded at a time — the one containing the currently-viewed topic (or, on the phase view, the current phase). Other phases stay collapsed unless the user manually expands them. The user's manual expansions are remembered across navigation within the session.

5. **Topic rows (inside an expanded phase):**
   - Indented by ~20px from phase rows.
   - Progress glyph (○ empty / ◐ partial / ● done) + topic title.
   - 2px-tall progress bar under the title — fill width = checked resources / total resources. Color: `--accent` for partial, `--green` for done, transparent for empty.
   - Active topic has a 2px accent left rule and `--panel-2` background.

### Behavior

- Sidebar itself scrolls independently of main content when the curriculum tree overflows.
- Difficulty/hours are **not** shown in the sidebar (they appear on topic cards in the phase view and on the topic hero). Sidebar prioritizes scan-ability over density.

---

## 3. Topbar

52px tall, sticky.

- **Left:** mobile hamburger button (`< 768px` only), then the search input. Search input is ~420px wide max, opens the global ⌘K palette. Placeholder reads "Search topics, resources, connections…". A `⌘K` kbd hint sits on the right inside the input.
- **Right:** small global progress counter (`X / 46 topics`), theme toggle icon (optional shortcut to Settings → Appearance), and (in future) account/avatar if multi-user. For now, just the counter.

### Search palette (`⌘K`)

Triggered by `⌘K` (or `Ctrl+K`), the `/` key when not focused in a form, or clicking the topbar search input.

- **Fuzzy index** powered by `fuse.js` (already planned in the content-depth plan, Task 19).
- **Indexed entities:** topics (title + summary + definition + slug + phase title), phases (title + description), resources (title + author/publisher/provider + parent-topic slug + resource kind), connections (typed edges — `from-title type to-title` and the reasoning string).
- **Results grouped by entity type:** Topics · Phases · Resources · Connections.
- **Results display:** entity title, parent context (e.g., "in Authentication"), type badge.
- **Keyboard:** ↑↓ to move, Enter to navigate, Esc to close. Topic results navigate to `/topic/:slug`; resource results to `/topic/:slug#anchored-section`; connection results to the `from` topic with the relevant connection scrolled into view.

---

## 4. Home dashboard (`/`)

Single content column (no right rail). Width capped at ~1040px.

### Sections (top to bottom)

1. **Continue hero card** — large gradient-backed card (accent → secondary-color gradient, low opacity).
   - Left: "Welcome back · pick up where you left off" eyebrow; large title of the resumed topic; 1-line summary; thin progress bar; meta ("5 / 8 resources · Phase name"); Resume → button (primary).
   - Right: big progress ring (overall % of 46 topics complete) with N/M topics underneath and a breakdown line ("X done · Y partial · Z untouched").
   - **First-visit fallback:** if user has no progress, the resumed-topic block becomes "Start with [first prereq-free topic] →".

2. **Recommended next** — section heading + 3-card horizontal grid (or stack on narrow widths). Cards show parent-phase eyebrow, topic title, summary, empty progress bar. Topics selected by: next unblocked topics by prereq order whose direct prereqs are all `done`.

3. **Learning paths strip** — section heading + horizontal scrolling card row.
   - Each card is ~280px wide: audience eyebrow ("Solo founder · 12h"), path title, path description (line-clamped to 3 lines), meta ("4 topics · ~12h").
   - Clicking navigates to `/path/:slug`.
   - Hidden if `paths.length === 0` (graceful before paths are seeded).

4. **Recent activity** — section heading + list of last 5 actions read from `localStorage`. Each row: type icon (✓ resource checked, ● topic completed, ★ bookmarked), action text with bolded entity, right-aligned relative time ("2 h ago"). The activity log is appended to by progress/bookmark stores and capped at 50 entries.

5. **All phases** grid — section heading + 3-column grid of all 9 phase tiles. Tile: phase number, title, topic count, mini progress bar. Clicking navigates to `/phase/:slug`. Acts as a secondary nav for users who land on `/` first.

---

## 5. Topic view (`/topic/:slug`)

Two-column layout inside main: fluid content column (max ~720px) + 320px right rail. Both columns scroll with the page; right rail cards are individually sticky to the top of the viewport.

### Hero

- Eyebrow: phase title · "Topic N of M" (computed from phase taxonomy).
- Title (large) — flexbox-aligned with **DifficultyBadge** to its right:
  - Pill, ~22px tall, colored per difficulty (`beginner` = green tokens, `intermediate` = amber tokens, `advanced` = red tokens).
  - Label (e.g., "Intermediate") + dimmed hours ("~4h").
- Summary (1-line, mute text).

### Sticky in-page jump nav

Below the hero, just below the sticky topbar in z-order. Sticky to `top: 52px` (matching the topbar). Backdrop: `rgba(--bg, 0.78)` with `backdrop-filter: blur(8px) saturate(140%)` so content scrolls under it cleanly.

**Pills (in order, only render if section has content):**

1. Definition
2. In Depth
3. Pitfalls + count
4. Code + count
5. Videos + count
6. Articles + count
7. Services + count
8. Courses + count
9. Connections + count
10. Notes

Active pill is filled with `--accent`; others are outlined (`--border`, `--text-mute` text). Count badges are `--text-dim`. Pills wrap to a second row on narrow widths.

**Behavior:**
- Click a pill → smooth-scroll to the section anchor, accounting for the sticky topbar+nav offset.
- IntersectionObserver watches all section headers; the active pill updates as the user scrolls.

### Main column sections (in order)

Render only if data is present.

1. **Definition** — `fm.definition` paragraph(s).
2. **In Depth** — `fm.narrative` rendered as paragraphs (split on `\n\n+`). Plain prose, generous line height.
3. **Common Pitfalls** — `fm.pitfalls[]` rendered as a numbered editorial list (see `Pitfall` component spec). Section count: array length.
4. **Code** — `fm.codeExamples[]` rendered as `CodeExample` blocks (see component spec). Section count: array length, label "N examples".
5. **Videos** — resource rows for `videos.short` and/or `videos.long`. Each row: checkbox + duration badge + title + author. Section count: 1 or 2.
6. **Articles** — `articles[]` resource rows: checkbox + kind badge + title + publisher. Count = array length.
7. **Services** — `services[]` resource rows: checkbox + category badge + name + reasoning (mute). Count = array length.
8. **Courses** — `courses[]` resource rows: checkbox + provider badge + title + paid/free chip. Count = array length.
9. **Connections** — typed groups (see component spec below).
10. **Your notes** — `NotesField` (existing component, restyled for dark theme).

### Right rail (320px wide)

Two cards, each individually sticky to `top: 80px` (below topbar+nav) when scrolling:

1. **Progress card:**
   - Card header: "Progress" (small uppercase label).
   - Progress ring (~58px) showing % of resources checked + label "5 / 8 resources" + helper text.
   - Per-resource checklist: every resource (video short/long, each article, each service, each course) gets a row with a checkbox glyph and a short label. Checking/unchecking here is synced with the main-column resource rows.
   - Button row: "Mark complete" (primary, accent) + "★ Bookmark" (secondary).

2. **Connection map card:**
   - Card header: "Connection map".
   - SVG mini-graph (~260px tall) with the current topic node centered (filled accent), connection nodes arranged around it. Edges colored by type (amber arrow → prerequisite, purple dashed line ↔ pairs-with, blue line • related, pink line ≠ often-confused-with).
   - Up to **8 connection nodes** rendered, selected by descending edge `weight`. If the topic has more than 8 connections, append a small "+N more — open graph view →" line.
   - Mini legend underneath showing the four edge types with color swatches.
   - Footer link: "Open in graph view →" navigates to `/graph?focus=:slug`.

---

## 6. Phase view (`/phase/:slug`)

Two-column: content + 320px right rail. Same shell as topic view.

### Hero

- Eyebrow: "Phase N of 9".
- Title (large).
- Description paragraph.

### Main column

**Topics section** — vertical list of topic cards. Each card:

- Left: 2-digit index (`01` … `0N`) — `--text-dim`.
- Center: topic title + inline `DifficultyBadge` (smaller variant, ~10.5px font, ~2px vertical padding); below: summary.
- Right: resource count (`5 / 8 resources`) + 100px wide × 4px tall progress bar (green when complete).
- Hover: background `--panel-2`, border `--border`. Click navigates to `/topic/:slug`.

### Right rail

1. **Phase progress card:**
   - Ring with phase % (resources checked across all topics in phase / total resources).
   - "N / M resources · X / Y topics complete".
   - "Continue [next-incomplete-topic-title]" button (primary).

2. **Prerequisite phases card:**
   - Header: "Prerequisite phases".
   - For each phase that has any topic that this phase's topics depend on (via `prerequisite` edges), show "← [phase name]" rows. Click navigates to that phase.
   - If empty: "*None — this is the foundation.*" in mute italic.

3. **Leads into card:**
   - Header: "Leads into".
   - For each downstream phase (topics in this phase are prereqs of topics in those), show "→ [phase name]" rows. Click navigates.

4. **Connection density card:**
   - Header: "Connection density".
   - Four key-value rows: Prerequisites · Pairs-with · Related · Often confused — counts within this phase.
   - Footer link: "Open graph view →" navigates to `/graph` filtered to this phase.

---

## 7. Paths routes (`/paths`, `/path/:slug`)

(Driven by `content/_paths.json` from the content-depth plan.)

### `/paths` — catalog

Single column, max-width ~960px.

- Hero: title "Learning paths", description sentence, "5 curated sequences" mute meta.
- Card grid (2 columns desktop, 1 on mobile): each card shows audience eyebrow, title, description, topic-count + hours meta, and a small preview of the first 3 topics in the sequence. Clicking navigates to `/path/:slug`.

### `/path/:slug` — sequenced walk

Two-column.

**Main column:**

- Hero: path title, audience pill, hours estimate, description paragraph.
- "Sequence" section: vertical list of topic cards in the path's defined order, each numbered `01`…`0N`. Same card style as phase view. Each card also shows: prerequisite-from-earlier-in-path indicator if applicable. Cards link to `/topic/:slug` with a `?from-path=:slug` query param.

**Right rail:**

- Path progress card: ring across the path's topics + completion percentage.
- "Up next in this path" mini-block: the next incomplete topic with a "Start →" button.

When entering a topic from a path (`?from-path=` query param), the topic hero shows an additional "In path: [path name]" eyebrow and the next-topic-in-path is suggested at the bottom of the topic page.

---

## 8. `/whats-new` route

(Driven by `app/public/changelog.json` from the content-depth plan, Task 17.)

Single column, ~960px max.

- Hero: "What's new in iceberg", subtitle "Curriculum updates derived from the git history of `content/`."
- Entries list, newest first. Each entry:
  - Date (`2026-05-14`) + commit short SHA (mute, monospace) + commit message (bold first line).
  - "Touched topics" — chip list of slugs; each chip links to the topic.

---

## 9. Bookmarks (`/bookmarks`)

Single content column, max-width ~960px.

- Hero: "Bookmarks" title + count.
- Grouped by phase (collapsible sections that mirror the sidebar tree). Each section header has a chevron, the phase title, and a count.
- Inside each section, bookmarked topics are listed as standard topic cards (same style as phase view).
- Empty state: "No bookmarks yet. Bookmark a topic from its detail page to find it here."

---

## 10. Settings (`/settings`)

Single content column, max-width ~720px (narrower than other routes — settings is a form).

Sections (no sub-nav — single column):

- **Appearance**
  - Theme radio: Light · Dark · System (default System).
- **Data**
  - Export progress (JSON download).
  - Import progress (JSON upload + replace/merge confirm).
  - Clear all data (confirm dialog).
- **Keyboard shortcuts** — read-only list (⌘K search, / search, J/K to navigate sidebar, etc.).
- **About** — version, link to `/whats-new`, link to repository, license info.

---

## 11. Graph view (`/graph`)

Full-height canvas using `@xyflow/react` (already present).

### Layout

- Sidebar still visible on desktop (consistent shell).
- Main area: 280px right side-panel + fluid graph canvas.
- Filter chips along the top of the canvas: edge-type toggles (Prerequisite · Pairs-with · Related · Often-confused-with) + phase filter dropdown.

### Defaults

- On load, only `prerequisite` edges are visible; other edge-type chips are toggled off.
- Layout algorithm: directed force-directed (existing). Theme-aware node + edge palettes.

### Side panel (on node click)

- Topic title + DifficultyBadge.
- Summary.
- Per-resource progress ring.
- "Go to topic →" primary button.
- "Connections" mini-list grouped by edge type with reasoning excerpts.
- Closes via X or by clicking blank canvas.

### Query-param API

- `?focus=:slug` — pre-selects a node and opens the side panel.
- `?phase=:slug` — filters to topics in that phase + their direct connections.

---

## 12. Component specifications

### `DifficultyBadge` (small + large variants)

Props: `difficulty: "beginner" | "intermediate" | "advanced"`, `hours: number`, `size?: "sm" | "md"` (default `md`).

- `md`: pill ~22px tall, font 12px, padding `4px 10px`.
- `sm`: pill ~16px tall, font 10.5px, padding `2px 8px`.
- Color tokens per difficulty (border, background, text) come from theme tokens.

### `Pitfall` (numbered editorial list item)

- Grid: 34px numeral column + content column. Vertical 16px padding, separated by a 1px `--border-soft` rule between items (no rule above the first).
- No background, no tinted gradient, no left accent bar, no alert icon.
- Numeral: monospace `01`…`0N` in `--text-dim`, ~12px, tabular-nums.
- Title: semibold, ~14.5px, `--text`.
- Explanation: `--text-mute`, ~13.5px, line-height 1.6, max-width 620px for readability.
- Reads as a numbered editorial list, not a callout stack.

### `CodeExample` block

- Container: card-less (no border around the whole block), but the `<pre>` itself has dark `#0d0d11` background with a 1px `--border-soft` border.
- Above the pre: title (semibold, ~14px) + reasoning (mute italic, ~13px, 1 line).
- Code rendered by `shiki` with theme-switched themes:
  - Dark: `github-dark-default` (or token-configured alternative).
  - Light: `github-light`.
  - Theme is read from `<html data-theme>` and re-rendered on theme change.
- Horizontal scroll on overflow.
- Font: monospace, 12.5px, line-height 1.6.

### `ConnectionGroup` (typed connection section)

- Group header: edge-type pill (`Prerequisite` amber, `Pairs with` purple, `Related` blue, `Often confused with` pink) + a short mute description ("things to understand first", "studied alongside this topic", etc.).
- Connection card: title (semibold) + reasoning (mute, 1.5 line-height). Cards stacked with 6px gap inside the group.
- Cap: 8 cards per group. If exceeded, render a "Show N more" link that expands to show all.

### `ConnectionMap` (mini SVG graph)

- Pure SVG, ~260px tall, fits inside a 288px-wide card (320px rail − padding).
- Center node: current topic, filled `--accent`, 28px radius, 2-line title clipped if needed.
- Up to 8 connection nodes, 20–22px radius, positioned by a deterministic radial layout (prereqs upper-left, pairs-with top, related lower).
- Edges as `<line>` with `<marker>` arrows for prereqs.
- Edge color by type; pairs-with uses dashed strokes.
- Legend row below the SVG.
- "Open in graph view →" link below the legend.

### `PathStrip` (horizontal scroll on home)

- Horizontal `flex` row with `overflow-x: auto`, smooth scroll.
- Card width 280px, fixed.
- Show 3.5 cards on a typical viewport; hint at scrollability with the half-card on the right edge.

### `ActivityRow`

- Three-column flex row: icon column (16px) · message (flex-1) · timestamp (mute, monospace, right-aligned).
- Icons mapped per activity type (✓ checked, ● completed, ★ bookmarked).

---

## 13. Data model deltas

No new persistent state types are introduced by this redesign. All new render-time inputs are sourced from existing or content-depth-plan-introduced data:

- Difficulty + hours + narrative + pitfalls + codeExamples come from extended frontmatter.
- Paths come from `content/_paths.json`.
- Recent activity is derived from existing progress/bookmark stores (we extend the stores' subscribers to emit activity events into a new `localStorage.iceberg.activity[]` ring buffer, capped at 50 entries).

The `useChangelog` hook (from content-depth Task 17) is reused.

The existing `ProgressStore` / `BookmarkStore` / `NotesStore` interfaces are unchanged.

A new `ActivityStore` interface is added:

```ts
interface ActivityEntry {
  type: "completed" | "checked" | "bookmarked";
  topicSlug: string;
  resourceKey?: string;     // for "checked"
  resourceTitle?: string;
  topicTitle: string;
  at: number;               // ms epoch
}
interface ActivityStore {
  append(entry: Omit<ActivityEntry, "at">): void;
  recent(limit: number): ActivityEntry[];
  subscribe(listener: () => void): () => void;
}
```

Implementation: `LocalStorageActivityStore` mirroring the existing store pattern.

A new `ThemeStore` interface is added:

```ts
type ThemeMode = "light" | "dark" | "system";
interface ThemeStore {
  get(): ThemeMode;
  set(mode: ThemeMode): void;
  resolved(): "light" | "dark";    // mode === "system" ? system pref : mode
  subscribe(listener: () => void): () => void;
}
```

Implementation: `LocalStorageThemeStore`. Wires `data-theme` on `<html>`.

---

## 14. File-structure deltas (informational; the implementation plan will own this)

```
app/src/
  components/
    layout/
      Page.tsx                      (rewrite — new 2-pane shell)
      Sidebar.tsx                   (new — replaces PrimaryNav)
      Topbar.tsx                    (new)
      MainColumn.tsx                (new — wraps content + optional right rail)
      RightRail.tsx                 (new)
    interactive/
      JumpNav.tsx                   (new — sticky pill nav for topic view)
      ThemeToggle.tsx               (new)
    domain/
      DifficultyBadge.tsx           (new — also covered by content-depth Task 15)
      ConnectionGroup.tsx           (new — typed connection cards)
      ConnectionMap.tsx             (new — SVG mini-graph)
      PathStrip.tsx                 (new — also covered by content-depth Task 16)
      ActivityRow.tsx               (new)
      PhaseProgressCard.tsx         (new)
      ProgressRing.tsx              (new — reusable)
  stores/
    ThemeStore.ts                   (new)
    LocalStorageThemeStore.ts       (new)
    ActivityStore.ts                (new)
    LocalStorageActivityStore.ts    (new)
  hooks/
    useTheme.ts                     (new)
    useActivity.ts                  (new)
    useSectionObserver.ts           (new — drives JumpNav active state)
  routes/
    Home.tsx                        (rewrite — dashboard layout)
    Phase.tsx                       (rewrite — 2-col + right rail)
    Topic.tsx                       (rewrite — 2-col, jump nav, new sections)
    Bookmarks.tsx                   (rewrite — grouped by phase)
    Settings.tsx                    (rewrite — Appearance/Data/Shortcuts/About)
    Graph.tsx                       (rewrite — side panel, filters, theme palette)
    Paths.tsx                       (added by content-depth Task 16 — restyled to fit shell)
    Path.tsx                        (added by content-depth Task 16 — restyled)
    WhatsNew.tsx                    (added by content-depth Task 17 — restyled)
```

`DESIGN.md` will be rewritten separately by the project owner with the new token values. This spec assumes that rewrite happens in parallel and provides the *names* and *roles* of the tokens that components reference.

---

## 15. Acceptance criteria

A reviewer testing the implemented redesign should be able to:

1. Switch between Light, Dark, and System themes from Settings; all routes adapt; no raw hex colors visible in component source.
2. From any route, see the full curriculum at a glance in the sidebar — 9 phases, current phase auto-expanded, per-topic progress bars visible.
3. Land on `/`, see the Continue hero, recommended topics, learning paths, recent activity, and all phases — no manual navigation required to understand status.
4. On `/topic/idempotency`, see the new sections (In Depth, Pitfalls as a numbered editorial list, Code with syntax highlighting), use the sticky pill nav to jump between sections, see connections grouped by type with reasoning visible, see the mini connection-map in the right rail, and use the progress card to mark resources complete.
5. On `/phase/security-and-identity`, see topic cards with DifficultyBadges, the right-rail prereq/leads-into cards correctly reflect graph data, "Continue [next topic]" navigates correctly.
6. ⌘K opens search; typing "OWASP" returns the OWASP Authentication Cheat Sheet under Resources; clicking navigates to the topic with the article scrolled into view.
7. `/graph` opens with only prerequisite edges visible; clicking a node opens the side panel; "Go to topic" navigates correctly; theme switch flips the graph palette.
8. Completing a topic on `/topic/access-control` triggers the completion animation; the sidebar glyph flips to done; the home dashboard's Continue card updates.
9. The build passes `npm run typecheck && npm run build` and the production bundle renders without console errors.
10. No component renders a raw hex color value; all colors are CSS tokens.

---

## 16. Decisions log (for traceability)

- **Q1 metaphor:** D — hybrid (course-platform structure, dark-themed shell, away from manpage aesthetic).
- **Q2 sidebar contents:** C — pinned utility + curriculum tree.
- **Q3 topic node display:** C — title + glyph + thin progress bar.
- **Q4 breadcrumbs:** B — sidebar IS the breadcrumb; no text breadcrumbs.
- **Q5 topic right rail:** C — quiet right rail (progress + connection map); connections as featured main-column section.
- **Q6 phase view layout:** C — topic list + right rail with phase meta.
- **In-page nav:** C — sticky pill row with counts, topic view only.
- **"You are here" card:** B — replaced with typed mini-graph (`ConnectionMap`).
- **Home dashboard:** A — real dashboard (Continue, Progress, Recommended, Activity, Phases).
- **Motion:** B — restrained + completion moments.
- **Bookmarks:** b — grouped by phase. **Settings:** x — single column.
- **Search palette:** C — topics + phases + resources + connections.
- **Graph view:** a2 + b2 — side-panel-on-click + prereq-only default.
- **Light + dark mode:** required; token-based; graph palette flips.
- **Brand mark:** deferred (gradient-square placeholder); separate task.
- **Pitfalls treatment:** initial pick B (alert cards) replaced after mockup review with a quieter **numbered editorial list** — hairline-separated, monospace numerals, no accent bars or tints. Reason: alert-card pattern read as generic "AI-generated UI."
- **Code reasoning placement:** above the code block, italic mute.
- **Code themes:** shiki, `github-dark-default` (dark) / `github-light` (light), live-switching.

---

## 17. Open questions for the implementation plan

- Connection-map node layout for high-density topics (>8 connections): cap at 8 by weight (confirmed) but the radial-layout algorithm for arranging nodes around the center is unspecified. The implementation plan should pick a deterministic approach (e.g., divide circle by type group, then by weight).
- Activity ring buffer size: 50 entries is a reasonable default; revisit if profile of activity volume warrants.
- ⌘K result limits per group (Topics/Phases/Resources/Connections): default to 5 per group with a "show more" affordance — implementation plan to confirm.
