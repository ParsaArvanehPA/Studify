/** A study file within a chapter, linking to a reader document. */
export interface CourseFileRef {
    /** Display label, e.g. "Study Guide", "Concise". */
    kind: string;
    /** Pill style: 'guide' | 'concise' | 'quiz'. */
    tag: string;
    /** Reader catalog doc id. */
    docId: string;
}

/** A chapter/session in a course. */
export interface Chapter {
    /** Zero-padded display number, e.g. "01". */
    no: string;
    /** Chapter title, e.g. "Paragraph Structure". */
    title: string;
    files: CourseFileRef[];
}

/** A course — the data the course page renders (mirrors the old structure.ts). */
export interface Course {
    id: string;
    name: string;
    /** Persian name. */
    fa: string;
    /** Emoji glyph. */
    glyph: string;
    /** Accent colour (hex). */
    color: string;
    /** Semester label. */
    semester: string;
    description: string;
    chapters: Chapter[];
}
