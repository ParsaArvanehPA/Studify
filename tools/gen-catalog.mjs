/**
 * One-time catalog generator. Scans the bundled study content under
 * apps/studify/src/assets/sem and writes the reader + course catalogs with
 * guaranteed-correct paths. Re-run after adding content: `node tools/gen-catalog.mjs`.
 */
import {existsSync, readdirSync, statSync, writeFileSync} from 'node:fs';
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
        id: 'critical-discourse-analysis',
        name: 'Critical Discourse Analysis',
        fa: 'تحلیل گفتمان انتقادی',
        glyph: '🔍',
        color: '#3BB6D6',
        semester: 'Semester 1',
        rtl: false,
        dir: 'semester-1/critical-discourse-analysis',
        kind: 'flat',
        prefix: 'cda',
        description:
            'Reading power and ideology in text and talk — analysis across three chapter study guides, with an exam-question set.'
    },
    {
        id: 'news-translation',
        name: 'News Translation',
        fa: 'ترجمهٔ متون مطبوعاتی',
        glyph: '📰',
        color: '#E8A93C',
        semester: 'Semester 1',
        rtl: false,
        dir: 'semester-1/news-translation',
        kind: 'news',
        prefix: 'nt',
        description:
            'Journalistic and media translation — power, globalization, news agencies, ideology and audiovisual reception — each weekly reading in a comprehensive guide and an exam cram.'
    },
    {
        id: 'quran-in-translation',
        name: 'Quran in Translation',
        fa: 'ترجمهٔ قرآن',
        glyph: '📖',
        color: '#46C39A',
        semester: 'Semester 1',
        rtl: true,
        dir: 'semester-1/quran-in-translation',
        kind: 'quran',
        prefix: 'qr',
        description: 'Translating the Qur’an — session study guides and exam crams, plus an ultimate exam cheat sheet.'
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
        color: '#5BA8F0',
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

const isHtml = (f) => f.endsWith('.html');
const numOf = (s) => parseFloat((s.match(/[\d.]+/) || ['0'])[0]);
const human = (f) =>
    f
        .replace(/\.html$/, '')
        .replace(/_(Comprehensive|Exam-Cram|FA)/g, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

for (const c of COURSES) {
    const base = join(FS, ASSETS, c.dir);
    const served = `${ASSETS}/${c.dir}`;
    const chapters = [];
    const push = (id, chapter, kind, relPath, rtl = c.rtl) => {
        docs.push({id, course: c.name, courseFa: c.fa, chapter, kind, path: relPath, rtl});
    };

    if (c.kind === 'chapters') {
        const byNum = new Map();
        for (const f of readdirSync(base).filter(isHtml).sort()) {
            const m = /chapter-(\d+)-summary(-concise)?\.html$/.exec(f);
            if (!m) continue;
            const n = m[1];
            const concise = !!m[2];
            const id = concise ? `${c.prefix}-${n}` : `${c.prefix}-${n}-guide`;
            push(id, `Chapter ${n}`, concise ? 'Concise' : 'Study Guide', `${served}/${f}`);
            if (!byNum.has(n)) byNum.set(n, []);
            byNum
                .get(n)
                .push({kind: concise ? 'Concise' : 'Study Guide', tag: concise ? 'concise' : 'guide', docId: id});
        }
        for (const [n, files] of [...byNum].sort((a, b) => +a[0] - +b[0])) {
            files.sort((a) => (a.tag === 'guide' ? -1 : 1));
            chapters.push({no: n.padStart(2, '0'), title: `Chapter ${n}`, files});
        }
    } else if (c.kind === 'flat') {
        const files = readdirSync(base).filter(isHtml).sort();
        let last = 0;
        for (const f of files) {
            const m = /chapter-(\d+)-study-guide\.html$/.exec(f);
            if (!m) continue;
            const id = `${c.prefix}-${m[1]}-guide`;
            push(id, `Chapter ${m[1]}`, 'Study Guide', `${served}/${f}`);
            chapters.push({
                no: m[1].padStart(2, '0'),
                title: `Chapter ${m[1]}`,
                files: [{kind: 'Study Guide', tag: 'guide', docId: id}]
            });
            last = Math.max(last, +m[1]);
        }
        if (files.includes('exam-questions.html')) {
            const id = `${c.prefix}-exam`;
            push(id, 'Exam Questions', 'Self-test', `${served}/exam-questions.html`);
            chapters.push({
                no: String(last + 1).padStart(2, '0'),
                title: 'Exam Questions',
                files: [{kind: 'Self-test', tag: 'quiz', docId: id}]
            });
        }
    } else if (c.kind === 'quran') {
        const sessions = readdirSync(base)
            .filter((d) => statSync(join(base, d)).isDirectory() && /^session-/.test(d))
            .sort((a, b) => numOf(a) - numOf(b));
        for (const s of sessions) {
            const label = s.replace('session-', '');
            const slug = label.replace(/\./g, '-');
            const files = readdirSync(join(base, s));
            const refs = [];
            const guide = files.find((f) => /study-guide\.html$/.test(f));
            const cram = files.find((f) => /exam-cram\.html$/.test(f));
            if (guide) {
                const id = `${c.prefix}-${slug}-guide`;
                push(id, `Session ${label}`, 'Study Guide', `${served}/${s}/${guide}`);
                refs.push({kind: 'Study Guide', tag: 'guide', docId: id});
            }
            if (cram) {
                const id = `${c.prefix}-${slug}-cram`;
                push(id, `Session ${label}`, 'Exam Cram', `${served}/${s}/${cram}`);
                refs.push({kind: 'Exam Cram', tag: 'concise', docId: id});
            }
            if (refs.length)
                chapters.push({no: label.replace('.', '').padStart(2, '0'), title: `Session ${label}`, files: refs});
        }
        if (readdirSync(base).includes('ULTIMATE-EXAM-CHEAT-SHEET.html')) {
            const id = `${c.prefix}-cheatsheet`;
            push(id, 'Exam Cheat Sheet', 'Cheat Sheet', `${served}/ULTIMATE-EXAM-CHEAT-SHEET.html`);
            chapters.push({
                no: '99',
                title: 'Exam Cheat Sheet',
                files: [{kind: 'Cheat Sheet', tag: 'concise', docId: id}]
            });
        }
    } else if (c.kind === 'news') {
        const weeks = readdirSync(base)
            .filter((d) => /^Week-/.test(d) && statSync(join(base, d)).isDirectory())
            .sort((a, b) => numOf(a) - numOf(b));
        let n = 0;
        for (const w of weeks) {
            const wslug = w.toLowerCase();
            const groups = new Map();
            for (const sub of ['Comprehensive', 'Exam-Cram']) {
                const subdir = join(base, w, sub);
                if (!existsSync(subdir)) continue;
                for (const f of readdirSync(subdir).filter(isHtml)) {
                    const key = human(f);
                    const isFa = /_FA\.html$/.test(f);
                    const isFull = sub === 'Comprehensive';
                    const kind = isFa
                        ? isFull
                            ? 'فارسی · جامع'
                            : 'فارسی · فشرده'
                        : isFull
                          ? 'Comprehensive'
                          : 'Exam Cram';
                    const tag = isFull ? 'guide' : 'concise';
                    const variant = isFa ? (isFull ? 'fa-full' : 'fa-cram') : isFull ? 'full' : 'cram';
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key).push({file: `${served}/${w}/${sub}/${f}`, kind, tag, variant});
                }
            }
            for (const [title, items] of groups) {
                n++;
                const refs = [];
                items.sort((a) => (a.tag === 'guide' ? -1 : 1));
                for (const it of items) {
                    const id = `${c.prefix}-${wslug}-${n}-${it.variant}`;
                    push(
                        id,
                        `${w.replace('Week-', 'Week ')} · ${title}`,
                        it.kind,
                        it.file,
                        it.variant.startsWith('fa')
                    );
                    refs.push({kind: it.kind, tag: it.tag, docId: id});
                }
                chapters.push({
                    no: String(n).padStart(2, '0'),
                    title: `${title} · ${w.replace('Week-', 'Wk ')}`,
                    files: refs
                });
            }
        }
    } else {
        const sessions = readdirSync(base)
            .filter((d) => /^session-\d+$/.test(d))
            .sort((a, b) => numOf(a) - numOf(b));
        for (const s of sessions) {
            const num = s.split('-')[1];
            const files = readdirSync(join(base, s));
            const refs = [];
            const guide = files.find((f) => /-(study-guide|summary)\.html$/.test(f));
            const qa = files.find((f) => /-qa\.html$/.test(f));
            if (guide) {
                const id = `${c.prefix}-${num}-guide`;
                push(id, `Session ${num}`, 'Study Guide', `${served}/${s}/${guide}`);
                refs.push({kind: 'Study Guide', tag: 'guide', docId: id});
            }
            if (qa) {
                const id = `${c.prefix}-${num}-qa`;
                push(id, `Session ${num}`, 'Self-test', `${served}/${s}/${qa}`);
                refs.push({kind: 'Self-test', tag: 'quiz', docId: id});
            }
            if (refs.length) chapters.push({no: num.padStart(2, '0'), title: `Session ${num}`, files: refs});
        }
    }
    courseData.push({...c, chapters});
}

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

console.log(`gen-catalog: ${docs.length} docs across ${courseData.length} courses`);
for (const c of courseData) {
    console.log(
        `  ${c.id}: ${c.chapters.length} chapters, ${c.chapters.reduce((a, ch) => a + ch.files.length, 0)} files`
    );
}
