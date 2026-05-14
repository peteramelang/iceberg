# iceberg UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the iceberg app shell and every route as a dark+light-themed course-platform UI per `docs/superpowers/specs/2026-05-14-ui-redesign-design.md`.

**Architecture:** Token-based theming via CSS custom properties (`data-theme="light|dark"` on `<html>`). 260px persistent sidebar + 52px sticky topbar + per-route 2-column layouts (content + 320px right rail). Existing stores (`ProgressStore`, `BookmarkStore`, `NotesStore`) and the content loader are reused unchanged; two new stores (`ThemeStore`, `ActivityStore`) are added. The build is performed on a feature branch `ui-redesign-v2` and merged when complete.

**Tech Stack:** TypeScript, React 18, react-router-dom 6, Vite, Tailwind 3 (token-mapped to CSS vars), shiki (code highlighting), fuse.js (fuzzy search), @xyflow/react (graph), localStorage (persistence).

**Spec source:** `docs/superpowers/specs/2026-05-14-ui-redesign-design.md`.

**File structure (final state after this plan):**

```
app/
  index.html                                 (modify — preload theme attr to avoid FOUC)
  tailwind.config.ts                         (rewrite — token-mapped colors via CSS vars)
  src/
    main.tsx                                 (modify — mount ThemeProvider before App)
    App.tsx                                  (modify — add /path/:slug, mount within new Shell)
    styles/
      tokens.css                             (create — :root + [data-theme] token blocks)
      base.css                               (rewrite of current global.css equivalent)
    content/
      types.ts                               (no change — already has new fields)
      index.ts                               (no change)
    stores/
      ThemeStore.ts                          (create — interface)
      LocalStorageThemeStore.ts              (create — impl)
      ActivityStore.ts                       (create — interface)
      LocalStorageActivityStore.ts           (create — impl + ring buffer)
      index.ts                               (modify — export new stores)
      (existing stores unchanged)
    hooks/
      useTheme.ts                            (create)
      useActivity.ts                         (create)
      useSectionObserver.ts                  (create)
      useResolvedTheme.ts                    (create)
      (existing hooks unchanged)
    components/
      layout/
        Shell.tsx                            (create — replaces Page)
        Sidebar.tsx                          (create — replaces PrimaryNav)
        Topbar.tsx                           (create)
        MainColumn.tsx                       (create)
        RightRail.tsx                        (create)
        Head.tsx                             (unchanged — SEO helmet wrapper)
        Page.tsx                             (delete after Shell adopted)
        PrimaryNav.tsx                       (delete)
        Footer.tsx                           (delete)
        Section.tsx                          (delete — replaced by inline section markup)
        HairlineRule.tsx                     (delete)
        ListRow.tsx                          (delete)
        BracketList.tsx                      (delete)
      interactive/
        SearchPalette.tsx                    (rewrite — fuzzy + grouped + connections)
        JumpNav.tsx                          (create)
        ThemeToggle.tsx                      (create)
        BookmarkButton.tsx                   (rewrite for new tokens)
        MarkCompleteButton.tsx               (rewrite for new tokens)
        NotesField.tsx                       (rewrite for new tokens)
      domain/
        ProgressRing.tsx                     (create)
        DifficultyBadge.tsx                  (rewrite — sm + md variants, token-based)
        ConnectionGroup.tsx                  (create — replaces ConnectionSidebar)
        ConnectionMap.tsx                    (create — SVG mini-graph)
        Pitfalls.tsx                         (rewrite — numbered editorial list)
        CodeExamples.tsx                     (rewrite — shiki theme-switched, reasoning above)
        Narrative.tsx                        (rewrite — token-mapped paragraphs)
        PathStrip.tsx                        (rewrite — horizontal-scroll card row)
        PathCard.tsx                         (create)
        TopicCard.tsx                        (create — used by Phase, Bookmarks, Path)
        PhaseTile.tsx                        (create — home grid)
        ResourceRow.tsx                      (rewrite for new tokens, badge per kind)
        ActivityRow.tsx                      (create)
        ResumeHero.tsx                       (create — home Continue hero)
        ProgressMarker.tsx                   (rewrite — ○/◐/● glyph with sizes)
        ConnectionSidebar.tsx                (delete)
    routes/
      Home.tsx                               (rewrite)
      Phase.tsx                              (rewrite)
      Topic.tsx                              (rewrite)
      Bookmarks.tsx                          (rewrite)
      Settings.tsx                           (rewrite)
      Graph.tsx                              (rewrite)
      Paths.tsx                              (rewrite)
      Path.tsx                               (rewrite)
      WhatsNew.tsx                           (rewrite)
      Credits.tsx                            (rewrite)
    utils/
      fuzzyIndex.ts                          (rewrite — index topics + phases + resources + connections)
      activityHelpers.ts                     (create — formatRelative, eventFromProgress)
      pathHelpers.ts                         (create — order, prereq lookups)
      connectionHelpers.ts                   (create — by-type grouping, density)
```

**Operating notes for the implementing engineer:**

- Run from repo root unless otherwise stated. The app workspace is `npm run <script> --workspace=app`.
- Verification command after each meaningful task: `npm run typecheck --workspace=app && npm run build --workspace=app`.
- The content pipeline is **frozen** for this work. Do not modify anything under `content/`, `pipeline/`, or `scripts/`.
- `app/src/content/types.ts` already contains the full schema including `narrative`, `pitfalls`, `codeExamples`, `difficulty`, `estimatedHours`, and `paths`. Do not modify it.
- Commits are small and frequent. Each task ends with a commit step.
- Branch lives only on local + remote `ui-redesign-v2`; merging to `main` is out of scope for this plan.
- **Never write raw hex values inside `src/**`** after Task 2 lands. All colors must be token references (`var(--…)` or Tailwind class mapped to a token).

**Phase structure:**

- **Phase A — Foundation (Tasks 1-6):** branch, tokens, Tailwind, theming, base CSS, two new stores, hooks.
- **Phase B — Shell (Tasks 7-11):** Sidebar, Topbar, Shell, JumpNav, search palette.
- **Phase C — Primitives (Tasks 12-19):** ProgressRing, DifficultyBadge, Pitfalls, CodeExamples, ConnectionGroup, ConnectionMap, TopicCard, ResourceRow.
- **Phase D — Routes (Tasks 20-27):** Home, Phase, Topic, Paths, Path, Bookmarks, Settings, WhatsNew + Credits, Graph.
- **Phase E — Cleanup & ship (Tasks 28-30):** delete dead files, accessibility/keyboard pass, final verification + push.

---

## Phase A — Foundation

### Task 1: Create feature branch

**Files:** none (git state only).

- [ ] **Step 1: Confirm clean working tree**

Run: `git status --short`
Expected: empty output (no uncommitted changes). If output is non-empty, stop and ask the user before continuing.

- [ ] **Step 2: Create and switch to `ui-redesign-v2`**

Run: `git switch -c ui-redesign-v2`
Expected: "Switched to a new branch 'ui-redesign-v2'".

- [ ] **Step 3: Push branch to origin and set upstream**

Run: `git push -u origin ui-redesign-v2`
Expected: branch published.

---

### Task 2: Create design tokens CSS

**Files:**
- Create: `app/src/styles/tokens.css`

- [ ] **Step 1: Write the tokens file**

Create `app/src/styles/tokens.css` with the exact content:

```css
/* Design tokens — see docs/superpowers/specs/2026-05-14-ui-redesign-design.md §1. */

:root,
[data-theme="dark"] {
  --bg: #0a0a0c;
  --panel: #111114;
  --panel-2: #16161b;
  --panel-3: #1c1c22;
  --border: #26262e;
  --border-soft: #1d1d24;
  --text: #e8e8ee;
  --text-mute: #9a9aa6;
  --text-dim: #686874;
  --accent: #7c5cff;
  --accent-hover: #9377ff;
  --accent-soft: rgba(124, 92, 255, 0.16);
  --green: #30d158;
  --amber: #ff9f0a;
  --blue: #5ac8fa;
  --pink: #ff6b9d;
  --danger: #ff5c5c;
  --radius: 10px;
  --radius-sm: 6px;
  --shadow-card: 0 1px 0 rgba(255, 255, 255, 0.02) inset;

  /* Connection edge palette */
  --edge-prereq: var(--amber);
  --edge-pairs: var(--accent);
  --edge-related: var(--blue);
  --edge-confused: var(--pink);

  color-scheme: dark;
}

[data-theme="light"] {
  --bg: #fbfbfd;
  --panel: #ffffff;
  --panel-2: #f3f4f8;
  --panel-3: #e8eaf0;
  --border: #d8dae3;
  --border-soft: #e8eaf0;
  --text: #1c1c22;
  --text-mute: #5b5e6a;
  --text-dim: #8a8c98;
  --accent: #5b3df5;
  --accent-hover: #4528d3;
  --accent-soft: rgba(91, 61, 245, 0.12);
  --green: #128a35;
  --amber: #b76b06;
  --blue: #0a6db8;
  --pink: #c01e6a;
  --danger: #c0291d;
  --shadow-card: 0 1px 2px rgba(20, 22, 30, 0.04);

  --edge-prereq: var(--amber);
  --edge-pairs: var(--accent);
  --edge-related: var(--blue);
  --edge-confused: var(--pink);

  color-scheme: light;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/styles/tokens.css
git commit -m "tokens: dark + light theme CSS custom properties"
```

---

### Task 3: Rewrite Tailwind config to map tokens

**Files:**
- Modify: `app/tailwind.config.ts`

- [ ] **Step 1: Replace the contents**

