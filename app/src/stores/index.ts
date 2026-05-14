import { LocalStorageProgressStore } from "./LocalStorageProgressStore.js";
import { LocalStorageBookmarkStore } from "./LocalStorageBookmarkStore.js";
import { LocalStorageNotesStore } from "./LocalStorageNotesStore.js";
import { LocalStorageThemeStore } from "./LocalStorageThemeStore.js";

export const progressStore = new LocalStorageProgressStore();
export const bookmarkStore = new LocalStorageBookmarkStore();
export const notesStore = new LocalStorageNotesStore();
export const themeStore = new LocalStorageThemeStore();
export type { ThemeMode, ResolvedTheme, ThemeStore } from "./ThemeStore.js";
