/**
 * A single study document in the catalog. In the design prototype this was the
 * `DOCS` array inside studify-reader.js; here it is the typed catalog model that
 * the reader, course pages and prerenderer all consume.
 */
export interface StudyDoc {
    /** Stable id used in the URL (`/reader/:id`). */
    id: string;
    /** Course display name (English). */
    course: string;
    /** Course name in Persian, shown in the doc head. */
    courseFa: string;
    /** Chapter / session label, e.g. "Chapter 1" or "Session 2". */
    chapter: string;
    /** Document kind, e.g. "Study Guide", "Concise Summary", "Self-test". */
    kind: string;
    /** Path to the source HTML, relative to the deployed base (served from assets). */
    path: string;
    /** Source is right-to-left (Persian / Arabic). */
    rtl?: boolean;
    /** Google Drive embed URL for a lecture video. */
    video?: string;
}

/** Reading surface used by the reader. */
export type ReadingSurface = 'paper' | 'sepia' | 'midnight';

/** Ambient theme "mood" applied on the document element. */
export type Mood = 'midnight' | 'nebula' | 'ivory';
