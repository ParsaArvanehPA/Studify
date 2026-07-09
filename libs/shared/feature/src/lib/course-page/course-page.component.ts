import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    OnInit,
    PLATFORM_ID,
    ViewEncapsulation,
    afterNextRender,
    inject,
    signal
} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';

import {Course, Mood, courseFileCount, findCourse} from '@studify/shared/data-access';
import {SeoService} from '@studify/shared/utils';

const MOODS: readonly Mood[] = ['midnight', 'nebula', 'ivory'];

interface ResumeChip {
    course: string;
    line: string;
    doc: string;
}

/** Course page — immersive cover + chapter index, following Studify - Course Page.html. */
@Component({
    selector: 'studify-course-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink],
    templateUrl: './course-page.component.html',
    styleUrl: './course-page.component.scss'
})
export class CoursePageComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly seo = inject(SeoService);
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected readonly moods = MOODS;

    protected readonly course = signal<Course | undefined>(undefined);
    protected readonly fileCount = signal(0);
    protected readonly stuck = signal(false);
    protected readonly revealed = signal(false);
    protected readonly resume = signal<ResumeChip | undefined>(undefined);
    protected readonly mood = signal<Mood>('midnight');
    protected readonly activeVideo = signal<string | null>(null);

    protected toggleVideo(url: string | undefined): void {
        if (!url) return;
        this.activeVideo.update((v) => (v === url ? null : url));
    }

    constructor() {
        afterNextRender(() => {
            this.revealed.set(true);
            this.restoreMood();
            this.restoreResume();
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => this.loadCourse(params.get('courseId')));
    }

    private loadCourse(id: string | null): void {
        const course = id ? findCourse(id) : undefined;
        if (!course) {
            return;
        }
        this.course.set(course);
        this.fileCount.set(courseFileCount(course));
        this.document.documentElement.style.setProperty('--course', course.color);
        this.seo.apply({
            title: course.name,
            description: course.description,
            path: `course/${course.id}`,
            type: 'website'
        });
    }

    private restoreResume(): void {
        try {
            const raw = localStorage.getItem('studify:lastSession');
            if (!raw) {
                return;
            }
            const chip = JSON.parse(raw) as ResumeChip;
            if (chip.course === this.course()?.name && chip.doc) {
                this.resume.set(chip);
            }
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

    @HostListener('window:scroll')
    protected onScroll(): void {
        if (this.isBrowser) {
            this.stuck.set(this.document.documentElement.scrollTop > 20);
        }
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
}
