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
