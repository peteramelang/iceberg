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
