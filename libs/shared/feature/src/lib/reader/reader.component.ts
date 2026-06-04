import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    OnInit,
    PLATFORM_ID,
    ViewEncapsulation,
    afterNextRender,
    computed,
    inject,
    signal
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {
    CONTENT_CATALOG,
    COURSES,
    COURSE_COLOR,
    ContentLoaderService,
    ReadingSurface,
    StudyDoc,
    docIndex
} from '@studify/shared/data-access';
import {ContentNormalizerService, SeoService} from '@studify/shared/utils';

const FONT_MIN = 15;
const FONT_MAX = 26;
const FONT_DEFAULT = 19;
const WORDS_PER_MIN = 200;

const SURFACES: readonly ReadingSurface[] = ['paper', 'sepia', 'midnight'];

const KEY = {
    surface: 'studify:surface',
    font: 'studify:fontsize',
    mood: 'studify:mood',
    last: 'studify:lastSession'
};

/**
 * The Reader — a faithful rebuild of `Studify - Reader.html`. Loads any catalog
 * document, normalizes it into the design-system `.prose` format, and presents it
 * with reading surfaces, ambient moods, font sizing, scroll progress and chapter
 * navigation. SSR/SSG-safe: content is fetched + normalized during render; all
 * browser-only wiring runs in `afterNextRender`.
 */
