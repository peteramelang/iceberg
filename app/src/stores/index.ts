import { LocalStorageProgressStore } from "./LocalStorageProgressStore.js";
import { LocalStorageBookmarkStore } from "./LocalStorageBookmarkStore.js";
import { LocalStorageNotesStore } from "./LocalStorageNotesStore.js";

export const progressStore = new LocalStorageProgressStore();
export const bookmarkStore = new LocalStorageBookmarkStore();
export const notesStore = new LocalStorageNotesStore();
