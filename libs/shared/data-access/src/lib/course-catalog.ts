import {Course} from './course.model';

/**
 * The course catalog — semester → course → chapter → file hierarchy the home and
 * course pages render. Ported from the design prototype's per-page data + the old
 * structure.ts. File `docId`s reference entries in the reader CONTENT_CATALOG.
 */
export const COURSES: readonly Course[] = [
    {
        id: 'creative-writing',
        name: 'Creative Writing',
        fa: 'نگارش خلاق',
        glyph: '✍️',
        color: '#F0726B',
        semester: 'Semester 1',
        description:
            'The craft of clear, expressive writing — paragraph structure, topic sentences, support and revision — distilled into detailed study guides and concise exam summaries.',
        chapters: [
            {
                no: '01',
                title: 'Paragraph Structure',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'cw-1-guide'},
                    {kind: 'Concise', tag: 'concise', docId: 'cw-1'}
                ]
            },
            {no: '02', title: 'Unity & Coherence', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-2'}]},
            {no: '03', title: 'Narration', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-3'}]},
            {no: '04', title: 'Description', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-4'}]},
            {no: '05', title: 'Exemplification', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-5'}]},
            {no: '09', title: 'The Essay', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-9'}]}
        ]
    },
    {
        id: 'the-way-of-research',
        name: 'The Way of Research',
        fa: 'روش تحقیق',
        glyph: '🔬',
        color: '#9384F2',
        semester: 'Semester 1',
        description:
            'Research methods in translation studies — foundations, theoretical turns and exam-ready self-tests, presented in the unified trilingual-friendly reader.',
        chapters: [
            {
                no: '02',
                title: 'Foundations of Research',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'wr-2-guide'}]
            },
            {no: '03', title: 'Self-test · Q&A', files: [{kind: 'Self-test', tag: 'quiz', docId: 'wr-3-qa'}]}
        ]
    }
];

/** Look up a course by id. */
export function findCourse(id: string): Course | undefined {
    return COURSES.find((course) => course.id === id);
}

/** Total study files in a course. */
export function courseFileCount(course: Course): number {
    return course.chapters.reduce((total, ch) => total + ch.files.length, 0);
}
