import {StudyDoc} from './study-doc.model';

/**
 * The content catalog — the "structure.ts" equivalent the design prototype
 * referenced. Ported from the DOCS array in studify-reader.js. Paths point at
 * the study HTML copied into the app assets.
 */
const CW = 'assets/content/Creative Writing/';
const WR = 'assets/content/The Way of Research/';

export const CONTENT_CATALOG: readonly StudyDoc[] = [
    {id: 'cw-1-guide', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 1', kind: 'Study Guide', path: `${CW}chapter-1-summary.html`},
    {id: 'cw-1', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 1', kind: 'Concise Summary', path: `${CW}chapter-1-summary-concise.html`},
    {id: 'cw-2', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 2', kind: 'Concise Summary', path: `${CW}chapter-2-summary-concise.html`},
    {id: 'cw-3', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 3', kind: 'Concise Summary', path: `${CW}chapter-3-summary-concise.html`},
    {id: 'cw-4', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 4', kind: 'Concise Summary', path: `${CW}chapter-4-summary-concise.html`},
    {id: 'cw-5', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 5', kind: 'Concise Summary', path: `${CW}chapter-5-summary-concise.html`},
    {id: 'cw-9', course: 'Creative Writing', courseFa: 'نگارش خلاق', chapter: 'Chapter 9', kind: 'Concise Summary', path: `${CW}chapter-9-summary-concise.html`},
    {id: 'wr-2-guide', course: 'The Way of Research', courseFa: 'روش تحقیق', chapter: 'Session 2', kind: 'Study Guide', path: `${WR}session-2-study-guide.html`, rtl: true},
    {id: 'wr-3-qa', course: 'The Way of Research', courseFa: 'روش تحقیق', chapter: 'Session 3', kind: 'Self-test', path: `${WR}session-3-qa.html`, rtl: true}
];

/** Accent colour per course (ported from COURSE_COLOR in studify-reader.js). */
export const COURSE_COLOR: Readonly<Record<string, string>> = {
    'Creative Writing': '#F0726B',
    'The Way of Research': '#9384F2'
};

/** Look up a document by id. */
export function findDoc(id: string): StudyDoc | undefined {
    return CONTENT_CATALOG.find((doc) => doc.id === id);
}

/** Index of a document in the catalog, or -1. */
export function docIndex(id: string): number {
    return CONTENT_CATALOG.findIndex((doc) => doc.id === id);
}
