import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    PLATFORM_ID,
    ViewEncapsulation,
    afterNextRender,
    computed,
    inject,
    signal
} from '@angular/core';
import {RouterLink} from '@angular/router';

import {HOME_STATS, HomeCourse, Mood, SEMESTERS} from '@studify/shared/data-access';
import {SeoService} from '@studify/shared/utils';

const MOODS: readonly Mood[] = ['midnight', 'nebula', 'ivory'];
const COUNT_MS = 1100;

interface SearchHit extends HomeCourse {
    sem: string;
}

interface ResumeChip {
    course: string;
    color: string;
    line: string;
    glyph?: string;
    doc?: string;
}

/** Home page — hero + semester course grid, following Studify - Dazzle Home.html. */
@Component({
    selector: 'studify-home',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
    private readonly document = inject(DOCUMENT);
    private readonly seo = inject(SeoService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected readonly semesters = SEMESTERS;
    protected readonly moods = MOODS;

    protected readonly stuck = signal(false);
    protected readonly revealed = signal(false);
    protected readonly mood = signal<Mood>('midnight');
    protected readonly returning = signal(false);
    protected readonly resume = signal<ResumeChip | undefined>(undefined);

    protected readonly query = signal('');
    protected readonly counts = signal({semesters: 0, courses: 0, files: 0});

    private readonly index: SearchHit[] = SEMESTERS.flatMap((s) => s.courses.map((c) => ({...c, sem: s.name})));

    protected readonly results = computed<SearchHit[]>(() => {
        const q = this.query().trim().toLowerCase();
        if (!q) {
            return [];
        }
        return this.index.filter((c) => `${c.name} ${c.fa} ${c.meta} ${c.sem}`.toLowerCase().includes(q));
    });

    constructor() {
        this.seo.apply({
            title: 'University study materials, beautifully unified',
            description:
                'Studify — your whole English Translation Studies syllabus: every course, summary and reference in one quiet reader.',
            path: '',
            type: 'website'
        });
        afterNextRender(() => {
            this.revealed.set(true);
            this.restoreMood();
            this.restoreResume();
            this.countUp();
        });
    }

    protected courseTarget(course: HomeCourse): string[] | null {
        if (course.courseId) {
            return ['/course', course.courseId];
        }
        if (course.link) {
            return [course.link];
        }
        return null;
    }

    protected rememberCourse(course: HomeCourse): void {
        if (!this.isBrowser) {
            return;
        }
        try {
            localStorage.setItem(
                'studify:lastSession',
                JSON.stringify({course: course.name, color: course.color, line: course.meta, glyph: course.glyph})
            );
        } catch {
            /* storage unavailable */
        }
    }

    private restoreResume(): void {
        try {
            const raw = localStorage.getItem('studify:lastSession');
            if (!raw) {
                return;
            }
            this.resume.set(JSON.parse(raw) as ResumeChip);
            this.returning.set(true);
        } catch {
            /* storage unavailable */
        }
    }

    private restoreMood(): void {
        try {
            const saved = localStorage.getItem('studify:mood') as Mood | null;
            if (saved && MOODS.includes(saved)) {
                this.mood.set(saved);
            }
        } catch {
            /* storage unavailable */
        }
    }

    private countUp(): void {
        const target = HOME_STATS;
        const start = performance.now();
        const tick = (now: number): void => {
            const k = Math.min(1, (now - start) / COUNT_MS);
            const e = 1 - Math.pow(1 - k, 3);
            this.counts.set({
                semesters: Math.round(target.semesters * e),
                courses: Math.round(target.courses * e),
                files: Math.round(target.files * e)
            });
            if (k < 1) {
                requestAnimationFrame(tick);
            }
        };
        requestAnimationFrame(tick);
    }

    protected setMood(mood: Mood): void {
        this.mood.set(mood);
        this.document.documentElement.dataset['mood'] = mood;
        if (this.isBrowser) {
            try {
                localStorage.setItem('studify:mood', mood);
            } catch {
                /* storage unavailable */
            }
        }
    }

    protected moodSwatch(mood: Mood): string {
        const swatch = mood === 'midnight' ? 'm-mid' : mood === 'nebula' ? 'm-neb' : 'm-ivo';
        return swatch + (this.mood() === mood ? ' sel' : '');
    }

    protected resumeTarget(): string {
        const chip = this.resume();
        return chip?.doc ? `/reader/${chip.doc}` : '/';
    }

    @HostListener('window:scroll')
    protected onScroll(): void {
        if (this.isBrowser) {
            this.stuck.set(this.document.documentElement.scrollTop > 30);
        }
    }

    @HostListener('window:mousemove', ['$event'])
    protected onMouseMove(event: MouseEvent): void {
        if (!this.isBrowser) {
            return;
        }
        this.document.body.classList.add('cursor-on');
        const cursor = this.document.getElementById('cursor');
        if (cursor) {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
        }
        const dx = event.clientX / window.innerWidth - 0.5;
        const dy = event.clientY / window.innerHeight - 0.5;
        this.document.querySelectorAll<HTMLElement>('.calli').forEach((el) => {
            const depth = Number(el.dataset['depth'] || 0);
            el.style.marginLeft = `${dx * depth}px`;
            el.style.marginTop = `${dy * depth * 0.5}px`;
        });
    }
}
