import { LocalStorageProgressStore } from "./LocalStorageProgressStore.js";
import { LocalStorageBookmarkStore } from "./LocalStorageBookmarkStore.js";
import { LocalStorageNotesStore } from "./LocalStorageNotesStore.js";
import { LocalStorageThemeStore } from "./LocalStorageThemeStore.js";
import { LocalStorageActivityStore } from "./LocalStorageActivityStore.js";
import { InMemoryCompletionPulseStore } from "./CompletionPulseStore.js";

export const progressStore = new LocalStorageProgressStore();
export const bookmarkStore = new LocalStorageBookmarkStore();
export const notesStore = new LocalStorageNotesStore();
export const themeStore = new LocalStorageThemeStore();
export const activityStore = new LocalStorageActivityStore();
export const completionPulseStore = new InMemoryCompletionPulseStore();
export type { ThemeMode, ResolvedTheme, ThemeStore } from "./ThemeStore.js";
export type { ActivityEntry, ActivityStore, ActivityType } from "./ActivityStore.js";
export type { CompletionPulseStore } from "./CompletionPulseStore.js";
