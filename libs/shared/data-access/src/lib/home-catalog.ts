/** A course as shown on the home grid (superset of the built course catalog). */
export interface HomeCourse {
    name: string;
    fa: string;
    glyph: string;
    color: string;
    meta: string;
    /** Set when a course page exists; otherwise the card is a placeholder. */
    courseId?: string;
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
                meta: '4 sessions · 4 files'
            },
            {
                name: 'News Translation',
                fa: 'ترجمهٔ متون مطبوعاتی',
                glyph: '📰',
                color: '#E8A93C',
                meta: '9 weeks · 44 files'
            },
            {
                name: 'Quran in Translation',
                fa: 'ترجمهٔ قرآن',
                glyph: '📖',
                color: '#46C39A',
                meta: '8 sessions · 15 files'
            },
            {
                name: 'The Way of Research',
                fa: 'روش تحقیق',
                glyph: '🔬',
                color: '#9384F2',
                meta: '2 sessions · 2 files',
                courseId: 'the-way-of-research'
            }
        ]
    },
    {
        name: 'Semester 2',
        fa: 'نیم‌سال دوم',
        courses: [
            {
                name: 'Translation of Islamic Texts',
                fa: 'ترجمهٔ متون اسلامی',
                glyph: '📜',
                color: '#34CBB8',
                meta: 'Letter 53 · 300 terms'
            }
        ]
    }
];

/** Headline stats for the hero. */
export const HOME_STATS = {semesters: 2, courses: 6, files: 88} as const;
