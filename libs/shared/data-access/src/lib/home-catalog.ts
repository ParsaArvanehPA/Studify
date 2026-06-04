/** A course as shown on the home grid (superset of the built course catalog). */
export interface HomeCourse {
    name: string;
    fa: string;
    glyph: string;
    color: string;
    meta: string;
    /** Set when a course page exists; otherwise the card is a placeholder. */
    courseId?: string;
    /** Direct link target for tool-style courses (e.g. Letter 53). */
    link?: string;
}

/** A semester group on the home page. */
export interface Semester {
    name: string;
    fa: string;
    courses: HomeCourse[];
}

/** Home semester → course grid (ported from the Dazzle Home prototype). */
export const SEMESTERS: readonly Semester[] = [
    {
        name: 'Semester 1',
        fa: 'نیم‌سال یکم',
        courses: [
            {
                name: 'Creative Writing',
                fa: 'نگارش خلاق',
                glyph: '✍️',
                color: '#F0726B',
                meta: '6 chapters · 7 files',
                courseId: 'creative-writing'
            },
            {
                name: 'Critical Discourse Analysis',
                fa: 'تحلیل گفتمان انتقادی',
                glyph: '🔍',
                color: '#3BB6D6',
                meta: '3 chapters · exam · 4 files',
                courseId: 'critical-discourse-analysis'
            },
            {
                name: 'News Translation',
                fa: 'ترجمهٔ متون مطبوعاتی',
                glyph: '📰',
                color: '#E8A93C',
                meta: '19 readings · 40 files',
                courseId: 'news-translation'
            },
            {
                name: 'Quran in Translation',
                fa: 'ترجمهٔ قرآن',
                glyph: '📖',
                color: '#46C39A',
                meta: '8 sessions · 15 files',
                courseId: 'quran-in-translation'
            },
            {
                name: 'The Way of Research',
                fa: 'روش تحقیق',
                glyph: '🔬',
                color: '#9384F2',
                meta: '9 sessions · 18 files',
                courseId: 'the-way-of-research'
            }
        ]
    },
    {
        name: 'Semester 2',
        fa: 'نیم‌سال دوم',
        courses: [
            {
                name: 'Online Journalism',
                fa: 'روزنامه‌نگاری برخط',
                glyph: '📰',
                color: '#5BA8F0',
                meta: '8 sessions · 8 files',
                courseId: 'online-journalism'
            },
            {
                name: 'Political Translation',
                fa: 'ترجمهٔ سیاسی',
                glyph: '🗳️',
                color: '#5BC9A0',
                meta: '6 sessions · 6 files',
                courseId: 'political-translation'
            },
            {
                name: 'Translation of Islamic Texts',
                fa: 'ترجمهٔ متون اسلامی',
                glyph: '📜',
                color: '#34CBB8',
                meta: 'Letter 53 · 300 terms',
                courseId: 'translation-of-islamic-texts'
            }
        ]
    }
];

/** Headline stats for the hero. */
export const HOME_STATS = {semesters: 2, courses: 8, files: 98} as const;