@Component({
    selector: 'studify-reader',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    templateUrl: './reader.component.html',
    styleUrl: './reader.component.scss'
})
export class ReaderComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly loader = inject(ContentLoaderService);
    private readonly normalizer = inject(ContentNormalizerService);
    private readonly seo = inject(SeoService);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected readonly surfaces = SURFACES;

    protected readonly doc = signal<StudyDoc | undefined>(undefined);
    protected readonly loading = signal(true);
    protected readonly error = signal(false);
    protected readonly rtl = signal(false);
    protected readonly proseHtml = signal<SafeHtml>('');
    protected readonly readMinutes = signal(0);

    protected readonly surface = signal<ReadingSurface>('sepia');
    protected readonly fontSize = signal(FONT_DEFAULT);
    protected readonly progress = signal(0);
    protected readonly stuck = signal(false);

    protected readonly prevDoc = computed(() => this.sibling(-1));
    protected readonly nextDoc = computed(() => this.sibling(1));

    /** Back target: the document's course page (relative to base href), else home. */
    protected readonly backHref = computed(() => {
        const current = this.doc();
        const course = current ? COURSES.find((c) => c.name === current.course) : undefined;
        return course ? `course/${course.id}` : '.';
    });

    constructor() {
        afterNextRender(() => this.restorePreferences());
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => this.loadDoc(params.get('docId')));
    }

    // --- loading + normalizing -----------------------------------------------

    private loadDoc(id: string | null): void {
        const found = id ? CONTENT_CATALOG.find((d) => d.id === id) : CONTENT_CATALOG[0];
        if (!found) {
            this.error.set(true);
            this.loading.set(false);
            return;
        }
        this.doc.set(found);
        this.loading.set(true);
        this.error.set(false);
        this.applyCourseColor(found.course);
        this.applySeo(found);

        this.loader.load(found.path).subscribe({
            next: (raw) => {
                const normalized = this.normalizer.normalize(raw, !!found.rtl);
                const minutes = this.estimateMinutes(normalized.html);
                this.rtl.set(normalized.rtl);
                this.readMinutes.set(minutes);
                const html =
                    this.buildHead(found, minutes) + normalized.html + this.buildNav(found) + this.buildEnd(found);
                this.proseHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
                this.loading.set(false);
                this.rememberLast(found);
            },
            error: () => {
                this.error.set(true);
                this.loading.set(false);
            }
        });
    }

    private buildHead(d: StudyDoc, minutes: number): string {
        const fa = d.courseFa ? `<div class="dfa">${d.courseFa}</div>` : '';
        return (
            `<header class="dochead"><div class="dk">${d.course} · ${d.chapter}</div>` +
            `<h1>${d.chapter}</h1>${fa}` +
            `<div class="dmeta"><span>${d.kind}</span><span>${minutes} min read</span></div></header>`
        );
    }

    private buildNav(d: StudyDoc): string {
        const prev = this.sibling(-1, d);
        const next = this.sibling(1, d);
        const card = (sib: StudyDoc | undefined, dir: 'prev' | 'next'): string => {
            if (!sib) {
                const label = dir === 'next' ? 'You’ve reached the end' : 'Start of course';
                return `<span class="cn-card ${dir} disabled"><span class="cn-dir">${label}</span></span>`;
            }
            const label = dir === 'next' ? 'Next chapter' : 'Previous chapter';
            return (
                `<a class="cn-card ${dir}" href="reader/${sib.id}">` +
                `<span class="cn-dir">${label}</span>` +
                `<span class="cn-ttl">${sib.chapter} · ${sib.kind}</span></a>`
            );
        };
        return `<nav class="chapter-nav">${card(prev, 'prev')}${card(next, 'next')}</nav>`;
    }

    private buildEnd(d: StudyDoc): string {
        return (
            `<div class="ds-end"><span class="seal"></span>` +
            `<span>End of ${d.chapter} · ${d.kind}</span><span class="line"></span></div>`
        );
    }

    private estimateMinutes(html: string): number {
        const text = html.replace(/<[^>]+>/g, ' ').trim();
        const words = text ? text.split(/\s+/).length : 0;
        return Math.max(1, Math.round(words / WORDS_PER_MIN));
    }

    private sibling(delta: number, from?: StudyDoc): StudyDoc | undefined {
        const current = from ?? this.doc();
        if (!current) {
            return undefined;
        }
        const sib = CONTENT_CATALOG[docIndex(current.id) + delta];
        return sib && sib.course === current.course ? sib : undefined;
    }

    private applyCourseColor(course: string): void {
        const color = COURSE_COLOR[course];
        if (color) {
            this.document.documentElement.style.setProperty('--course', color);
        }
    }

    private applySeo(d: StudyDoc): void {
        this.seo.apply({
            title: `${d.chapter} · ${d.course}`,
            description: `${d.kind} — ${d.chapter} of ${d.course}, in Studify's unified reader.`,
            path: `reader/${d.id}`,
            type: 'article',
            jsonLd: {
                '@context': 'https://schema.org',
                '@type': 'LearningResource',
                name: `${d.chapter} · ${d.course}`,
                learningResourceType: d.kind,
                inLanguage: d.rtl ? 'fa' : 'en',
                isPartOf: {'@type': 'Course', name: d.course}
            }
        });
    }

    // --- preferences (browser only) ------------------------------------------

    private restorePreferences(): void {
        try {
            const savedSurface = localStorage.getItem(KEY.surface) as ReadingSurface | null;
            if (savedSurface && SURFACES.includes(savedSurface)) {
                this.surface.set(savedSurface);
            }
            const savedFont = Number(localStorage.getItem(KEY.font));
            if (savedFont >= FONT_MIN && savedFont <= FONT_MAX) {
                this.fontSize.set(savedFont);
            }
        } catch {
            /* storage unavailable */
        }
    }

    protected setSurface(surface: ReadingSurface): void {
        this.surface.set(surface);
        this.persist(KEY.surface, surface);
    }

    protected changeFont(delta: number): void {
        this.fontSize.update((size) => Math.min(FONT_MAX, Math.max(FONT_MIN, size + delta)));
        this.persist(KEY.font, String(this.fontSize()));
    }

    private rememberLast(d: StudyDoc): void {
        const course = COURSES.find((c) => c.name === d.course);
        this.persist(
            KEY.last,
            JSON.stringify({
                course: d.course,
                color: COURSE_COLOR[d.course] || '#E6B557',
                line: `${d.chapter} · ${d.kind}`,
                glyph: course?.glyph,
                courseId: course?.id,
                doc: d.id
            })
        );
    }

    private persist(key: string, value: string): void {
        if (!this.isBrowser) {
            return;
        }
        try {
            localStorage.setItem(key, value);
        } catch {
            /* storage unavailable */
        }
    }

    // --- chrome: scroll progress, sticky bar, cursor glow, keyboard ----------

    @HostListener('window:scroll')
    protected onScroll(): void {
        if (!this.isBrowser) {
            return;
        }
        const el = this.document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        this.progress.set(max > 0 ? (el.scrollTop / max) * 100 : 0);
        this.stuck.set(el.scrollTop > 20);
    }

    @HostListener('window:mousemove', ['$event'])
    protected onMouseMove(event: MouseEvent): void {
        if (!this.isBrowser) {
            return;
        }
        this.document.body.classList.add('cursor-on');
        const cursor = this.document.getElementById('ds-cursor');
        if (cursor) {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
        }
    }

    @HostListener('window:keydown', ['$event'])
    protected onKey(event: KeyboardEvent): void {
        if ((event.target as HTMLElement)?.tagName === 'INPUT') {
            return;
        }
        if (event.key === 'ArrowRight' && this.nextDoc()) {
            this.go(this.nextDoc());
        } else if (event.key === 'ArrowLeft' && this.prevDoc()) {
            this.go(this.prevDoc());
        }
    }

    private go(target: StudyDoc | undefined): void {
        if (target) {
            this.document.location.assign(`reader/${target.id}`);
        }
    }
}
