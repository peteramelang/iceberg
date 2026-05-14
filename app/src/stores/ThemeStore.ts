export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeStore {
  get(): ThemeMode;
  set(mode: ThemeMode): void;
  resolved(): ResolvedTheme;
  subscribe(listener: () => void): () => void;
}
