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
