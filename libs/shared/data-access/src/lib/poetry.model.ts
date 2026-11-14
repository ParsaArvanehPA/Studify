/** One hemistich (مصراع) with its English rendering. */
export interface Hemistich {
    fa: string;
    en: string;
}

/** A couplet (بیت) — two hemistichs. */
export type Couplet = readonly [Hemistich, Hemistich];

/** A poem studied in a class session. */
export interface Poem {
    /** Stable id, e.g. "p01". */
    id: string;
    /** Session number (1-based). */
    session: number;
    /** Persian title. */
    fa: string;
    /** English title. */
    en: string;
    /** Number printed beside the title in the course pack, e.g. "31". */
    ref?: string;
    couplets: readonly Couplet[];
}

/** A class session of the poetry course. */
export interface PoetrySession {
    no: number;
    /** Persian label, e.g. "جلسه اول". */
    fa: string;
}

/** The Poetry Translation dataset (data/poetry-translation.json). */
export interface PoetryDeck {
    sessions: PoetrySession[];
    poems: Poem[];
}