Replace the file with:

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        "panel-3": "var(--panel-3)",
        border: "var(--border)",
        "border-soft": "var(--border-soft)",
        text: "var(--text)",
        "text-mute": "var(--text-mute)",
        "text-dim": "var(--text-dim)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        green: "var(--green)",
        amber: "var(--amber)",
        blue: "var(--blue)",
        pink: "var(--pink)",
        danger: "var(--danger)"
      },
      borderColor: {
        DEFAULT: "var(--border)"
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Inter"', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', '"SFMono-Regular"', 'Menlo', 'monospace']
      },
      fontSize: {
        "display-xl": ["30px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-lg": ["24px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "title": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body": ["14px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-strong": ["14px", { lineHeight: "1.55", fontWeight: "500" }],
        "caption": ["12.5px", { lineHeight: "1.5", fontWeight: "400" }],
        "label": ["11.5px", { lineHeight: "1.4", letterSpacing: "0.12em", fontWeight: "600" }]
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        xxl: "32px"
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "12px",
        pill: "9999px"
      },
      boxShadow: {
        card: "var(--shadow-card)"
      }
    }
  }
} satisfies Config;
```

- [ ] **Step 2: Commit**

```bash
git add app/tailwind.config.ts
git commit -m "tailwind: token-mapped color palette and typographic scale"
```

---

### Task 4: Rewrite global base CSS

**Files:**
- Modify: `app/src/styles/global.css` (locate the existing global stylesheet; it is imported from `app/src/main.tsx`. If named differently, rename accordingly.)

- [ ] **Step 1: Verify file path**

Run: `grep -RE "import .*styles" app/src/main.tsx`
Note the exact filename for use below.

- [ ] **Step 2: Replace the file contents with**

```css
@import "./tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root {
    background: var(--bg);
    color: var(--text);
    min-height: 100%;
  }
  body {
    font-family: theme(fontFamily.sans);
    font-size: 14px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  a { color: inherit; text-decoration: none; }
  a:hover { color: var(--text); }
  *, *::before, *::after { box-sizing: border-box; }
  ::selection { background: var(--accent-soft); color: var(--text); }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  .backdrop-blur-bar {
    background: color-mix(in oklab, var(--bg) 78%, transparent);
    backdrop-filter: saturate(140%) blur(8px);
    -webkit-backdrop-filter: saturate(140%) blur(8px);
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build --workspace=app`
Expected: build succeeds. (Routes still rendering with the old Tailwind classes will look broken — that's OK; we replace them in Phase D.)

- [ ] **Step 4: Commit**

```bash
git add app/src/styles/global.css
git commit -m "css: token-driven base styles + scrollbar/backdrop utilities"
```

---

### Task 5: Add ThemeStore

**Files:**
- Create: `app/src/stores/ThemeStore.ts`
- Create: `app/src/stores/LocalStorageThemeStore.ts`
- Modify: `app/src/stores/index.ts`

- [ ] **Step 1: Create `ThemeStore.ts`**

```ts
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeStore {
  get(): ThemeMode;
  set(mode: ThemeMode): void;
  resolved(): ResolvedTheme;
  subscribe(listener: () => void): () => void;
}
```

- [ ] **Step 2: Create `LocalStorageThemeStore.ts`**

```ts
import type { ThemeStore, ThemeMode, ResolvedTheme } from "./ThemeStore.js";

const KEY = "iceberg.theme";
const VALID: ThemeMode[] = ["light", "dark", "system"];

function readMode(): ThemeMode {
  if (typeof localStorage === "undefined") return "system";
  const raw = localStorage.getItem(KEY);
  return raw && (VALID as string[]).includes(raw) ? (raw as ThemeMode) : "system";
}

function systemPref(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export class LocalStorageThemeStore implements ThemeStore {
  private listeners = new Set<() => void>();
  private mq: MediaQueryList | null;
  private mqListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    this.mq = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
    if (this.mq) {
      this.mqListener = () => { this.applyHtmlAttr(); this.emit(); };
      this.mq.addEventListener("change", this.mqListener);
    }
    this.applyHtmlAttr();
  }

  get(): ThemeMode { return readMode(); }

  set(mode: ThemeMode): void {
    localStorage.setItem(KEY, mode);
    this.applyHtmlAttr();
    this.emit();
  }

  resolved(): ResolvedTheme {
    const mode = this.get();
    return mode === "system" ? systemPref() : mode;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }

  private applyHtmlAttr(): void {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", this.resolved());
  }
}
```

- [ ] **Step 3: Export from `stores/index.ts`**

Open `app/src/stores/index.ts`. Add at the end:

```ts
import { LocalStorageThemeStore } from "./LocalStorageThemeStore.js";
export const themeStore = new LocalStorageThemeStore();
export type { ThemeMode, ResolvedTheme, ThemeStore } from "./ThemeStore.js";
```

- [ ] **Step 4: Inline-init theme in `index.html`**

Open `app/index.html`. Inside `<head>`, before any `<script>` or stylesheet link, add:

```html
<script>
  (function () {
    try {
      var m = localStorage.getItem("iceberg.theme") || "system";
      var resolved = (m === "system")
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : m;
      document.documentElement.setAttribute("data-theme", resolved);
    } catch (e) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  })();
</script>
```

This prevents a theme flash on first paint.

- [ ] **Step 5: Verify build**

Run: `npm run build --workspace=app`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/src/stores/ThemeStore.ts app/src/stores/LocalStorageThemeStore.ts app/src/stores/index.ts app/index.html
git commit -m "store: ThemeStore + light/dark/system mode (no FOUC)"
```

---

### Task 6: Add ActivityStore + hooks

**Files:**
- Create: `app/src/stores/ActivityStore.ts`
- Create: `app/src/stores/LocalStorageActivityStore.ts`
- Create: `app/src/hooks/useTheme.ts`
- Create: `app/src/hooks/useResolvedTheme.ts`
- Create: `app/src/hooks/useActivity.ts`
- Create: `app/src/hooks/useSectionObserver.ts`
- Create: `app/src/utils/activityHelpers.ts`
- Modify: `app/src/stores/index.ts`

- [ ] **Step 1: Create `ActivityStore.ts`**

```ts
export type ActivityType = "completed" | "checked" | "bookmarked" | "unbookmarked";

export interface ActivityEntry {
  type: ActivityType;
  topicSlug: string;
  topicTitle: string;
  resourceKey?: string;
  resourceTitle?: string;
  at: number;
}

export interface ActivityStore {
  append(entry: Omit<ActivityEntry, "at">): void;
  recent(limit: number): ActivityEntry[];
  clear(): void;
  subscribe(listener: () => void): () => void;
}
```

- [ ] **Step 2: Create `LocalStorageActivityStore.ts`**

```ts
import type { ActivityStore, ActivityEntry } from "./ActivityStore.js";

const KEY = "iceberg.activity";
const MAX = 50;

function read(): ActivityEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch { return []; }
}

function isEntry(x: unknown): x is ActivityEntry {
  return !!x && typeof x === "object"
    && typeof (x as ActivityEntry).type === "string"
    && typeof (x as ActivityEntry).topicSlug === "string"
    && typeof (x as ActivityEntry).at === "number";
}

export class LocalStorageActivityStore implements ActivityStore {
  private listeners = new Set<() => void>();

  append(entry: Omit<ActivityEntry, "at">): void {
    const list = read();
    list.unshift({ ...entry, at: Date.now() });
    while (list.length > MAX) list.pop();
    localStorage.setItem(KEY, JSON.stringify(list));
    this.emit();
  }

  recent(limit: number): ActivityEntry[] {
    return read().slice(0, Math.max(0, limit));
  }

  clear(): void {
    localStorage.removeItem(KEY);
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void { for (const l of this.listeners) l(); }
}
```

- [ ] **Step 3: Export from `stores/index.ts`**

Append:

```ts
import { LocalStorageActivityStore } from "./LocalStorageActivityStore.js";
export const activityStore = new LocalStorageActivityStore();
export type { ActivityEntry, ActivityStore, ActivityType } from "./ActivityStore.js";
```

- [ ] **Step 4: Create `useTheme.ts`**

```ts
import { useSyncExternalStore } from "react";
import { themeStore } from "../stores/index.js";
import type { ThemeMode } from "../stores/index.js";

export function useTheme(): { mode: ThemeMode; set: (m: ThemeMode) => void } {
  const mode = useSyncExternalStore(
    listener => themeStore.subscribe(listener),
    () => themeStore.get(),
    () => "system" as ThemeMode
  );
  return { mode, set: m => themeStore.set(m) };
}
```

- [ ] **Step 5: Create `useResolvedTheme.ts`**

```ts
import { useSyncExternalStore } from "react";
import { themeStore } from "../stores/index.js";
import type { ResolvedTheme } from "../stores/index.js";

export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    listener => themeStore.subscribe(listener),
    () => themeStore.resolved(),
    () => "dark" as ResolvedTheme
  );
}
```

- [ ] **Step 6: Create `useActivity.ts`**

```ts
import { useSyncExternalStore } from "react";
import { activityStore } from "../stores/index.js";
import type { ActivityEntry } from "../stores/index.js";

export function useActivity(limit = 5): ActivityEntry[] {
  return useSyncExternalStore(
    listener => activityStore.subscribe(listener),
    () => activityStore.recent(limit),
    () => [] as ActivityEntry[]
  );
}
```

- [ ] **Step 7: Create `useSectionObserver.ts`**

```ts
import { useEffect, useState } from "react";

export function useSectionObserver(ids: string[], offsetTop = 120): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || ids.length === 0) return;
    const els = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: `-${offsetTop}px 0px -55% 0px`, threshold: 0 }
    );
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [ids.join("|"), offsetTop]);

  return active;
}
```

- [ ] **Step 8: Create `utils/activityHelpers.ts`**

```ts
export function formatRelative(at: number, now: number = Date.now()): string {
  const diffSec = Math.floor((now - at) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "yesterday";
  if (diffD < 7) return `${diffD} d ago`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `${diffW} w ago`;
  return new Date(at).toISOString().slice(0, 10);
}
```

- [ ] **Step 9: Verify build**

Run: `npm run typecheck --workspace=app && npm run build --workspace=app`
Expected: passes.

- [ ] **Step 10: Commit**

```bash
git add app/src/stores/ActivityStore.ts app/src/stores/LocalStorageActivityStore.ts app/src/stores/index.ts app/src/hooks/useTheme.ts app/src/hooks/useResolvedTheme.ts app/src/hooks/useActivity.ts app/src/hooks/useSectionObserver.ts app/src/utils/activityHelpers.ts
git commit -m "store: ActivityStore (ring 50) + theme/section-observer hooks"
```

---

## Phase B — Shell

### Task 7: Build Topbar component

**Files:**
- Create: `app/src/components/layout/Topbar.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from "react";
import { useResolvedTheme } from "../../hooks/useResolvedTheme.js";
import { themeStore } from "../../stores/index.js";

export function Topbar({
  topicsCompleted,
  topicsTotal,
  onOpenSearch,
  onToggleSidebar
}: {
  topicsCompleted: number;
  topicsTotal: number;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}) {
  const theme = useResolvedTheme();
  const [hover, setHover] = useState(false);
  return (
    <header className="sticky top-0 z-30 h-[52px] flex items-center gap-md px-xl border-b border-border-soft bg-bg">
      {onToggleSidebar && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onToggleSidebar}
          className="md:hidden h-8 w-8 rounded-sm flex items-center justify-center hover:bg-panel-2 text-text-mute"
        >
          ☰
        </button>
      )}
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex-1 max-w-[420px] h-8 px-md rounded-sm border border-border bg-panel-2 text-text-mute text-body flex items-center gap-sm hover:border-border hover:text-text"
        aria-label="Open search palette"
      >
        <span>⌕</span>
        <span className="truncate">Search topics, resources, connections…</span>
        <span className="ml-auto font-mono text-caption border border-border rounded-sm px-xs text-text-dim">⌘K</span>
      </button>
      <div className="ml-auto flex items-center gap-md text-text-mute text-caption">
        <span className="tabular-nums">{topicsCompleted} / {topicsTotal} topics</span>
        <button
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => themeStore.set(theme === "dark" ? "light" : "dark")}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="h-8 w-8 rounded-sm flex items-center justify-center hover:bg-panel-2 hover:text-text"
        >
          {theme === "dark" ? "☼" : "☾"}
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/layout/Topbar.tsx
git commit -m "shell: Topbar with search trigger, counter, and theme toggle"
```

---

### Task 8: Build Sidebar component

**Files:**
- Create: `app/src/components/layout/Sidebar.tsx`
- Create: `app/src/components/domain/ProgressMarker.tsx` (rewrite of existing)

- [ ] **Step 1: Rewrite `ProgressMarker.tsx`**

```tsx
export function ProgressMarker({
  state,
  size = 10
}: {
  state: "empty" | "partial" | "done";
  size?: number;
}) {
  const px = `${size}px`;
  const style: React.CSSProperties = { width: px, height: px };
  if (state === "done") {
    return <span style={style} className="inline-block rounded-full bg-green" aria-label="completed" />;
  }
  if (state === "partial") {
    return (
      <span
        style={{ ...style, background: "conic-gradient(var(--accent) 0 60%, transparent 60%)", border: "1.5px solid var(--accent)" }}
        className="inline-block rounded-full"
        aria-label="in progress"
      />
    );
  }
  return <span style={style} className="inline-block rounded-full border-[1.5px] border-text-dim" aria-label="not started" />;
}
```

- [ ] **Step 2: Create `Sidebar.tsx`**

```tsx
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { taxonomy, topics } from "../../content/index.js";
import { progressStore } from "../../stores/index.js";
import { useStoreSubscription } from "../../hooks/useStoreSubscription.js";
import { ProgressMarker } from "../domain/ProgressMarker.js";

function totalResourcesFor(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const location = useLocation();
  const currentTopicSlug = useMemo(() => {
    const m = location.pathname.match(/^\/topic\/([^/]+)/);
    return m && m[1] ? m[1] : null;
  }, [location.pathname]);
  const currentPhaseFromPath = useMemo(() => {
    const m = location.pathname.match(/^\/phase\/([^/]+)/);
    return m && m[1] ? m[1] : null;
  }, [location.pathname]);
  const currentPhase = useMemo(() => {
    if (currentPhaseFromPath) return currentPhaseFromPath;
    if (currentTopicSlug) {
      const t = topics.find(x => x.frontmatter.slug === currentTopicSlug);
      return t?.frontmatter.phase ?? null;
    }
    return null;
  }, [currentPhaseFromPath, currentTopicSlug]);

  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set());
  const togglePhase = (slug: string) => setManualExpanded(prev => {
    const next = new Set(prev);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    return next;
  });

  if (!taxonomy) return null;
  const phases = [...taxonomy.phases].sort((a, b) => a.order - b.order);

  return (
    <aside className="w-[260px] shrink-0 bg-panel border-r border-border h-[100dvh] sticky top-0 overflow-y-auto scrollbar-thin">
      <div className="h-[52px] flex items-center gap-sm px-lg border-b border-border-soft">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-sm font-semibold tracking-tight text-text">
          <span aria-hidden className="inline-block w-[22px] h-[22px] rounded-[6px]" style={{ background: "linear-gradient(135deg, var(--accent), var(--blue))" }} />
          iceberg
        </NavLink>
      </div>

      <nav className="py-sm" aria-label="Primary">
        <SidebarItem to="/" label="Continue" onNavigate={onNavigate} icon="◐" exact />
        <SidebarItem to="/bookmarks" label="Bookmarks" onNavigate={onNavigate} icon="★" />
        <SidebarItem to="/paths" label="Paths" onNavigate={onNavigate} icon="⇢" />
        <SidebarItem to="/whats-new" label="What's new" onNavigate={onNavigate} icon="✦" />
        <SidebarItem to="/graph" label="Graph" onNavigate={onNavigate} icon="⟁" />
        <SidebarItem to="/settings" label="Settings" onNavigate={onNavigate} icon="⚙" />
      </nav>

      <div className="px-lg py-sm text-label text-text-dim uppercase">Curriculum</div>

      <ul className="pb-xl">
        {phases.map(phase => {
          const isOpen = manualExpanded.has(phase.slug) || phase.slug === currentPhase;
          const phaseTopics = phase.topics;
          const completed = phaseTopics.filter(s => progressStore.getTopicProgress(s).completed).length;
          return (
            <li key={phase.slug}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => togglePhase(phase.slug)}
                className={[
                  "w-full text-left flex items-center gap-sm px-lg py-[7px] text-body hover:bg-panel-2",
                  phase.slug === currentPhase ? "bg-panel-2 text-text" : "text-text-mute"
                ].join(" ")}
              >
                <span className="text-text-dim text-[10px] w-[12px] inline-block">{isOpen ? "▾" : "▸"}</span>
                <span className="flex-1 truncate">{phase.title}</span>
                <span className="text-text-dim text-caption tabular-nums">{completed} / {phaseTopics.length}</span>
              </button>
              {isOpen && (
                <ul>
                  {phaseTopics.map(slug => {
                    const t = topics.find(x => x.frontmatter.slug === slug)?.frontmatter;
                    if (!t) return null;
                    const prog = progressStore.getTopicProgress(slug);
                    const total = totalResourcesFor(slug);
                    const checked = Object.values(prog.resources).filter(Boolean).length;
                    const state: "empty" | "partial" | "done" = prog.completed ? "done" : checked > 0 ? "partial" : "empty";
                    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
                    const active = currentTopicSlug === slug;
                    return (
                      <li key={slug}>
                        <NavLink
                          to={`/topic/${slug}`}
                          onClick={onNavigate}
                          className={[
                            "block pl-[38px] pr-lg py-[6px] border-l-2",
                            active ? "border-accent bg-panel-2 text-text" : "border-transparent text-text-mute hover:text-text hover:bg-panel-2"
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-sm text-caption">
                            <ProgressMarker state={state} />
                            <span className="truncate">{t.title}</span>
                          </div>
                          <div className="ml-[17px] mt-[5px] h-[2px] bg-border-soft rounded-pill overflow-hidden">
                            <div
                              className={state === "done" ? "h-full bg-green" : "h-full bg-accent"}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function SidebarItem({
  to, label, icon, onNavigate, exact
}: { to: string; label: string; icon: string; onNavigate?: () => void; exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onNavigate}
      className={({ isActive }) => [
        "flex items-center gap-sm px-lg py-[7px] text-body border-l-2",
        isActive ? "border-accent bg-panel-2 text-text" : "border-transparent text-text-mute hover:text-text hover:bg-panel-2"
      ].join(" ")}
    >
      <span className="w-4 inline-flex justify-center text-text-dim" aria-hidden>{icon}</span>
      {label}
    </NavLink>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run typecheck --workspace=app`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/domain/ProgressMarker.tsx app/src/components/layout/Sidebar.tsx
git commit -m "shell: Sidebar with utility nav + auto-expanded phase tree"
```

---

### Task 9: Build Shell + MainColumn + RightRail

**Files:**
- Create: `app/src/components/layout/Shell.tsx`
- Create: `app/src/components/layout/MainColumn.tsx`
- Create: `app/src/components/layout/RightRail.tsx`

- [ ] **Step 1: Create `MainColumn.tsx`**

```tsx
import type { ReactNode } from "react";

export function MainColumn({ children, maxWidth = "max-w-[720px]" }: { children: ReactNode; maxWidth?: string }) {
  return <div className={`min-w-0 ${maxWidth} w-full`}>{children}</div>;
}
```

- [ ] **Step 2: Create `RightRail.tsx`**

```tsx
import type { ReactNode } from "react";

export function RightRail({ children }: { children: ReactNode }) {
  return (
    <aside className="hidden lg:flex flex-col gap-lg w-[320px] shrink-0">
      {children}
    </aside>
  );
}

export function RailCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="bg-panel border border-border-soft rounded p-lg">
      {title && <h4 className="text-label text-text-dim uppercase mb-md">{title}</h4>}
      {children}
    </section>
  );
}
```

- [ ] **Step 3: Create `Shell.tsx`**

```tsx
import { useCallback, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { SearchPalette } from "../interactive/SearchPalette.js";
import { taxonomy, topics } from "../../content/index.js";
import { progressStore } from "../../stores/index.js";
import { useStoreSubscription } from "../../hooks/useStoreSubscription.js";

export function Shell({ children }: { children: ReactNode }) {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const totalResourcesPerTopic: Record<string, number> = {};
  for (const t of topics) {
    const fm = t.frontmatter;
    totalResourcesPerTopic[fm.slug] =
      (fm.resources.videos.short ? 1 : 0)
      + (fm.resources.videos.long ? 1 : 0)
      + fm.resources.articles.length
      + fm.resources.services.length
      + fm.resources.courses.length;
  }
  const overall = progressStore.getOverallProgress(totalResourcesPerTopic);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeDrawer = useCallback(() => setDrawer(false), []);

  return (
    <div className="min-h-[100dvh] flex bg-bg text-text">
      <div className="hidden md:block"><Sidebar /></div>
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <div className="absolute left-0 top-0 h-full"><Sidebar onNavigate={closeDrawer} /></div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          topicsCompleted={overall.completedTopics}
          topicsTotal={taxonomy?.phases.reduce((acc, p) => acc + p.topics.length, 0) ?? 0}
          onOpenSearch={openSearch}
          onToggleSidebar={() => setDrawer(true)}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 4: Verify build (will fail until SearchPalette is rewritten)**

We'll wire `SearchPalette` in Task 11. For now, comment out the import + `<SearchPalette>` line, or temporarily stub. Add this stub at the bottom of `Shell.tsx`:

Actually, simpler — temporarily replace the `SearchPalette` import + usage with a no-op:

Replace
```tsx
import { SearchPalette } from "../interactive/SearchPalette.js";
```
with
```tsx
function SearchPalette(_: { open: boolean; onClose: () => void }) { return null; }
```

We restore the real import in Task 11.

Run: `npm run typecheck --workspace=app`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add app/src/components/layout/Shell.tsx app/src/components/layout/MainColumn.tsx app/src/components/layout/RightRail.tsx
git commit -m "shell: Shell + MainColumn + RightRail (search stubbed)"
```

---

### Task 10: Build JumpNav

**Files:**
- Create: `app/src/components/interactive/JumpNav.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useSectionObserver } from "../../hooks/useSectionObserver.js";

export interface JumpPill {
  id: string;
  label: string;
  count?: number;
}

export function JumpNav({ pills, offsetTop = 120 }: { pills: JumpPill[]; offsetTop?: number }) {
  const active = useSectionObserver(pills.map(p => p.id), offsetTop);

  const onClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offsetTop + 1;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="Sections" className="sticky top-[52px] z-20 -mx-xs px-xs py-sm backdrop-blur-bar border-b border-border-soft">
      <div className="flex flex-wrap gap-xs">
        {pills.map(p => {
          const isActive = active === p.id;
          return (
            <a
              key={p.id}
              href={`#${p.id}`}
              onClick={onClick(p.id)}
              className={[
                "inline-flex items-center gap-xs px-md py-[5px] rounded-pill text-caption whitespace-nowrap border",
                isActive
                  ? "bg-accent border-accent text-white"
                  : "border-border text-text-mute hover:text-text hover:border-text-dim"
              ].join(" ")}
            >
              <span>{p.label}</span>
              {typeof p.count === "number" && (
                <span className={isActive ? "text-white/70 text-[11px] tabular-nums" : "text-text-dim text-[11px] tabular-nums"}>{p.count}</span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/interactive/JumpNav.tsx
git commit -m "interactive: JumpNav sticky pill section navigator"
```

---

### Task 11: Rewrite SearchPalette + fuzzy index

**Files:**
- Rewrite: `app/src/utils/fuzzyIndex.ts`
- Rewrite: `app/src/components/interactive/SearchPalette.tsx`
- Modify: `app/src/components/layout/Shell.tsx` (restore real import)
- Modify: `app/package.json` (ensure fuse.js installed; if absent, add)

- [ ] **Step 1: Ensure fuse.js dependency**

Run: `npm ls fuse.js --workspace=app`
If missing, run: `npm install --workspace=app fuse.js@^7.0.0`

- [ ] **Step 2: Rewrite `app/src/utils/fuzzyIndex.ts`**

```ts
import Fuse from "fuse.js";
import { taxonomy, topics, connections, paths } from "../content/index.js";

export type SearchKind = "topic" | "phase" | "resource" | "connection" | "path";

export interface SearchItem {
  kind: SearchKind;
  id: string;          // unique key for React
  title: string;
  subtitle: string;    // parent topic / phase / "type"
  text: string;        // searchable haystack
  href: string;
  badge?: string;
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  if (taxonomy) {
    for (const phase of taxonomy.phases) {
      items.push({
        kind: "phase",
        id: `phase:${phase.slug}`,
        title: phase.title,
        subtitle: "Phase",
        text: `${phase.title} ${phase.description}`,
        href: `/phase/${phase.slug}`
      });
    }
  }

  for (const t of topics) {
    const fm = t.frontmatter;
    items.push({
      kind: "topic",
      id: `topic:${fm.slug}`,
      title: fm.title,
      subtitle: taxonomy?.phases.find(p => p.slug === fm.phase)?.title ?? fm.phase,
      text: `${fm.title} ${fm.summary} ${fm.definition} ${fm.slug}`,
      href: `/topic/${fm.slug}`,
      badge: fm.difficulty
    });

    const phaseTitle = taxonomy?.phases.find(p => p.slug === fm.phase)?.title ?? fm.phase;
    if (fm.resources.videos.short) {
      const v = fm.resources.videos.short;
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:videos.short`,
        title: v.title,
        subtitle: `Video · in ${fm.title}`,
        text: `${v.title} ${v.author} ${fm.title} ${phaseTitle}`,
        href: `/topic/${fm.slug}#videos`,
        badge: "Video"
      });
    }
    if (fm.resources.videos.long) {
      const v = fm.resources.videos.long;
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:videos.long`,
        title: v.title,
        subtitle: `Video · in ${fm.title}`,
        text: `${v.title} ${v.author} ${fm.title} ${phaseTitle}`,
        href: `/topic/${fm.slug}#videos`,
        badge: "Video"
      });
    }
    fm.resources.articles.forEach((a, i) => {
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:articles.${i}`,
        title: a.title,
        subtitle: `Article · in ${fm.title}`,
        text: `${a.title} ${a.publisher ?? ""} ${a.author ?? ""} ${fm.title}`,
        href: `/topic/${fm.slug}#articles`,
        badge: "Article"
      });
    });
    fm.resources.services.forEach((s, i) => {
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:services.${i}`,
        title: s.name,
        subtitle: `Service · in ${fm.title}`,
        text: `${s.name} ${s.vendor ?? ""} ${s.category} ${fm.title}`,
        href: `/topic/${fm.slug}#services`,
        badge: "Service"
      });
    });
    fm.resources.courses.forEach((c, i) => {
      items.push({
        kind: "resource",
        id: `res:${fm.slug}:courses.${i}`,
        title: c.title,
        subtitle: `Course · in ${fm.title}`,
        text: `${c.title} ${c.provider} ${fm.title}`,
        href: `/topic/${fm.slug}#courses`,
        badge: "Course"
      });
    });
  }

  for (const p of paths) {
    items.push({
      kind: "path",
      id: `path:${p.slug}`,
      title: p.title,
      subtitle: `Path · ${p.audience}`,
      text: `${p.title} ${p.description} ${p.audience}`,
      href: `/path/${p.slug}`
    });
  }

  const titleBySlug = new Map<string, string>();
  for (const t of topics) titleBySlug.set(t.frontmatter.slug, t.frontmatter.title);
  for (const e of connections) {
    const fromTitle = titleBySlug.get(e.from) ?? e.from;
    const toTitle = titleBySlug.get(e.to) ?? e.to;
    items.push({
      kind: "connection",
      id: `conn:${e.from}-${e.type}-${e.to}`,
      title: `${fromTitle} → ${toTitle}`,
      subtitle: `${e.type.replace("-", " ")} connection`,
      text: `${fromTitle} ${toTitle} ${e.type} ${e.reasoning}`,
      href: `/topic/${e.from}#connections`,
      badge: e.type
    });
  }

  return items;
}

let _fuse: Fuse<SearchItem> | null = null;
let _items: SearchItem[] = [];

export function getFuse(): { fuse: Fuse<SearchItem>; items: SearchItem[] } {
  if (!_fuse) {
    _items = buildIndex();
    _fuse = new Fuse(_items, {
      keys: [
        { name: "title", weight: 0.6 },
        { name: "text", weight: 0.4 }
      ],
      threshold: 0.38,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2
    });
  }
  return { fuse: _fuse, items: _items };
}
```

- [ ] **Step 3: Rewrite `SearchPalette.tsx`**

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFuse, type SearchItem, type SearchKind } from "../../utils/fuzzyIndex.js";

const KIND_LABEL: Record<SearchKind, string> = {
  topic: "Topics",
  phase: "Phases",
  path: "Paths",
  resource: "Resources",
  connection: "Connections"
};
const KIND_ORDER: SearchKind[] = ["topic", "phase", "path", "resource", "connection"];
const LIMIT_PER_GROUP = 5;

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) {
          window.dispatchEvent(new CustomEvent("iceberg-open-search"));
        }
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    if (q.trim().length < 2) {
      const { items } = getFuse();
      const topicsOnly = items.filter(i => i.kind === "topic").slice(0, 8);
      return { topic: topicsOnly, phase: [], path: [], resource: [], connection: [] } as Record<SearchKind, SearchItem[]>;
    }
    const { fuse } = getFuse();
    const hits = fuse.search(q, { limit: 80 }).map(r => r.item);
    const out: Record<SearchKind, SearchItem[]> = { topic: [], phase: [], path: [], resource: [], connection: [] };
    for (const h of hits) {
      if (out[h.kind].length < LIMIT_PER_GROUP) out[h.kind].push(h);
    }
    return out;
  }, [q]);

  const flat = useMemo(() => KIND_ORDER.flatMap(k => grouped[k]), [grouped]);

  const select = (item: SearchItem) => {
    onClose();
    navigate(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter")     { const it = flat[activeIdx]; if (it) { e.preventDefault(); select(it); } }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[min(640px,calc(100vw-32px))] bg-panel border border-border rounded-lg shadow-card overflow-hidden">
        <input
          ref={inputRef}
          value={q}
          onChange={e => { setQ(e.target.value); setActiveIdx(0); }}
          onKeyDown={onKeyDown}
          placeholder="Search topics, resources, connections…"
          className="w-full h-12 px-lg bg-transparent text-text outline-none border-b border-border-soft text-body"
          aria-label="Search query"
        />
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {flat.length === 0 && (
            <div className="px-lg py-md text-text-mute text-body">No results.</div>
          )}
          {KIND_ORDER.map(kind => {
            const group = grouped[kind];
            if (group.length === 0) return null;
            return (
              <div key={kind} className="py-xs">
                <div className="px-lg py-xs text-label text-text-dim uppercase">{KIND_LABEL[kind]}</div>
                {group.map(item => {
                  const globalIdx = flat.indexOf(item);
                  const isActive = globalIdx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      onClick={() => select(item)}
                      className={[
                        "w-full text-left px-lg py-sm flex items-center gap-md",
                        isActive ? "bg-panel-2" : "hover:bg-panel-2"
                      ].join(" ")}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-body-strong truncate">{item.title}</div>
                        <div className="text-caption text-text-mute truncate">{item.subtitle}</div>
                      </div>
                      {item.badge && <span className="text-caption text-text-dim border border-border rounded-sm px-xs py-[1px]">{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Restore real import in `Shell.tsx`**

In `app/src/components/layout/Shell.tsx`, replace the stubbed `SearchPalette` function with:

```tsx
import { SearchPalette } from "../interactive/SearchPalette.js";
```

(Remove the temporary inline stub function.)

Also, since the keyboard event in SearchPalette emits an event when ⌘K is pressed and the palette is closed, wire it in Shell. Inside `Shell` add:

```tsx
useEffect(() => {
  const onOpen = () => setSearchOpen(true);
  window.addEventListener("iceberg-open-search", onOpen as EventListener);
  return () => window.removeEventListener("iceberg-open-search", onOpen as EventListener);
}, []);
```

And add `import { useEffect } from "react";` to the existing React import.

- [ ] **Step 5: Verify**

Run: `npm run typecheck --workspace=app && npm run build --workspace=app`
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add app/src/utils/fuzzyIndex.ts app/src/components/interactive/SearchPalette.tsx app/src/components/layout/Shell.tsx app/package.json app/package-lock.json
git commit -m "search: fuse.js index across topics+phases+paths+resources+connections"
```

---

## Phase C — Primitives

### Task 12: ProgressRing primitive

**Files:**
- Create: `app/src/components/domain/ProgressRing.tsx`

- [ ] **Step 1: Create the file**

```tsx
export function ProgressRing({
  value,
  size = 58,
  thickness = 5,
  done = false,
  children
}: { value: number; size?: number; thickness?: number; done?: boolean; children?: React.ReactNode }) {
  const clamped = Math.max(0, Math.min(1, value));
  const color = done ? "var(--green)" : "var(--accent)";
  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: `conic-gradient(${color} 0 ${clamped * 100}%, var(--panel-3) ${clamped * 100}% 100%)`
  };
  return (
    <span className="relative inline-flex items-center justify-center rounded-full shrink-0" style={style} aria-label={`${Math.round(clamped * 100)}% complete`}>
      <span
        className="absolute rounded-full bg-panel"
        style={{ inset: thickness }}
      />
      <span className="relative text-body-strong tabular-nums">{children ?? `${Math.round(clamped * 100)}%`}</span>
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/domain/ProgressRing.tsx
git commit -m "domain: ProgressRing primitive (conic ring with center label)"
```

---

### Task 13: DifficultyBadge

**Files:**
- Rewrite: `app/src/components/domain/DifficultyBadge.tsx`

- [ ] **Step 1: Replace contents**

```tsx
import type { Difficulty } from "../../content/types.js";

const COLORS: Record<Difficulty, { fg: string; bg: string; border: string }> = {
  beginner:     { fg: "var(--green)",  bg: "color-mix(in oklab, var(--green) 12%, transparent)",  border: "color-mix(in oklab, var(--green) 35%, transparent)" },
  intermediate: { fg: "var(--amber)",  bg: "color-mix(in oklab, var(--amber) 12%, transparent)",  border: "color-mix(in oklab, var(--amber) 35%, transparent)" },
  advanced:     { fg: "var(--danger)", bg: "color-mix(in oklab, var(--danger) 12%, transparent)", border: "color-mix(in oklab, var(--danger) 35%, transparent)" }
};

const LABEL: Record<Difficulty, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export function DifficultyBadge({
  difficulty, hours, size = "md"
}: { difficulty: Difficulty; hours: number; size?: "sm" | "md" }) {
  const c = COLORS[difficulty];
  const padX = size === "sm" ? 8 : 10;
  const padY = size === "sm" ? 2 : 4;
  const font = size === "sm" ? 10.5 : 12;
  return (
    <span
      className="inline-flex items-center gap-sm rounded-pill border whitespace-nowrap"
      style={{ color: c.fg, background: c.bg, borderColor: c.border, padding: `${padY}px ${padX}px`, fontSize: font }}
    >
      <span className="font-semibold">{LABEL[difficulty]}</span>
      <span className="text-text-mute tabular-nums">~{Number.isInteger(hours) ? hours : hours.toFixed(1)}h</span>
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/domain/DifficultyBadge.tsx
git commit -m "domain: DifficultyBadge (sm/md, token-based, per-level palette)"
```

---

### Task 14: Pitfalls — numbered editorial list

**Files:**
- Rewrite: `app/src/components/domain/Pitfalls.tsx`

- [ ] **Step 1: Replace contents**

```tsx
import type { Pitfall } from "../../content/types.js";

export function Pitfalls({ items }: { items: Pitfall[] }) {
  return (
    <ol className="m-0 p-0 list-none">
      {items.map((p, i) => (
        <li
          key={i}
          className={[
            "grid grid-cols-[34px_1fr] gap-md py-lg",
            i === 0 ? "pt-xs" : "border-t border-border-soft"
          ].join(" ")}
        >
          <span className="font-mono text-caption text-text-dim tabular-nums tracking-wide pt-[3px]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="text-body-strong text-text mb-xs">{p.title}</div>
            <div className="text-body text-text-mute leading-[1.6] max-w-[620px]">{p.explanation}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/domain/Pitfalls.tsx
git commit -m "domain: Pitfalls as numbered editorial list (hairline separators)"
```

---

### Task 15: CodeExamples — shiki, theme-switched, reasoning above

**Files:**
- Rewrite: `app/src/components/domain/CodeExamples.tsx`
- Verify: `app/package.json` has `shiki`. If not, install.

- [ ] **Step 1: Ensure shiki is installed**

Run: `npm ls shiki --workspace=app`
If missing: `npm install --workspace=app shiki@^1.22.0`

- [ ] **Step 2: Replace contents**

```tsx
import { useEffect, useState } from "react";
import type { CodeExample } from "../../content/types.js";
import { useResolvedTheme } from "../../hooks/useResolvedTheme.js";

export function CodeExamples({ items }: { items: CodeExample[] }) {
  return (
    <div className="flex flex-col gap-xl">
      {items.map((ex, i) => <CodeBlock key={i} ex={ex} />)}
    </div>
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function CodeBlock({ ex }: { ex: CodeExample }) {
  const theme = useResolvedTheme();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const themeName = theme === "dark" ? "github-dark-default" : "github-light";
    import("shiki")
      .then(({ codeToHtml }) => codeToHtml(ex.code, { lang: ex.language, theme: themeName }))
      .then(h => { if (!cancelled) setHtml(h); })
      .catch(() => { if (!cancelled) setHtml(`<pre><code>${escape(ex.code)}</code></pre>`); });
    return () => { cancelled = true; };
  }, [ex.code, ex.language, theme]);

  return (
    <div>
      <div className="text-body-strong mb-xs">{ex.title}</div>
      <div className="text-caption text-text-mute italic mb-sm">{ex.reasoning}</div>
      <div
        className="rounded-sm border border-border-soft overflow-x-auto font-mono text-[12.5px] leading-[1.6] [&_pre]:p-md [&_pre]:m-0 [&_pre]:bg-transparent"
        style={{ background: theme === "dark" ? "#0d0d11" : "var(--panel-2)" }}
        dangerouslySetInnerHTML={{ __html: html ?? `<pre><code>${escape(ex.code)}</code></pre>` }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/src/components/domain/CodeExamples.tsx app/package.json app/package-lock.json
git commit -m "domain: CodeExamples with shiki, theme-switched, reasoning above"
```

---

### Task 16: Narrative

**Files:**
- Rewrite: `app/src/components/domain/Narrative.tsx`

- [ ] **Step 1: Replace contents**

```tsx
export function Narrative({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <div className="flex flex-col gap-md max-w-[720px]">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-body text-text leading-[1.65] whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/domain/Narrative.tsx
git commit -m "domain: Narrative paragraphs (token-mapped, max-prose)"
```

---

### Task 17: connectionHelpers + ConnectionGroup

**Files:**
- Create: `app/src/utils/connectionHelpers.ts`
- Create: `app/src/components/domain/ConnectionGroup.tsx`

- [ ] **Step 1: Create `connectionHelpers.ts`**

```ts
import type { ConnectionEdge } from "../content/types.js";
import { connections, topics } from "../content/index.js";

export type EdgeType = ConnectionEdge["type"];

export const EDGE_ORDER: EdgeType[] = ["prerequisite", "pairs-with", "related", "often-confused-with"];

export const EDGE_LABEL: Record<EdgeType, string> = {
  "prerequisite": "Prerequisite",
  "pairs-with": "Pairs with",
  "related": "Related",
  "often-confused-with": "Often confused with"
};

export const EDGE_HINT: Record<EdgeType, string> = {
  "prerequisite": "things to understand first",
  "pairs-with": "studied alongside this topic",
  "related": "topics in adjacent areas",
  "often-confused-with": "distinct from this topic"
};

export const EDGE_GLYPH: Record<EdgeType, string> = {
  "prerequisite": "→",
  "pairs-with": "↔",
  "related": "•",
  "often-confused-with": "≠"
};

export const EDGE_TOKEN: Record<EdgeType, string> = {
  "prerequisite": "var(--edge-prereq)",
  "pairs-with": "var(--edge-pairs)",
  "related": "var(--edge-related)",
  "often-confused-with": "var(--edge-confused)"
};

export interface RelatedConnection {
  type: EdgeType;
  otherSlug: string;       // the topic that isn't the current one
  otherTitle: string;
  reasoning: string;
  weight: number;
  direction: "outgoing" | "incoming";
}

export function connectionsForTopic(slug: string): RelatedConnection[] {
  const titleBySlug = new Map<string, string>();
  for (const t of topics) titleBySlug.set(t.frontmatter.slug, t.frontmatter.title);
  const out: RelatedConnection[] = [];
  for (const e of connections) {
    if (e.from === slug) {
      out.push({ type: e.type, otherSlug: e.to, otherTitle: titleBySlug.get(e.to) ?? e.to, reasoning: e.reasoning, weight: e.weight, direction: "outgoing" });
    } else if (e.to === slug) {
      out.push({ type: e.type, otherSlug: e.from, otherTitle: titleBySlug.get(e.from) ?? e.from, reasoning: e.reasoning, weight: e.weight, direction: "incoming" });
    }
  }
  return out;
}

export function groupConnections(items: RelatedConnection[]): Record<EdgeType, RelatedConnection[]> {
  const out: Record<EdgeType, RelatedConnection[]> = {
    "prerequisite": [], "pairs-with": [], "related": [], "often-confused-with": []
  };
  for (const c of items) out[c.type].push(c);
  for (const k of EDGE_ORDER) out[k].sort((a, b) => b.weight - a.weight);
  return out;
}

export function topByWeight(items: RelatedConnection[], n: number): RelatedConnection[] {
  return [...items].sort((a, b) => b.weight - a.weight).slice(0, n);
}
```

- [ ] **Step 2: Create `ConnectionGroup.tsx`**

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { EDGE_ORDER, EDGE_LABEL, EDGE_HINT, EDGE_GLYPH, EDGE_TOKEN, groupConnections, type RelatedConnection } from "../../utils/connectionHelpers.js";

const CAP = 8;

export function ConnectionSection({ items }: { items: RelatedConnection[] }) {
  const groups = groupConnections(items);
  return (
    <div className="flex flex-col gap-xl">
      {EDGE_ORDER.map(type => {
        const list = groups[type];
        if (list.length === 0) return null;
        return <Group key={type} type={type} list={list} />;
      })}
    </div>
  );
}

function Group({ type, list }: { type: import("../../utils/connectionHelpers.js").EdgeType; list: RelatedConnection[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? list : list.slice(0, CAP);
  const color = EDGE_TOKEN[type];
  return (
    <div>
      <div className="flex items-center gap-sm mb-sm">
        <span
          className="inline-flex items-center gap-xs px-md py-[3px] rounded-sm uppercase tracking-[0.04em] border text-[11px]"
          style={{ color, borderColor: color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
        >
          <span>{EDGE_GLYPH[type]}</span>
          <span>{EDGE_LABEL[type]}</span>
        </span>
        <span className="text-text-dim text-caption">{EDGE_HINT[type]}</span>
      </div>
      <div className="flex flex-col gap-xs">
        {visible.map(c => (
          <Link
            key={`${type}-${c.otherSlug}`}
            to={`/topic/${c.otherSlug}`}
            className="block bg-panel border border-border-soft rounded-sm p-md hover:bg-panel-2"
          >
            <div className="text-body-strong text-text">{c.otherTitle}</div>
            <div className="text-body text-text-mute mt-xs leading-[1.5]">{c.reasoning}</div>
          </Link>
        ))}
      </div>
      {list.length > CAP && (
        <button
          type="button"
          onClick={() => setShowAll(s => !s)}
          className="mt-sm text-caption text-accent hover:text-accent-hover"
        >
          {showAll ? "Show fewer" : `Show ${list.length - CAP} more`}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/src/utils/connectionHelpers.ts app/src/components/domain/ConnectionGroup.tsx
git commit -m "domain: ConnectionGroup + typed grouping helpers (cap 8, show-all)"
```

---

### Task 18: ConnectionMap SVG mini-graph

**Files:**
- Create: `app/src/components/domain/ConnectionMap.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { Link } from "react-router-dom";
import { connectionsForTopic, topByWeight, EDGE_TOKEN, EDGE_LABEL, type EdgeType, type RelatedConnection } from "../../utils/connectionHelpers.js";

const W = 300;
const H = 260;
const CX = 150;
const CY = 140;
const CENTER_R = 28;
const NODE_R = 22;

type Slot = { x: number; y: number };

const TYPE_BUCKET: Record<EdgeType, { angleStart: number; angleEnd: number }> = {
  "prerequisite": { angleStart: 200, angleEnd: 250 },
  "pairs-with":   { angleStart: 290, angleEnd: 340 },
  "related":      { angleStart: 100, angleEnd: 160 },
  "often-confused-with": { angleStart: 60, angleEnd: 90 }
};

function layout(items: RelatedConnection[]): Map<RelatedConnection, Slot> {
  const out = new Map<RelatedConnection, Slot>();
  const byType: Record<EdgeType, RelatedConnection[]> = {
    "prerequisite": [], "pairs-with": [], "related": [], "often-confused-with": []
  };
  for (const it of items) byType[it.type].push(it);
  for (const type of Object.keys(byType) as EdgeType[]) {
    const list = byType[type];
    const { angleStart, angleEnd } = TYPE_BUCKET[type];
    list.forEach((it, idx) => {
      const t = list.length === 1 ? 0.5 : idx / (list.length - 1);
      const deg = angleStart + t * (angleEnd - angleStart);
      const rad = (deg * Math.PI) / 180;
      const radius = 95;
      out.set(it, { x: CX + Math.cos(rad) * radius, y: CY + Math.sin(rad) * radius });
    });
  }
  return out;
}

export function ConnectionMap({ topicSlug, topicTitle }: { topicSlug: string; topicTitle: string }) {
  const all = connectionsForTopic(topicSlug);
  const visible = topByWeight(all, 8);
  const slots = layout(visible);
  const extra = all.length - visible.length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Topic connection map">
        <defs>
          <marker id="cm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--edge-prereq)" />
          </marker>
        </defs>
        {visible.map(c => {
          const s = slots.get(c);
          if (!s) return null;
          const color = EDGE_TOKEN[c.type];
          const dashed = c.type === "pairs-with";
          const arrow = c.type === "prerequisite";
          return (
            <line
              key={`edge-${c.type}-${c.otherSlug}`}
              x1={s.x} y1={s.y} x2={CX} y2={CY}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray={dashed ? "3 3" : undefined}
              markerEnd={arrow ? "url(#cm-arrow)" : undefined}
              opacity={0.9}
            />
          );
        })}
        <g>
          <circle cx={CX} cy={CY} r={CENTER_R} fill="var(--accent)" />
          <text x={CX} y={CY + 4} textAnchor="middle" fill="var(--bg)" fontSize="10" fontWeight={600}>
            {truncate(topicTitle, 14)}
          </text>
        </g>
        {visible.map(c => {
          const s = slots.get(c);
          if (!s) return null;
          const color = EDGE_TOKEN[c.type];
          return (
            <g key={`node-${c.type}-${c.otherSlug}`}>
              <a href={`/topic/${c.otherSlug}`} aria-label={`${c.otherTitle} — ${EDGE_LABEL[c.type]}`}>
                <circle cx={s.x} cy={s.y} r={NODE_R} fill="var(--panel-2)" stroke={color} />
                <text x={s.x} y={s.y - 2} textAnchor="middle" fill={color} fontSize="8.5">{EDGE_LABEL[c.type].split(" ")[0]?.toLowerCase()}</text>
                <text x={s.x} y={s.y + 9} textAnchor="middle" fill="var(--text)" fontSize="9.5">{truncate(c.otherTitle, 11)}</text>
              </a>
            </g>
          );
        })}
      </svg>
      <div className="mt-xs flex flex-wrap gap-md text-caption text-text-dim">
        <Legend color={EDGE_TOKEN.prerequisite} label="prerequisite" />
        <Legend color={EDGE_TOKEN["pairs-with"]} label="pairs-with" dashed />
        <Legend color={EDGE_TOKEN.related} label="related" />
        <Legend color={EDGE_TOKEN["often-confused-with"]} label="often confused" />
      </div>
      <div className="mt-sm">
        <Link to={`/graph?focus=${topicSlug}`} className="text-accent text-body hover:text-accent-hover">
          Open in graph view →
        </Link>
        {extra > 0 && <span className="ml-md text-text-dim text-caption">+{extra} more</span>}
      </div>
    </div>
  );
}

function Legend({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-xs">
      <span style={{ width: 10, height: 0, borderTop: `${dashed ? "1.5px dashed" : "1.5px solid"} ${color}` }} />
      <span>{label}</span>
    </span>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/components/domain/ConnectionMap.tsx
git commit -m "domain: ConnectionMap SVG mini-graph (top-8-by-weight, typed edges)"
```

---

### Task 19: TopicCard + PhaseTile + PathCard + ActivityRow + ResourceRow

**Files:**
- Create: `app/src/components/domain/TopicCard.tsx`
- Create: `app/src/components/domain/PhaseTile.tsx`
- Create: `app/src/components/domain/PathCard.tsx`
- Create: `app/src/components/domain/ActivityRow.tsx`
- Rewrite: `app/src/components/domain/ResourceRow.tsx`
- Create: `app/src/utils/pathHelpers.ts`

- [ ] **Step 1: Create `pathHelpers.ts`**

```ts
import type { LearningPath } from "../content/types.js";
import { paths, topics } from "../content/index.js";

export function getPathBySlug(slug: string): LearningPath | undefined {
  return paths.find(p => p.slug === slug);
}

export function topicTitleMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of topics) m.set(t.frontmatter.slug, t.frontmatter.title);
  return m;
}
```

- [ ] **Step 2: Create `TopicCard.tsx`**

```tsx
import { Link } from "react-router-dom";
import type { TopicFrontmatter } from "../../content/types.js";
import { progressStore } from "../../stores/index.js";
import { DifficultyBadge } from "./DifficultyBadge.js";

export function TopicCard({
  fm,
  index,
  totalResources
}: { fm: TopicFrontmatter; index?: number; totalResources: number }) {
  const prog = progressStore.getTopicProgress(fm.slug);
  const checked = Object.values(prog.resources).filter(Boolean).length;
  const pct = totalResources === 0 ? 0 : Math.round((checked / totalResources) * 100);
  const done = prog.completed;

  return (
    <Link
      to={`/topic/${fm.slug}`}
      className="grid grid-cols-[36px_1fr_auto] gap-lg items-center px-lg py-md bg-panel border border-border-soft rounded mb-sm hover:bg-panel-2 hover:border-border"
    >
      <div className="font-mono text-caption text-text-dim text-center tabular-nums">
        {typeof index === "number" ? String(index).padStart(2, "0") : ""}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-sm flex-wrap">
          <span className="text-body-strong text-[15px] text-text">{fm.title}</span>
          <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} size="sm" />
        </div>
        <div className="text-body text-text-mute leading-[1.5] mt-xs">{fm.summary}</div>
      </div>
      <div className="text-right">
        <div className="text-caption text-text-mute mb-xs tabular-nums">{checked} / {totalResources} resources</div>
        <div className="w-[100px] h-[4px] bg-border-soft rounded-pill overflow-hidden ml-auto">
          <div className={done ? "h-full bg-green" : "h-full bg-accent"} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Create `PhaseTile.tsx`**

```tsx
import { Link } from "react-router-dom";
import { topics } from "../../content/index.js";
import { progressStore } from "../../stores/index.js";

export function PhaseTile({
  index, slug, title, topicSlugs
}: { index: number; slug: string; title: string; topicSlugs: string[] }) {
  let totalRes = 0;
  let checkedRes = 0;
  for (const ts of topicSlugs) {
    const t = topics.find(x => x.frontmatter.slug === ts);
    if (!t) continue;
    const fm = t.frontmatter;
    const trCount =
      (fm.resources.videos.short ? 1 : 0)
      + (fm.resources.videos.long ? 1 : 0)
      + fm.resources.articles.length
      + fm.resources.services.length
      + fm.resources.courses.length;
    totalRes += trCount;
    const prog = progressStore.getTopicProgress(ts);
    checkedRes += Object.values(prog.resources).filter(Boolean).length;
  }
  const pct = totalRes === 0 ? 0 : Math.round((checkedRes / totalRes) * 100);
  return (
    <Link
      to={`/phase/${slug}`}
      className="block bg-panel border border-border-soft rounded p-lg hover:bg-panel-2 hover:border-border"
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim mb-xs">Phase {String(index).padStart(2, "0")}</div>
      <div className="text-body-strong text-[14.5px] text-text">{title}</div>
      <div className="text-caption text-text-dim mt-xs">{topicSlugs.length} topics</div>
      <div className="mt-md h-[3px] bg-border-soft rounded-pill overflow-hidden">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Create `PathCard.tsx`**

```tsx
import { Link } from "react-router-dom";
import type { LearningPath } from "../../content/types.js";

export function PathCard({ path, fixed = false }: { path: LearningPath; fixed?: boolean }) {
  return (
    <Link
      to={`/path/${path.slug}`}
      className={[
        "block bg-panel border border-border-soft rounded p-lg hover:bg-panel-2 hover:border-border",
        fixed ? "shrink-0 w-[280px]" : ""
      ].join(" ")}
    >
      <div className="text-[11px] uppercase tracking-[0.08em] text-accent mb-sm">
        {path.audience} · {path.estimatedHours}h
      </div>
      <div className="text-body-strong text-[15px] text-text mb-xs">{path.title}</div>
      <div className="text-body text-text-mute leading-[1.5] mb-md line-clamp-3 min-h-[39px]">{path.description}</div>
      <div className="text-caption text-text-dim tabular-nums">{path.topics.length} topics · ~{path.estimatedHours}h</div>
    </Link>
  );
}
```

- [ ] **Step 5: Create `ActivityRow.tsx`**

```tsx
import { Link } from "react-router-dom";
import type { ActivityEntry } from "../../stores/index.js";
import { formatRelative } from "../../utils/activityHelpers.js";

const ICON: Record<ActivityEntry["type"], string> = {
  completed: "●",
  checked: "✓",
  bookmarked: "★",
  unbookmarked: "☆"
};

export function ActivityRow({ entry }: { entry: ActivityEntry }) {
  let body: React.ReactNode = null;
  if (entry.type === "completed") {
    body = <>Marked complete — <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  } else if (entry.type === "checked") {
    body = <>Checked <span className="text-text">{entry.resourceTitle ?? entry.resourceKey}</span> in <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  } else if (entry.type === "bookmarked") {
    body = <>Bookmarked <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  } else {
    body = <>Removed bookmark — <Link to={`/topic/${entry.topicSlug}`} className="text-text hover:underline">{entry.topicTitle}</Link></>;
  }
  return (
    <div className="flex items-baseline gap-md py-sm border-t border-border-soft first:border-t-0 text-text-mute text-body">
      <span className="w-[14px] text-accent inline-flex justify-center" aria-hidden>{ICON[entry.type]}</span>
      <span className="flex-1 min-w-0 truncate">{body}</span>
      <span className="ml-auto text-text-dim text-caption tabular-nums">{formatRelative(entry.at)}</span>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `ResourceRow.tsx`**

```tsx
import { progressStore } from "../../stores/index.js";
import { useStoreSubscription } from "../../hooks/useStoreSubscription.js";

type ResourceKind = "Video" | "Article" | "Service" | "Course";

const KIND_COLOR: Record<ResourceKind, { fg: string; bg: string; border: string }> = {
  Video:   { fg: "var(--amber)", bg: "color-mix(in oklab, var(--amber) 12%, transparent)", border: "color-mix(in oklab, var(--amber) 35%, transparent)" },
  Article: { fg: "var(--blue)",  bg: "color-mix(in oklab, var(--blue) 12%, transparent)",  border: "color-mix(in oklab, var(--blue) 35%, transparent)" },
  Service: { fg: "var(--pink)",  bg: "color-mix(in oklab, var(--pink) 12%, transparent)",  border: "color-mix(in oklab, var(--pink) 35%, transparent)" },
  Course:  { fg: "var(--green)", bg: "color-mix(in oklab, var(--green) 12%, transparent)", border: "color-mix(in oklab, var(--green) 35%, transparent)" }
};

export function ResourceRow({
  topicSlug, resourceKey, kind, title, meta, url, secondaryMeta
}: {
  topicSlug: string;
  resourceKey: string;
  kind: ResourceKind;
  title: string;
  meta: string;
  url: string;
  secondaryMeta?: string;
}) {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const checked = progressStore.getTopicProgress(topicSlug).resources[resourceKey] === true;
  const c = KIND_COLOR[kind];

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    progressStore.setResourceChecked(topicSlug, resourceKey, !checked);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="grid grid-cols-[22px_1fr_auto] gap-md items-center px-md py-md bg-panel border border-border-soft rounded-sm hover:bg-panel-2 hover:border-border"
    >
      <button
        type="button"
        onClick={toggle}
        aria-pressed={checked}
        aria-label={checked ? "Mark unchecked" : "Mark checked"}
        className={[
          "w-[18px] h-[18px] rounded-sm border-[1.5px] flex items-center justify-center",
          checked ? "bg-accent border-accent text-white" : "border-border text-transparent"
        ].join(" ")}
      >
        ✓
      </button>
      <div className="min-w-0">
        <div className="flex items-center gap-sm flex-wrap">
          <span
            className="inline-block text-[11px] px-xs py-[1px] rounded-sm border"
            style={{ color: c.fg, background: c.bg, borderColor: c.border }}
          >{kind}</span>
          <span className="text-body-strong text-text truncate">{title}</span>
        </div>
        <div className="text-caption text-text-mute mt-xs truncate">{meta}</div>
      </div>
      {secondaryMeta && <div className="text-caption text-text-dim tabular-nums">{secondaryMeta}</div>}
    </a>
  );
}
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck --workspace=app`
Expected: passes.

- [ ] **Step 8: Commit**

```bash
git add app/src/utils/pathHelpers.ts app/src/components/domain/TopicCard.tsx app/src/components/domain/PhaseTile.tsx app/src/components/domain/PathCard.tsx app/src/components/domain/ActivityRow.tsx app/src/components/domain/ResourceRow.tsx
git commit -m "domain: TopicCard + PhaseTile + PathCard + ActivityRow + ResourceRow"
```

---

## Phase D — Routes

### Task 20: Rewrite App.tsx + mount Shell

**Files:**
- Rewrite: `app/src/App.tsx`
- Rewrite: `app/src/main.tsx` (only if it doesn't already mount HelmetProvider; otherwise leave)

- [ ] **Step 1: Inspect current main.tsx**

Run: `cat app/src/main.tsx`
Note whether it already wraps with `HelmetProvider`. If it does, leave it alone.

- [ ] **Step 2: Rewrite `App.tsx`**

```tsx
import { Routes, Route } from "react-router-dom";
import { Shell } from "./components/layout/Shell.js";
import { Home } from "./routes/Home.js";
import { Phase } from "./routes/Phase.js";
import { Topic } from "./routes/Topic.js";
import { Bookmarks } from "./routes/Bookmarks.js";
import { Settings } from "./routes/Settings.js";
import { Graph } from "./routes/Graph.js";
import { Paths } from "./routes/Paths.js";
import { Path } from "./routes/Path.js";
import { WhatsNew } from "./routes/WhatsNew.js";
import { Credits } from "./routes/Credits.js";

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/phase/:phaseSlug" element={<Phase />} />
        <Route path="/topic/:topicSlug" element={<Topic />} />
        <Route path="/paths" element={<Paths />} />
        <Route path="/path/:pathSlug" element={<Path />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/whats-new" element={<WhatsNew />} />
        <Route path="/credits" element={<Credits />} />
      </Routes>
    </Shell>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck --workspace=app`
Expected: TypeScript errors per route until routes are rewritten in Tasks 21-27 — that's OK, but tracker which ones. Each subsequent task makes the corresponding route compile.

- [ ] **Step 4: Commit**

```bash
git add app/src/App.tsx
git commit -m "app: mount Shell, add /path/:slug route"
```

---

### Task 21: Rewrite Home

**Files:**
- Rewrite: `app/src/routes/Home.tsx`
- Create: `app/src/components/domain/ResumeHero.tsx`

- [ ] **Step 1: Create `ResumeHero.tsx`**

```tsx
import { Link } from "react-router-dom";
import type { TopicFrontmatter } from "../../content/types.js";
import { taxonomy } from "../../content/index.js";
import { ProgressRing } from "./ProgressRing.js";

export function ResumeHero({
  topic,
  resourceCheckedCount,
  resourceTotalCount,
  overallPct,
  overallCompleted,
  overallTotal,
  done,
  partial,
  untouched
}: {
  topic: TopicFrontmatter;
  resourceCheckedCount: number;
  resourceTotalCount: number;
  overallPct: number;
  overallCompleted: number;
  overallTotal: number;
  done: number;
  partial: number;
  untouched: number;
}) {
  const phaseTitle = taxonomy?.phases.find(p => p.slug === topic.phase)?.title ?? topic.phase;
  const resumeWidth = resourceTotalCount === 0 ? 0 : Math.round((resourceCheckedCount / resourceTotalCount) * 100);
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-xl p-xl border border-border rounded mb-xl"
      style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--blue) 10%, transparent))" }}
    >
      <div>
        <div className="text-label text-text-mute uppercase mb-sm">Welcome back · pick up where you left off</div>
        <h1 className="text-display-lg m-0 mb-xs">{topic.title}</h1>
        <p className="text-body text-text-mute max-w-[520px] mb-md">{topic.summary}</p>
        <div className="h-[6px] bg-border-soft/30 rounded-pill overflow-hidden mb-sm max-w-[360px]">
          <div className="h-full bg-accent rounded-pill" style={{ width: `${resumeWidth}%` }} />
        </div>
        <div className="text-caption text-text-mute tabular-nums mb-md">{resourceCheckedCount} / {resourceTotalCount} resources · {phaseTitle}</div>
        <Link to={`/topic/${topic.slug}`} className="inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
          Resume →
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center gap-sm">
        <ProgressRing value={overallPct / 100} size={130} thickness={9}>
          <span className="text-[22px] font-semibold tabular-nums">{overallPct}%</span>
        </ProgressRing>
        <div className="text-caption text-text-mute tabular-nums">{overallCompleted} / {overallTotal} topics</div>
        <div className="text-caption text-text-dim">{done} done · {partial} partial · {untouched} untouched</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `Home.tsx`**

```tsx
import { Link } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { ResumeHero } from "../components/domain/ResumeHero.js";
import { PathCard } from "../components/domain/PathCard.js";
import { PhaseTile } from "../components/domain/PhaseTile.js";
import { ActivityRow } from "../components/domain/ActivityRow.js";
import { taxonomy, topics, connections, paths } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { useActivity } from "../hooks/useActivity.js";

function totalResourcesFor(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Home() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const activity = useActivity(5);

  const totalRes: Record<string, number> = {};
  for (const t of topics) totalRes[t.frontmatter.slug] = totalResourcesFor(t.frontmatter.slug);
  const overall = progressStore.getOverallProgress(totalRes);
  const lastSlug = progressStore.getLastTouchedTopic();

  let done = 0, partial = 0, untouched = 0;
  for (const t of topics) {
    const p = progressStore.getTopicProgress(t.frontmatter.slug);
    if (p.completed) { done++; continue; }
    const checked = Object.values(p.resources).filter(Boolean).length;
    if (checked > 0) partial++; else untouched++;
  }

  // Resume target: last touched, else first topic with no prerequisites unblocked, else first topic overall.
  const resumeTopic = (() => {
    if (lastSlug) {
      const fm = topics.find(t => t.frontmatter.slug === lastSlug)?.frontmatter;
      if (fm) return fm;
    }
    const allPrereqs = new Set<string>();
    for (const e of connections) if (e.type === "prerequisite") allPrereqs.add(e.to);
    const first = topics.find(t => !allPrereqs.has(t.frontmatter.slug));
    return first?.frontmatter ?? topics[0]?.frontmatter ?? null;
  })();

  // Recommended: next 3 topics whose direct prereqs are all done.
  const completedSet = new Set<string>();
  for (const t of topics) if (progressStore.getTopicProgress(t.frontmatter.slug).completed) completedSet.add(t.frontmatter.slug);
  const prereqsBy: Record<string, string[]> = {};
  for (const e of connections) {
    if (e.type !== "prerequisite") continue;
    (prereqsBy[e.to] ??= []).push(e.from);
  }
  const recommended = topics
    .filter(t => !completedSet.has(t.frontmatter.slug))
    .filter(t => {
      const pres = prereqsBy[t.frontmatter.slug] ?? [];
      return pres.every(p => completedSet.has(p));
    })
    .slice(0, 3);

  const phases = taxonomy ? [...taxonomy.phases].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[1040px]">
        {resumeTopic && (
          <ResumeHero
            topic={resumeTopic}
            resourceCheckedCount={Object.values(progressStore.getTopicProgress(resumeTopic.slug).resources).filter(Boolean).length}
            resourceTotalCount={totalRes[resumeTopic.slug] ?? 0}
            overallPct={overall.totalTopics === 0 ? 0 : Math.round((overall.completedTopics / overall.totalTopics) * 100)}
            overallCompleted={overall.completedTopics}
            overallTotal={overall.totalTopics}
            done={done}
            partial={partial}
            untouched={untouched}
          />
        )}

        {recommended.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Recommended next</h2>
              <span className="text-caption text-text-dim">unblocked by what you've completed</span>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {recommended.map(t => (
                <Link
                  key={t.frontmatter.slug}
                  to={`/topic/${t.frontmatter.slug}`}
                  className="block bg-panel border border-border-soft rounded p-lg hover:bg-panel-2 hover:border-border"
                >
                  <div className="text-[11px] uppercase tracking-[0.08em] text-text-dim mb-sm">{taxonomy?.phases.find(p => p.slug === t.frontmatter.phase)?.title}</div>
                  <div className="text-body-strong text-[15px] text-text mb-xs">{t.frontmatter.title}</div>
                  <div className="text-body text-text-mute leading-[1.5]">{t.frontmatter.summary}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {paths.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Learning paths</h2>
              <span className="text-caption text-text-dim">{paths.length} · curated sequences</span>
            </header>
            <div className="flex gap-md overflow-x-auto scrollbar-thin pb-sm">
              {paths.map(p => <PathCard key={p.slug} path={p} fixed />)}
            </div>
          </section>
        )}

        {activity.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Recent activity</h2>
            </header>
            <div>
              {activity.map((e, i) => <ActivityRow key={`${e.at}-${i}`} entry={e} />)}
            </div>
          </section>
        )}

        {phases.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">All phases</h2>
              <span className="text-caption text-text-dim">{phases.length}</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
              {phases.map((p, i) => (
                <PhaseTile key={p.slug} index={i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
              ))}
            </div>
          </section>
        )}
      </MainColumn>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck --workspace=app`
Expected: errors only in routes not yet rewritten. The Home route itself should compile.

- [ ] **Step 4: Commit**

```bash
git add app/src/routes/Home.tsx app/src/components/domain/ResumeHero.tsx
git commit -m "route: Home dashboard (resume hero, recommended, paths, activity, phases)"
```

---

### Task 22: Rewrite Phase

**Files:**
- Rewrite: `app/src/routes/Phase.tsx`

- [ ] **Step 1: Replace contents**

```tsx
import { Link, useParams } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { taxonomy, topics, connections } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

function resourceTotalFor(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Phase() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const { phaseSlug } = useParams();
  const phase = taxonomy?.phases.find(p => p.slug === phaseSlug);
  if (!phase || !taxonomy) {
    return <div className="p-xl text-text-mute">Phase not found.</div>;
  }
  const phaseIndex = [...taxonomy.phases].sort((a, b) => a.order - b.order).findIndex(p => p.slug === phase.slug) + 1;

  let totalRes = 0, checkedRes = 0, completed = 0;
  for (const ts of phase.topics) {
    totalRes += resourceTotalFor(ts);
    const prog = progressStore.getTopicProgress(ts);
    checkedRes += Object.values(prog.resources).filter(Boolean).length;
    if (prog.completed) completed++;
  }
  const pct = totalRes === 0 ? 0 : Math.round((checkedRes / totalRes) * 100);

  const nextSlug = phase.topics.find(ts => !progressStore.getTopicProgress(ts).completed) ?? null;
  const nextTitle = nextSlug ? topics.find(x => x.frontmatter.slug === nextSlug)?.frontmatter.title : null;

  // Prereq phases: phases containing topics that any topic in this phase depends on.
  const inThisPhase = new Set(phase.topics);
  const prereqPhases = new Set<string>();
  const leadsInto = new Set<string>();
  for (const e of connections) {
    if (e.type !== "prerequisite") continue;
    if (inThisPhase.has(e.to) && !inThisPhase.has(e.from)) {
      const ph = topics.find(t => t.frontmatter.slug === e.from)?.frontmatter.phase;
      if (ph) prereqPhases.add(ph);
    }
    if (inThisPhase.has(e.from) && !inThisPhase.has(e.to)) {
      const ph = topics.find(t => t.frontmatter.slug === e.to)?.frontmatter.phase;
      if (ph) leadsInto.add(ph);
    }
  }

  const density = { prerequisite: 0, "pairs-with": 0, related: 0, "often-confused-with": 0 } as Record<string, number>;
  for (const e of connections) {
    if (inThisPhase.has(e.from) || inThisPhase.has(e.to)) density[e.type] = (density[e.type] ?? 0) + 1;
  }

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <MainColumn maxWidth="max-w-[720px]">
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
            Phase {phaseIndex} of {taxonomy.phases.length}
          </div>
          <h1 className="text-display-xl m-0 mb-xs">{phase.title}</h1>
          <p className="text-body text-text-mute max-w-[640px]">{phase.description}</p>
        </header>

        <section>
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Topics</h2>
            <span className="text-caption text-text-dim">{phase.topics.length} · {completed} complete</span>
          </header>
          <div>
            {phase.topics.map((slug, i) => {
              const fm = topics.find(x => x.frontmatter.slug === slug)?.frontmatter;
              if (!fm) return null;
              return <TopicCard key={slug} fm={fm} index={i + 1} totalResources={resourceTotalFor(slug)} />;
            })}
          </div>
        </section>
      </MainColumn>

      <RightRail>
        <RailCard title="Phase progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={pct / 100} done={completed === phase.topics.length}>
              <span className="text-body-strong">{pct}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checkedRes} / {totalRes} resources</div>
              <div className="text-caption text-text-mute">{completed} / {phase.topics.length} topics complete</div>
            </div>
          </div>
          {nextSlug && (
            <Link to={`/topic/${nextSlug}`} className="mt-md inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
              Continue {nextTitle}
            </Link>
          )}
        </RailCard>

        <RailCard title="Prerequisite phases">
          {prereqPhases.size === 0 ? (
            <div className="text-text-mute italic text-body">None — this is the foundation.</div>
          ) : (
            <div>
              {[...prereqPhases].map(slug => {
                const p = taxonomy.phases.find(ph => ph.slug === slug);
                if (!p) return null;
                return <Link key={slug} to={`/phase/${slug}`} className="block py-xs border-t border-border-soft first:border-t-0 text-text-mute hover:text-text">← {p.title}</Link>;
              })}
            </div>
          )}
        </RailCard>

        <RailCard title="Leads into">
          {leadsInto.size === 0 ? (
            <div className="text-text-mute italic text-body">Nothing else depends on this phase yet.</div>
          ) : (
            <div>
              {[...leadsInto].map(slug => {
                const p = taxonomy.phases.find(ph => ph.slug === slug);
                if (!p) return null;
                return <Link key={slug} to={`/phase/${slug}`} className="block py-xs border-t border-border-soft first:border-t-0 text-text-mute hover:text-text">→ {p.title}</Link>;
              })}
            </div>
          )}
        </RailCard>

        <RailCard title="Connection density">
          {(["prerequisite","pairs-with","related","often-confused-with"] as const).map(k => (
            <div key={k} className="flex justify-between py-xs text-body text-text-mute">
              <span className="capitalize">{k.replace(/-/g," ")}</span>
              <span className="text-text tabular-nums">{density[k] ?? 0}</span>
            </div>
          ))}
          <Link to={`/graph?phase=${phase.slug}`} className="text-accent text-body mt-sm inline-block hover:text-accent-hover">Open graph view →</Link>
        </RailCard>
      </RightRail>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/routes/Phase.tsx
git commit -m "route: Phase (2-col, topic cards with difficulty, full right rail)"
```

---

### Task 23: Rewrite Topic

**Files:**
- Rewrite: `app/src/routes/Topic.tsx`
- Rewrite: `app/src/components/interactive/MarkCompleteButton.tsx`
- Rewrite: `app/src/components/interactive/BookmarkButton.tsx`
- Rewrite: `app/src/components/interactive/NotesField.tsx`

- [ ] **Step 1: Rewrite `MarkCompleteButton.tsx`**

```tsx
import { progressStore, activityStore } from "../../stores/index.js";
import { useStoreSubscription } from "../../hooks/useStoreSubscription.js";
import { getTopic } from "../../content/index.js";

export function MarkCompleteButton({ slug }: { slug: string }) {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const done = progressStore.getTopicProgress(slug).completed;
  const onClick = () => {
    if (done) {
      progressStore.unmarkTopicComplete(slug);
      return;
    }
    progressStore.markTopicComplete(slug);
    const fm = getTopic(slug)?.frontmatter;
    if (fm) activityStore.append({ type: "completed", topicSlug: slug, topicTitle: fm.title });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done}
      className={[
        "inline-flex items-center gap-sm px-md py-sm rounded-sm font-medium",
        done ? "bg-green text-white" : "bg-accent text-white hover:bg-accent-hover"
      ].join(" ")}
    >
      {done ? "✓ Completed" : "Mark complete"}
    </button>
  );
}
```

- [ ] **Step 2: Rewrite `BookmarkButton.tsx`**

```tsx
import { bookmarkStore, activityStore } from "../../stores/index.js";
import { useStoreSubscription } from "../../hooks/useStoreSubscription.js";
import { getTopic } from "../../content/index.js";

export function BookmarkButton({ slug }: { slug: string }) {
  useStoreSubscription(l => bookmarkStore.subscribe(l), () => Date.now());
  const on = bookmarkStore.isBookmarked(slug);
  const onClick = () => {
    bookmarkStore.toggle(slug);
    const fm = getTopic(slug)?.frontmatter;
    if (fm) activityStore.append({ type: on ? "unbookmarked" : "bookmarked", topicSlug: slug, topicTitle: fm.title });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={[
        "inline-flex items-center gap-sm px-md py-sm rounded-sm border",
        on ? "bg-panel-2 border-accent text-accent" : "bg-panel border-border text-text-mute hover:text-text hover:border-text-dim"
      ].join(" ")}
    >
      <span>{on ? "★" : "☆"}</span>
      {on ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
```

- [ ] **Step 3: Inspect current bookmarkStore import**

Run: `grep -n "bookmarkStore" app/src/stores/index.ts`

If not exported, add to `app/src/stores/index.ts`:

```ts
import { LocalStorageBookmarkStore } from "./LocalStorageBookmarkStore.js";
export const bookmarkStore = new LocalStorageBookmarkStore();
```

(Likewise verify `progressStore`, `notesStore`. They should already be exported — the code references them. Stop and check if any are missing.)

- [ ] **Step 4: Rewrite `NotesField.tsx`**

```tsx
import { useEffect, useState } from "react";
import { notesStore } from "../../stores/index.js";

export function NotesField({ slug }: { slug: string }) {
  const [value, setValue] = useState("");
  useEffect(() => { setValue(notesStore.get(slug) ?? ""); }, [slug]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    notesStore.set(slug, v);
  };

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Add notes for this topic… (markdown supported)"
      className="w-full min-h-[120px] bg-panel border border-border-soft rounded p-md text-body text-text placeholder:text-text-dim focus:outline-none focus:border-accent"
      aria-label={`Notes for ${slug}`}
    />
  );
}
```

If `notesStore` isn't exported from `stores/index.ts`, add the export there in the same way as bookmarkStore above.

- [ ] **Step 5: Rewrite `Topic.tsx`**

```tsx
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { JumpNav, type JumpPill } from "../components/interactive/JumpNav.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";
import { Narrative } from "../components/domain/Narrative.js";
import { Pitfalls } from "../components/domain/Pitfalls.js";
import { CodeExamples } from "../components/domain/CodeExamples.js";
import { ResourceRow } from "../components/domain/ResourceRow.js";
import { ConnectionSection } from "../components/domain/ConnectionGroup.js";
import { ConnectionMap } from "../components/domain/ConnectionMap.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { MarkCompleteButton } from "../components/interactive/MarkCompleteButton.js";
import { BookmarkButton } from "../components/interactive/BookmarkButton.js";
import { NotesField } from "../components/interactive/NotesField.js";
import { getTopic, taxonomy } from "../content/index.js";
import { progressStore, activityStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { connectionsForTopic } from "../utils/connectionHelpers.js";

function resourceTotal(fm: import("../content/types.js").TopicFrontmatter): number {
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Topic() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const { topicSlug } = useParams();
  const entry = topicSlug ? getTopic(topicSlug) : undefined;
  if (!entry || !taxonomy) return <div className="p-xl text-text-mute">Topic not found.</div>;
  const fm = entry.frontmatter;
  const phase = taxonomy.phases.find(p => p.slug === fm.phase);
  const phaseIndex = phase ? phase.topics.indexOf(fm.slug) + 1 : 0;

  const prog = progressStore.getTopicProgress(fm.slug);
  const total = resourceTotal(fm);
  const checked = Object.values(prog.resources).filter(Boolean).length;

  const allConn = useMemo(() => connectionsForTopic(fm.slug), [fm.slug]);

  const pills = useMemo<JumpPill[]>(() => {
    const out: JumpPill[] = [
      { id: "definition", label: "Definition" },
      { id: "in-depth",   label: "In Depth" },
      { id: "pitfalls",   label: "Pitfalls", count: fm.pitfalls.length },
      { id: "code",       label: "Code", count: fm.codeExamples.length }
    ];
    const vCount = (fm.resources.videos.short ? 1 : 0) + (fm.resources.videos.long ? 1 : 0);
    if (vCount > 0) out.push({ id: "videos", label: "Videos", count: vCount });
    if (fm.resources.articles.length > 0) out.push({ id: "articles", label: "Articles", count: fm.resources.articles.length });
    if (fm.resources.services.length > 0) out.push({ id: "services", label: "Services", count: fm.resources.services.length });
    if (fm.resources.courses.length > 0)  out.push({ id: "courses",  label: "Courses",  count: fm.resources.courses.length });
    if (allConn.length > 0)               out.push({ id: "connections", label: "Connections", count: allConn.length });
    out.push({ id: "notes", label: "Notes" });
    return out;
  }, [fm, allConn]);

  const onResourceClick = (key: string, title: string) => {
    activityStore.append({ type: "checked", topicSlug: fm.slug, topicTitle: fm.title, resourceKey: key, resourceTitle: title });
  };

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <MainColumn>
        <header className="mb-md">
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
            {phase?.title} · Topic {phaseIndex} of {phase?.topics.length}
          </div>
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="text-display-xl m-0">{fm.title}</h1>
            <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
          </div>
          <p className="text-body text-text-mute mt-sm max-w-[720px]">{fm.summary}</p>
        </header>

        <JumpNav pills={pills} />

        <section id="definition" className="pt-xl scroll-mt-[120px]">
          <h2 className="text-label text-text-mute uppercase mb-md">Definition</h2>
          <p className="text-body text-text leading-[1.6] max-w-[720px] whitespace-pre-line">{fm.definition}</p>
        </section>

        <section id="in-depth" className="pt-xl mt-xl scroll-mt-[120px]">
          <h2 className="text-label text-text-mute uppercase mb-md">In Depth</h2>
          <Narrative text={fm.narrative} />
        </section>

        <section id="pitfalls" className="pt-xl mt-xl scroll-mt-[120px]">
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Common Pitfalls</h2>
            <span className="text-caption text-text-dim tabular-nums">{fm.pitfalls.length}</span>
          </header>
          <Pitfalls items={fm.pitfalls} />
        </section>

        <section id="code" className="pt-xl mt-xl scroll-mt-[120px]">
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Code</h2>
            <span className="text-caption text-text-dim tabular-nums">{fm.codeExamples.length} examples</span>
          </header>
          <CodeExamples items={fm.codeExamples} />
        </section>

        {(fm.resources.videos.short || fm.resources.videos.long) && (
          <section id="videos" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Videos</h2>
              <span className="text-caption text-text-dim tabular-nums">{(fm.resources.videos.short ? 1 : 0) + (fm.resources.videos.long ? 1 : 0)}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.videos.short && (
                <span onClick={() => onResourceClick("videos.short", fm.resources.videos.short!.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey="videos.short" kind="Video" title={fm.resources.videos.short.title} meta={fm.resources.videos.short.author} url={fm.resources.videos.short.url} secondaryMeta={`${fm.resources.videos.short.durationMinutes} min`} />
                </span>
              )}
              {fm.resources.videos.long && (
                <span onClick={() => onResourceClick("videos.long", fm.resources.videos.long!.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey="videos.long" kind="Video" title={fm.resources.videos.long.title} meta={fm.resources.videos.long.author} url={fm.resources.videos.long.url} secondaryMeta={`${fm.resources.videos.long.durationMinutes} min`} />
                </span>
              )}
            </div>
          </section>
        )}

        {fm.resources.articles.length > 0 && (
          <section id="articles" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Articles &amp; Docs</h2>
              <span className="text-caption text-text-dim tabular-nums">{fm.resources.articles.length}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.articles.map((a, i) => (
                <span key={i} onClick={() => onResourceClick(`articles.${i}`, a.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey={`articles.${i}`} kind="Article" title={a.title} meta={a.publisher ?? a.author ?? a.kind} url={a.url} />
                </span>
              ))}
            </div>
          </section>
        )}

        {fm.resources.services.length > 0 && (
          <section id="services" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Services</h2>
              <span className="text-caption text-text-dim tabular-nums">{fm.resources.services.length}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.services.map((s, i) => (
                <span key={i} onClick={() => onResourceClick(`services.${i}`, s.name)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey={`services.${i}`} kind="Service" title={s.name} meta={`${s.category}${s.vendor ? " · " + s.vendor : ""}`} url={s.url} />
                </span>
              ))}
            </div>
          </section>
        )}

        {fm.resources.courses.length > 0 && (
          <section id="courses" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Courses</h2>
              <span className="text-caption text-text-dim tabular-nums">{fm.resources.courses.length}</span>
            </header>
            <div className="flex flex-col gap-sm">
              {fm.resources.courses.map((c, i) => (
                <span key={i} onClick={() => onResourceClick(`courses.${i}`, c.title)}>
                  <ResourceRow topicSlug={fm.slug} resourceKey={`courses.${i}`} kind="Course" title={c.title} meta={`${c.provider}${c.paid ? " · paid" : " · free"}`} url={c.url} />
                </span>
              ))}
            </div>
          </section>
        )}

        {allConn.length > 0 && (
          <section id="connections" className="pt-xl mt-xl scroll-mt-[120px]">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">Connections</h2>
              <span className="text-caption text-text-dim tabular-nums">{allConn.length} related topics</span>
            </header>
            <ConnectionSection items={allConn} />
          </section>
        )}

        <section id="notes" className="pt-xl mt-xl scroll-mt-[120px]">
          <h2 className="text-label text-text-mute uppercase mb-md">Your notes</h2>
          <NotesField slug={fm.slug} />
        </section>
      </MainColumn>

      <RightRail>
        <RailCard title="Progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={total === 0 ? 0 : checked / total} done={prog.completed}>
              <span className="text-body-strong">{total === 0 ? 0 : Math.round((checked / total) * 100)}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checked} / {total} resources</div>
              <div className="text-caption text-text-mute">Mark complete when all are done</div>
            </div>
          </div>
          <div className="mt-md flex flex-wrap gap-sm">
            <MarkCompleteButton slug={fm.slug} />
            <BookmarkButton slug={fm.slug} />
          </div>
        </RailCard>

        <RailCard title="Connection map">
          <ConnectionMap topicSlug={fm.slug} topicTitle={fm.title} />
        </RailCard>
      </RightRail>
    </div>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npm run typecheck --workspace=app`
Expected: Topic compiles. Phase, Home already compile. Remaining errors are in Paths/Path/Bookmarks/Settings/Graph/WhatsNew/Credits — fixed in subsequent tasks.

- [ ] **Step 7: Commit**

```bash
git add app/src/components/interactive/MarkCompleteButton.tsx app/src/components/interactive/BookmarkButton.tsx app/src/components/interactive/NotesField.tsx app/src/routes/Topic.tsx app/src/stores/index.ts
git commit -m "route: Topic (jump-nav, all content sections, right rail with progress + map)"
```

---

### Task 24: Rewrite Paths + Path

**Files:**
- Rewrite: `app/src/routes/Paths.tsx`
- Rewrite: `app/src/routes/Path.tsx`

- [ ] **Step 1: Rewrite `Paths.tsx`**

```tsx
import { MainColumn } from "../components/layout/MainColumn.js";
import { PathCard } from "../components/domain/PathCard.js";
import { paths } from "../content/index.js";

export function Paths() {
  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">Learning paths</h1>
          <p className="text-body text-text-mute max-w-[640px]">
            Each path is an opinionated sequence of topics for a specific audience and goal. Start at the top, work down.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {paths.map(p => <PathCard key={p.slug} path={p} />)}
        </div>
      </MainColumn>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `Path.tsx`**

```tsx
import { useParams, Link } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { RightRail, RailCard } from "../components/layout/RightRail.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";
import { getPathBySlug } from "../utils/pathHelpers.js";
import { topics } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

function totalRes(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Path() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const { pathSlug } = useParams();
  const p = pathSlug ? getPathBySlug(pathSlug) : undefined;
  if (!p) return <div className="p-xl text-text-mute">Path not found.</div>;

  let total = 0, checked = 0, completedTopics = 0;
  for (const ts of p.topics) {
    total += totalRes(ts);
    const prog = progressStore.getTopicProgress(ts);
    checked += Object.values(prog.resources).filter(Boolean).length;
    if (prog.completed) completedTopics++;
  }
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  const nextSlug = p.topics.find(ts => !progressStore.getTopicProgress(ts).completed) ?? null;
  const nextTitle = nextSlug ? topics.find(t => t.frontmatter.slug === nextSlug)?.frontmatter.title : null;

  return (
    <div className="p-xl flex flex-col lg:flex-row gap-xl">
      <MainColumn>
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm">{p.audience} · ~{p.estimatedHours}h · {p.topics.length} topics</div>
          <h1 className="text-display-xl m-0 mb-xs">{p.title}</h1>
          <p className="text-body text-text-mute max-w-[720px]">{p.description}</p>
        </header>
        <section>
          <header className="flex items-baseline gap-md mb-md">
            <h2 className="text-label text-text-mute uppercase m-0">Sequence</h2>
            <span className="text-caption text-text-dim tabular-nums">{p.topics.length} topics</span>
          </header>
          <div>
            {p.topics.map((slug, i) => {
              const fm = topics.find(t => t.frontmatter.slug === slug)?.frontmatter;
              if (!fm) return null;
              return <TopicCard key={slug} fm={fm} index={i + 1} totalResources={totalRes(slug)} />;
            })}
          </div>
        </section>
      </MainColumn>

      <RightRail>
        <RailCard title="Path progress">
          <div className="flex items-center gap-md">
            <ProgressRing value={pct / 100} done={completedTopics === p.topics.length}>
              <span className="text-body-strong">{pct}%</span>
            </ProgressRing>
            <div>
              <div className="text-body-strong text-text tabular-nums">{checked} / {total} resources</div>
              <div className="text-caption text-text-mute">{completedTopics} / {p.topics.length} topics complete</div>
            </div>
          </div>
        </RailCard>
        {nextSlug && (
          <RailCard title="Up next in this path">
            <div className="text-body-strong text-text mb-md">{nextTitle}</div>
            <Link to={`/topic/${nextSlug}?from-path=${p.slug}`} className="inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
              Start →
            </Link>
          </RailCard>
        )}
      </RightRail>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/src/routes/Paths.tsx app/src/routes/Path.tsx
git commit -m "route: Paths catalog + Path sequence view with progress rail"
```

---

### Task 25: Rewrite Bookmarks

**Files:**
- Rewrite: `app/src/routes/Bookmarks.tsx`

- [ ] **Step 1: Replace contents**

```tsx
import { useState } from "react";
import { MainColumn } from "../components/layout/MainColumn.js";
import { TopicCard } from "../components/domain/TopicCard.js";
import { bookmarkStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { taxonomy, topics } from "../content/index.js";

function totalRes(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
}

export function Bookmarks() {
  useStoreSubscription(l => bookmarkStore.subscribe(l), () => Date.now());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const list = bookmarkStore.list().filter(b => !b.resource);
  const bookmarkedSlugs = new Set(list.map(b => b.topic));

  if (!taxonomy) return null;
  const groups = taxonomy.phases
    .map(p => ({ phase: p, slugs: p.topics.filter(s => bookmarkedSlugs.has(s)) }))
    .filter(g => g.slugs.length > 0);

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">Bookmarks</h1>
          <p className="text-body text-text-mute">{list.length} bookmarked topic{list.length === 1 ? "" : "s"}.</p>
        </header>
        {groups.length === 0 ? (
          <div className="text-text-mute italic">No bookmarks yet. Bookmark a topic from its detail page to find it here.</div>
        ) : groups.map(({ phase, slugs }) => {
          const isCollapsed = collapsed.has(phase.slug);
          return (
            <section key={phase.slug} className="mb-xl">
              <button
                type="button"
                onClick={() => setCollapsed(prev => {
                  const next = new Set(prev);
                  if (next.has(phase.slug)) next.delete(phase.slug); else next.add(phase.slug);
                  return next;
                })}
                aria-expanded={!isCollapsed}
                className="flex items-baseline gap-md mb-md text-text"
              >
                <span className="text-text-dim text-caption">{isCollapsed ? "▸" : "▾"}</span>
                <h2 className="text-label text-text-mute uppercase m-0">{phase.title}</h2>
                <span className="text-caption text-text-dim tabular-nums">{slugs.length}</span>
              </button>
              {!isCollapsed && (
                <div>
                  {slugs.map(slug => {
                    const fm = topics.find(t => t.frontmatter.slug === slug)?.frontmatter;
                    if (!fm) return null;
                    return <TopicCard key={slug} fm={fm} totalResources={totalRes(slug)} />;
                  })}
                </div>
              )}
            </section>
          );
        })}
      </MainColumn>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/routes/Bookmarks.tsx
git commit -m "route: Bookmarks grouped collapsibly by phase"
```

---

### Task 26: Rewrite Settings + Credits + WhatsNew

**Files:**
- Rewrite: `app/src/routes/Settings.tsx`
- Rewrite: `app/src/routes/Credits.tsx`
- Rewrite: `app/src/routes/WhatsNew.tsx`

- [ ] **Step 1: Rewrite `Settings.tsx`**

```tsx
import { MainColumn } from "../components/layout/MainColumn.js";
import { useTheme } from "../hooks/useTheme.js";
import { progressStore, bookmarkStore, notesStore, activityStore } from "../stores/index.js";
import type { ExportPayload } from "../stores/types.js";

function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function Settings() {
  const { mode, set } = useTheme();

  const onExport = () => {
    const payload: ExportPayload = {
      format: "iceberg-progress",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        progress: progressStore.exportData(),
        bookmarks: bookmarkStore.exportData(),
        notes: notesStore.exportData()
      }
    };
    downloadJSON(`iceberg-progress-${new Date().toISOString().slice(0, 10)}.json`, payload);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let payload: ExportPayload;
    try { payload = JSON.parse(text) as ExportPayload; }
    catch { alert("Invalid JSON."); return; }
    if (payload.format !== "iceberg-progress" || payload.version !== 1) {
      alert("Unsupported export format."); return;
    }
    const mode = confirm("Replace existing data with this file? Click Cancel to merge instead.") ? "replace" : "merge";
    progressStore.importData(payload.data.progress, mode);
    bookmarkStore.importData(payload.data.bookmarks, mode);
    notesStore.importData(payload.data.notes, mode);
    alert("Import complete.");
    e.target.value = "";
  };

  const onClearAll = () => {
    if (!confirm("Clear all local progress, bookmarks, notes, and activity? This cannot be undone.")) return;
    localStorage.removeItem("iceberg.progress");
    localStorage.removeItem("iceberg.bookmarks");
    localStorage.removeItem("iceberg.notes");
    activityStore.clear();
    location.reload();
  };

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[720px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0">Settings</h1>
        </header>

        <section className="mb-xl">
          <h2 className="text-label text-text-mute uppercase mb-md">Appearance</h2>
          <div className="flex gap-sm">
            {(["light","dark","system"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => set(m)}
                aria-pressed={mode === m}
                className={[
                  "px-md py-sm rounded-sm border capitalize",
                  mode === m ? "bg-accent border-accent text-white" : "border-border text-text-mute hover:text-text hover:border-text-dim"
                ].join(" ")}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-xl">
          <h2 className="text-label text-text-mute uppercase mb-md">Data</h2>
          <div className="flex flex-wrap gap-sm">
            <button type="button" onClick={onExport} className="px-md py-sm rounded-sm border border-border text-text-mute hover:text-text hover:border-text-dim">Export progress (JSON)</button>
            <label className="px-md py-sm rounded-sm border border-border text-text-mute hover:text-text hover:border-text-dim cursor-pointer">
              Import progress
              <input type="file" accept="application/json" onChange={onImport} className="hidden" />
            </label>
            <button type="button" onClick={onClearAll} className="px-md py-sm rounded-sm border border-danger text-danger hover:bg-danger hover:text-white">Clear all data</button>
          </div>
        </section>

        <section className="mb-xl">
          <h2 className="text-label text-text-mute uppercase mb-md">Keyboard shortcuts</h2>
          <ul className="text-body text-text-mute">
            <li className="py-xs border-t border-border-soft first:border-t-0"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">⌘K</kbd> open search palette</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">Esc</kbd> close palette / drawer</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">↑ ↓</kbd> move palette selection</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">Enter</kbd> select / navigate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-label text-text-mute uppercase mb-md">About</h2>
          <p className="text-body text-text-mute">iceberg — a guided curriculum for production-readiness. <a href="/whats-new" className="text-accent hover:underline">What's new</a> · <a href="/credits" className="text-accent hover:underline">Credits</a></p>
        </section>
      </MainColumn>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `Credits.tsx`**

```tsx
import { MainColumn } from "../components/layout/MainColumn.js";

export function Credits() {
  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[720px]">
        <h1 className="text-display-xl m-0 mb-md">Credits</h1>
        <p className="text-body text-text-mute">
          iceberg is curated from public web resources. Each resource credits its original author/publisher inline.
          Content licenses are documented in <a className="text-accent" href="https://github.com/peteramelang/iceberg/blob/main/LICENSE-content.md">LICENSE-content.md</a>.
        </p>
      </MainColumn>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `WhatsNew.tsx`**

```tsx
import { Link } from "react-router-dom";
import { MainColumn } from "../components/layout/MainColumn.js";
import { useChangelog } from "../hooks/useChangelog.js";
import { topics } from "../content/index.js";

export function WhatsNew() {
  const entries = useChangelog();
  const titleBySlug = new Map<string, string>();
  for (const t of topics) titleBySlug.set(t.frontmatter.slug, t.frontmatter.title);

  return (
    <div className="p-xl">
      <MainColumn maxWidth="max-w-[960px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0 mb-xs">What's new</h1>
          <p className="text-body text-text-mute">Curriculum updates derived from the git history of <span className="font-mono">content/</span>.</p>
        </header>
        {entries.length === 0 && <div className="text-text-mute italic">No entries yet.</div>}
        {entries.map(e => (
          <article key={e.sha} className="py-lg border-t border-border-soft first:border-t-0">
            <div className="flex items-baseline gap-md mb-xs text-caption text-text-dim">
              <span className="tabular-nums">{e.date.slice(0, 10)}</span>
              <span className="font-mono">{e.sha}</span>
            </div>
            <div className="text-body-strong text-text mb-sm">{e.message}</div>
            <div className="flex flex-wrap gap-xs">
              {e.touchedTopics.map(slug => (
                <Link key={slug} to={`/topic/${slug}`} className="text-caption px-xs py-[1px] border border-border-soft rounded-sm text-text-mute hover:text-text hover:border-border">{titleBySlug.get(slug) ?? slug}</Link>
              ))}
            </div>
          </article>
        ))}
      </MainColumn>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck --workspace=app`
Expected: Settings + Credits + WhatsNew compile. Only Graph remains.

- [ ] **Step 5: Commit**

```bash
git add app/src/routes/Settings.tsx app/src/routes/Credits.tsx app/src/routes/WhatsNew.tsx
git commit -m "route: Settings (theme/data/shortcuts) + Credits + WhatsNew (token-styled)"
```

---

### Task 27: Rewrite Graph

**Files:**
- Rewrite: `app/src/routes/Graph.tsx`

- [ ] **Step 1: Replace contents**

```tsx
import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ReactFlow, Background, Controls, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { topics, connections, taxonomy } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { useResolvedTheme } from "../hooks/useResolvedTheme.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";
import { ProgressRing } from "../components/domain/ProgressRing.js";

const EDGE_TYPES = ["prerequisite", "pairs-with", "related", "often-confused-with"] as const;
type EdgeType = typeof EDGE_TYPES[number];

const EDGE_COLOR_DARK: Record<EdgeType, string> = {
  "prerequisite": "#ff9f0a",
  "pairs-with": "#7c5cff",
  "related": "#5ac8fa",
  "often-confused-with": "#ff6b9d"
};
const EDGE_COLOR_LIGHT: Record<EdgeType, string> = {
  "prerequisite": "#b76b06",
  "pairs-with": "#5b3df5",
  "related": "#0a6db8",
  "often-confused-with": "#c01e6a"
};

function layoutNodes(): Map<string, { x: number; y: number }> {
  if (!taxonomy) return new Map();
  const out = new Map<string, { x: number; y: number }>();
  const phases = [...taxonomy.phases].sort((a, b) => a.order - b.order);
  phases.forEach((phase, pi) => {
    const angle = (pi / phases.length) * Math.PI * 2;
    const ringR = 360;
    const cx = Math.cos(angle) * ringR;
    const cy = Math.sin(angle) * ringR;
    phase.topics.forEach((slug, ti) => {
      const t = (ti / Math.max(phase.topics.length - 1, 1)) * Math.PI * 2;
      out.set(slug, {
        x: cx + Math.cos(t) * 80,
        y: cy + Math.sin(t) * 80
      });
    });
  });
  return out;
}

export function Graph() {
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const theme = useResolvedTheme();
  const [params] = useSearchParams();
  const focusSlug = params.get("focus");
  const phaseFilter = params.get("phase");

  const [enabled, setEnabled] = useState<Record<EdgeType, boolean>>({
    "prerequisite": true,
    "pairs-with": false,
    "related": false,
    "often-confused-with": false
  });
  const [selected, setSelected] = useState<string | null>(focusSlug);

  const EDGE_COLOR = theme === "dark" ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;
  const positions = useMemo(layoutNodes, []);

  const nodes: Node[] = useMemo(() => topics
    .filter(t => !phaseFilter || t.frontmatter.phase === phaseFilter)
    .map(t => {
      const fm = t.frontmatter;
      const pos = positions.get(fm.slug) ?? { x: 0, y: 0 };
      const prog = progressStore.getTopicProgress(fm.slug);
      const done = prog.completed;
      const isSelected = selected === fm.slug;
      return {
        id: fm.slug,
        position: pos,
        data: { label: fm.title },
        style: {
          background: isSelected ? "var(--accent)" : done ? "var(--green)" : "var(--panel)",
          color: isSelected || done ? "var(--bg)" : "var(--text)",
          border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 8,
          padding: 6,
          fontSize: 11
        }
      };
    }), [phaseFilter, positions, selected]);

  const edges: Edge[] = useMemo(() => connections
    .filter(e => enabled[e.type as EdgeType])
    .filter(e => !phaseFilter || (
      topics.find(t => t.frontmatter.slug === e.from)?.frontmatter.phase === phaseFilter
      || topics.find(t => t.frontmatter.slug === e.to)?.frontmatter.phase === phaseFilter
    ))
    .map(e => ({
      id: `${e.from}-${e.type}-${e.to}`,
      source: e.from,
      target: e.to,
      animated: false,
      style: { stroke: EDGE_COLOR[e.type as EdgeType], strokeDasharray: e.type === "pairs-with" ? "4 4" : undefined }
    })), [enabled, phaseFilter, EDGE_COLOR]);

  const onNodeClick = useCallback((_: unknown, node: Node) => setSelected(node.id), []);
  const sel = selected ? topics.find(t => t.frontmatter.slug === selected)?.frontmatter : null;

  return (
    <div className="flex h-[calc(100dvh-52px)]">
      <div className="flex-1 relative">
        <div className="absolute top-md left-md z-10 flex gap-sm bg-panel border border-border-soft rounded-sm p-sm">
          {EDGE_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setEnabled(prev => ({ ...prev, [t]: !prev[t] }))}
              aria-pressed={enabled[t]}
              className={[
                "text-caption px-md py-xs rounded-sm border capitalize",
                enabled[t]
                  ? "border-current text-white"
                  : "border-border text-text-mute hover:text-text"
              ].join(" ")}
              style={enabled[t] ? { background: EDGE_COLOR[t], borderColor: EDGE_COLOR[t] } : undefined}
            >
              {t.replace(/-/g, " ")}
            </button>
          ))}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          colorMode={theme}
          fitView
        >
          <Background gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      {sel && (
        <aside className="w-[280px] shrink-0 border-l border-border bg-panel p-lg overflow-y-auto scrollbar-thin">
          <button type="button" onClick={() => setSelected(null)} className="text-text-mute hover:text-text text-caption mb-md">× close</button>
          <h2 className="text-display-lg m-0 mb-xs">{sel.title}</h2>
          <DifficultyBadge difficulty={sel.difficulty} hours={sel.estimatedHours} size="sm" />
          <p className="text-body text-text-mute mt-md leading-[1.5]">{sel.summary}</p>
          <div className="mt-md">
            <ProgressRing value={
              (Object.values(progressStore.getTopicProgress(sel.slug).resources).filter(Boolean).length)
              / Math.max(1,
                (sel.resources.videos.short ? 1 : 0)
                + (sel.resources.videos.long ? 1 : 0)
                + sel.resources.articles.length
                + sel.resources.services.length
                + sel.resources.courses.length
              )
            } size={48} thickness={4}><span className="text-caption">%</span></ProgressRing>
          </div>
          <Link to={`/topic/${sel.slug}`} className="mt-md inline-flex items-center gap-sm bg-accent text-white px-md py-sm rounded-sm font-medium hover:bg-accent-hover">
            Go to topic →
          </Link>
        </aside>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run typecheck --workspace=app && npm run build --workspace=app`
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add app/src/routes/Graph.tsx
git commit -m "route: Graph (filter chips, side panel on click, theme-aware palette)"
```

---

## Phase E — Cleanup & ship

### Task 28: Delete dead files

**Files to delete (replaced by Shell + new components):**
- `app/src/components/layout/Page.tsx`
- `app/src/components/layout/PrimaryNav.tsx`
- `app/src/components/layout/Footer.tsx`
- `app/src/components/layout/Section.tsx`
- `app/src/components/layout/HairlineRule.tsx`
- `app/src/components/layout/ListRow.tsx`
- `app/src/components/layout/BracketList.tsx`
- `app/src/components/domain/ConnectionSidebar.tsx`

- [ ] **Step 1: Confirm no remaining imports**

Run: `grep -RE "from .+(Page|PrimaryNav|Footer|Section|HairlineRule|ListRow|BracketList|ConnectionSidebar)" app/src/`
Expected: no matches in `app/src` (matches inside `node_modules` are fine). If any match exists, replace the usage before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm app/src/components/layout/Page.tsx \
       app/src/components/layout/PrimaryNav.tsx \
       app/src/components/layout/Footer.tsx \
       app/src/components/layout/Section.tsx \
       app/src/components/layout/HairlineRule.tsx \
       app/src/components/layout/ListRow.tsx \
       app/src/components/layout/BracketList.tsx \
       app/src/components/domain/ConnectionSidebar.tsx
```

- [ ] **Step 3: Verify build**

Run: `npm run typecheck --workspace=app && npm run build --workspace=app`
Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "cleanup: remove legacy shell + ConnectionSidebar (superseded by Shell/ConnectionGroup)"
```

---

### Task 29: Accessibility + keyboard pass

**Files:** various, targeted touches.

- [ ] **Step 1: Verify focus outlines exist**

Open `app/src/styles/global.css`. Inside `@layer base`, append:

```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}
```

- [ ] **Step 2: Skip-to-content link**

In `Shell.tsx`, at the very top of the returned JSX (before the sidebar), add:

```tsx
<a
  href="#main"
  className="sr-only focus:not-sr-only fixed top-sm left-sm z-50 bg-accent text-white px-md py-sm rounded-sm"
>
  Skip to main content
</a>
```

And give `<main>` an `id="main"`.

(`sr-only` and `not-sr-only` are Tailwind defaults; they ship in the build.)

- [ ] **Step 3: ARIA on the sidebar phase tree**

Confirm the rendered output in `Sidebar.tsx` already uses `aria-expanded` on phase buttons (done in Task 8). If not, add it.

- [ ] **Step 4: Verify build**

Run: `npm run build --workspace=app`
Expected: passes.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev --workspace=app`
Open `http://localhost:5173/`. Verify:
- Tab focuses the skip link first.
- ⌘K opens search; ↑/↓/Enter navigate; Esc closes.
- Sidebar phase headers respond to Space/Enter (because they're `<button>`s already).
- The theme toggle in the topbar flips light/dark and persists across reload.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add app/src/styles/global.css app/src/components/layout/Shell.tsx
git commit -m "a11y: focus-visible outline + skip-to-content link"
```

---

### Task 30: Final verification + push

**Files:** none.

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck --workspace=app`
Expected: 0 errors.

- [ ] **Step 2: Run production build**

Run: `npm run build --workspace=app`
Expected: build succeeds; bundle size reported.

- [ ] **Step 3: Smoke test the production build**

Run: `npm run preview --workspace=app`
Open `http://localhost:4173/`. Walk through:

- `/` — resume hero loads (or shows starter state); recommended cards render; paths strip scrolls; phases grid links open phases.
- Click into a phase, then a topic — pill nav sticks; sections scroll-spy correctly; Mark complete + Bookmark work; Connection map renders.
- `/bookmarks` — collapses/expands by phase.
- `/paths`, click into a path — sequence renders, "Start →" button works.
- `/whats-new` — entries (or empty state) render.
- `/graph` — defaults to prerequisite edges; click node opens side panel; "Go to topic" navigates.
- `/settings` — toggle theme; reload; theme persists.

Stop preview.

- [ ] **Step 4: Verify branch state**

Run: `git status --short && git log --oneline main..HEAD | wc -l`
Expected: clean working tree, ≥ 20 commits ahead of main.

- [ ] **Step 5: Push final state**

Run: `git push`
Expected: branch updated on origin.

- [ ] **Step 6: Done**

The redesign is feature-complete on `ui-redesign-v2`. Open a PR from `ui-redesign-v2` → `main` for human review/merge.

---

## Self-review notes

- Every spec section in `docs/superpowers/specs/2026-05-14-ui-redesign-design.md` is implemented by a task: shell (Tasks 7-11), home (21), topic (23), phase (22), paths (24), bookmarks (25), settings + credits + whats-new (26), graph (27), pitfalls/code/narrative/difficulty/connection components (13-18), themes (5), activity store + ring buffer (6).
- No code step is left as a placeholder; every code block contains the full file contents or the exact edit instruction.
- Naming is consistent: `ConnectionSection` (the wrapper) is exported from `ConnectionGroup.tsx` and imported under that name in `Topic.tsx`; `RailCard` is exported from `RightRail.tsx`.
- The `activityStore`, `bookmarkStore`, `notesStore`, `progressStore`, and `themeStore` exports are all expected to live in `app/src/stores/index.ts`. Task 5 + 6 + 23 collectively ensure all are exported.

