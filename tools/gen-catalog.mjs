/**
 * One-time catalog generator. Scans the bundled study content under
 * apps/studify/src/assets/sem and writes the reader + course catalogs with
 * guaranteed-correct paths. Re-run after adding content: `node tools/gen-catalog.mjs`.
 */
import {existsSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const ASSETS = 'assets/sem'; // served path used in catalog (under app base href)
const FS = 'apps/studify/src'; // filesystem prefix for scanning + existence checks

const COURSES = [
    {
        id: 'creative-writing',
        name: 'Creative Writing',
        fa: 'نگارش خلاق',
        glyph: '✍️',
        color: '#F0726B',
        semester: 'Semester 1',
        rtl: false,
        dir: 'semester-1/creative-writing',
        kind: 'chapters',
        prefix: 'cw',
        description:
            'The craft of clear, expressive writing — paragraph structure, topic sentences, support and revision — distilled into detailed study guides and concise exam summaries.'
    },
    {
        id: 'the-way-of-research',
        name: 'The Way of Research',
        fa: 'روش تحقیق',
        glyph: '🔬',
        color: '#9384F2',
        semester: 'Semester 1',
        rtl: true,
        dir: 'semester-1/the-way-of-research',
        kind: 'sessions',
        prefix: 'wr',
        description:
            'Research methods in translation studies — foundations, theoretical turns and exam-ready self-tests, presented in the unified reader.'
    },
    {
        id: 'online-journalism',
        name: 'Online Journalism',
        fa: 'روزنامه‌نگاری برخط',
        glyph: '📰',
        color: '#E8A93C',
        semester: 'Semester 2',
        rtl: true,
        dir: 'semester-2/online-journalism',
        kind: 'sessions',
        prefix: 'oj',
        description:
            'Online journalism and translation in the digital space — media, audiences, genres and the politics of the network, in detailed Persian study guides.'
    },
    {
        id: 'political-translation',
        name: 'Political Translation',
        fa: 'ترجمهٔ سیاسی',
        glyph: '🗳️',
        color: '#5BC9A0',
        semester: 'Semester 2',
        rtl: true,
        dir: 'semester-2/political-translation',
        kind: 'sessions',
        prefix: 'pt',
        description:
            'Translation of political texts — Edward Said, Carl Schmitt and critical discourse analysis, with hands-on translation workshops.'
    }
];

const docs = [];
const courseData = [];

for (const c of COURSES) {
    const base = join(FS, ASSETS, c.dir);
    const chapters = [];

    if (c.kind === 'chapters') {
        const files = readdirSync(base)
            .filter((f) => f.endsWith('.html'))
            .sort();
        const byNum = new Map();
        for (const f of files) {
            const m = /chapter-(\d+)-summary(-concise)?\.html$/.exec(f);
            if (!m) continue;
            const n = m[1];
            const concise = !!m[2];
            const id = concise ? `${c.prefix}-${n}` : `${c.prefix}-${n}-guide`;
            const kind = concise ? 'Concise' : 'Study Guide';
            const tag = concise ? 'concise' : 'guide';
            docs.push({
                id,
                course: c.name,
                courseFa: c.fa,
                chapter: `Chapter ${n}`,
                kind,
                path: `${ASSETS}/${c.dir}/${f}`,
                rtl: c.rtl
            });
            if (!byNum.has(n)) byNum.set(n, []);
            byNum.get(n).push({kind, tag, docId: id});
        }
        for (const [n, fileRefs] of [...byNum.entries()].sort((a, b) => +a[0] - +b[0])) {
            fileRefs.sort((a, b) => (a.tag === 'guide' ? -1 : 1));
            chapters.push({no: n.padStart(2, '0'), title: `Chapter ${n}`, files: fileRefs});
        }
    } else {
        const sessions = readdirSync(base)
            .filter((d) => /^session-\d+$/.test(d))
            .sort((a, b) => +a.split('-')[1] - +b.split('-')[1]);
        for (const s of sessions) {
            const n = s.split('-')[1];
            const dir = join(base, s);
            const files = readdirSync(dir);
            const fileRefs = [];
            const guideFile = files.find((f) => /-(study-guide|summary)\.html$/.test(f));
            const qaFile = files.find((f) => /-qa\.html$/.test(f));
            if (guideFile) {
                const id = `${c.prefix}-${n}-guide`;
                docs.push({
                    id,
                    course: c.name,
                    courseFa: c.fa,
                    chapter: `Session ${n}`,
                    kind: 'Study Guide',
                    path: `${ASSETS}/${c.dir}/${s}/${guideFile}`,
                    rtl: c.rtl
                });
                fileRefs.push({kind: 'Study Guide', tag: 'guide', docId: id});
            }
            if (qaFile) {
                const id = `${c.prefix}-${n}-qa`;
                docs.push({
                    id,
                    course: c.name,
                    courseFa: c.fa,
                    chapter: `Session ${n}`,
                    kind: 'Self-test',
                    path: `${ASSETS}/${c.dir}/${s}/${qaFile}`,
                    rtl: c.rtl
                });
                fileRefs.push({kind: 'Self-test', tag: 'quiz', docId: id});
            }
            if (fileRefs.length) chapters.push({no: n.padStart(2, '0'), title: `Session ${n}`, files: fileRefs});
        }
    }
    courseData.push({...c, chapters});
}

// sanity: every path exists
for (const d of docs) {
    if (!existsSync(join(FS, d.path))) throw new Error(`missing content file: ${d.path}`);
}

const j = (v) => JSON.stringify(v);
const docLines = docs
    .map(
        (d) =>
            `    {id: ${j(d.id)}, course: ${j(d.course)}, courseFa: ${j(d.courseFa)}, chapter: ${j(d.chapter)}, kind: ${j(d.kind)}, path: ${j(d.path)}${d.rtl ? ', rtl: true' : ''}}`
    )
    .join(',\n');
const colorLines = COURSES.map((c) => `    ${j(c.name)}: ${j(c.color)}`).join(',\n');

writeFileSync(
    'libs/shared/data-access/src/lib/content-catalog.ts',
    `import {StudyDoc} from './study-doc.model';\n\n` +
        `/** Reader catalog — generated from bundled content by tools/gen-catalog.mjs. */\n` +
        `export const CONTENT_CATALOG: readonly StudyDoc[] = [\n${docLines}\n];\n\n` +
        `/** Accent colour per course. */\n` +
        `export const COURSE_COLOR: Readonly<Record<string, string>> = {\n${colorLines}\n};\n\n` +
        `/** Look up a document by id. */\nexport function findDoc(id: string): StudyDoc | undefined {\n    return CONTENT_CATALOG.find((doc) => doc.id === id);\n}\n\n` +
        `/** Index of a document in the catalog, or -1. */\nexport function docIndex(id: string): number {\n    return CONTENT_CATALOG.findIndex((doc) => doc.id === id);\n}\n`
);

const courseLines = courseData
    .map((c) => {
        const chaps = c.chapters
            .map((ch) => {
                const fs = ch.files
                    .map((f) => `{kind: ${j(f.kind)}, tag: ${j(f.tag)}, docId: ${j(f.docId)}}`)
                    .join(', ');
                return `            {no: ${j(ch.no)}, title: ${j(ch.title)}, files: [${fs}]}`;
            })
            .join(',\n');
        return `    {\n        id: ${j(c.id)}, name: ${j(c.name)}, fa: ${j(c.fa)}, glyph: ${j(c.glyph)}, color: ${j(c.color)},\n        semester: ${j(c.semester)},\n        description: ${j(c.description)},\n        chapters: [\n${chaps}\n        ]\n    }`;
    })
    .join(',\n');

writeFileSync(
    'libs/shared/data-access/src/lib/course-catalog.ts',
    `import {Course} from './course.model';\n\n` +
        `/** Course catalog — generated from bundled content by tools/gen-catalog.mjs. */\n` +
        `export const COURSES: readonly Course[] = [\n${courseLines}\n];\n\n` +
        `/** Look up a course by id. */\nexport function findCourse(id: string): Course | undefined {\n    return COURSES.find((course) => course.id === id);\n}\n\n` +
        `/** Total study files in a course. */\nexport function courseFileCount(course: Course): number {\n    return course.chapters.reduce((total, ch) => total + ch.files.length, 0);\n}\n`
);

console.log(
    `gen-catalog: ${docs.length} docs across ${courseData.length} courses → content-catalog.ts, course-catalog.ts`
);
for (const c of courseData) console.log(`  ${c.id}: ${c.chapters.length} chapters`);
