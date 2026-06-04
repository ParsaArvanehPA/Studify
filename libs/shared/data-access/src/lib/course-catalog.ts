import {Course} from './course.model';

/** Course catalog — generated from bundled content by tools/gen-catalog.mjs. */
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
                title: 'Chapter 1',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'cw-1-guide'},
                    {kind: 'Concise', tag: 'concise', docId: 'cw-1'}
                ]
            },
            {no: '02', title: 'Chapter 2', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-2'}]},
            {no: '03', title: 'Chapter 3', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-3'}]},
            {no: '04', title: 'Chapter 4', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-4'}]},
            {no: '05', title: 'Chapter 5', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-5'}]},
            {no: '09', title: 'Chapter 9', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-9'}]}
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
            'Research methods in translation studies — foundations, theoretical turns and exam-ready self-tests, presented in the unified reader.',
        chapters: [
            {
                no: '01',
                title: 'Session 1',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-1-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-1-qa'}
                ]
            },
            {
                no: '02',
                title: 'Session 2',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-2-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-2-qa'}
                ]
            },
            {
                no: '03',
                title: 'Session 3',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-3-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-3-qa'}
                ]
            },
            {
                no: '04',
                title: 'Session 4',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-4-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-4-qa'}
                ]
            },
            {
                no: '05',
                title: 'Session 5',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-5-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-5-qa'}
                ]
            },
            {
                no: '06',
                title: 'Session 6',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-6-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-6-qa'}
                ]
            },
            {
                no: '07',
                title: 'Session 7',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-7-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-7-qa'}
                ]
            },
            {
                no: '08',
                title: 'Session 8',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-8-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-8-qa'}
                ]
            },
            {
                no: '09',
                title: 'Session 9',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-9-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-9-qa'}
                ]
            }
        ]
    },
    {
        id: 'online-journalism',
        name: 'Online Journalism',
        fa: 'روزنامه‌نگاری برخط',
        glyph: '📰',
        color: '#E8A93C',
        semester: 'Semester 2',
        description:
            'Online journalism and translation in the digital space — media, audiences, genres and the politics of the network, in detailed Persian study guides.',
        chapters: [
            {no: '01', title: 'Session 1', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-1-guide'}]},
            {no: '02', title: 'Session 2', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-2-guide'}]},
            {no: '03', title: 'Session 3', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-3-guide'}]},
            {no: '04', title: 'Session 4', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-4-guide'}]},
            {no: '05', title: 'Session 5', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-5-guide'}]},
            {no: '06', title: 'Session 6', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-6-guide'}]},
            {no: '07', title: 'Session 7', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-7-guide'}]},
            {no: '08', title: 'Session 8', files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-8-guide'}]}
        ]
    },
    {
        id: 'political-translation',
        name: 'Political Translation',
        fa: 'ترجمهٔ سیاسی',
        glyph: '🗳️',
        color: '#5BC9A0',
        semester: 'Semester 2',
        description:
            'Translation of political texts — Edward Said, Carl Schmitt and critical discourse analysis, with hands-on translation workshops.',
        chapters: [
            {no: '01', title: 'Session 1', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-1-guide'}]},
            {no: '02', title: 'Session 2', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-2-guide'}]},
            {no: '03', title: 'Session 3', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-3-guide'}]},
            {no: '04', title: 'Session 4', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-4-guide'}]},
            {no: '05', title: 'Session 5', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-5-guide'}]},
            {no: '07', title: 'Session 7', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-7-guide'}]}
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
