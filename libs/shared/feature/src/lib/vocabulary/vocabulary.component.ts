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
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';

import {IslamicTextsService, Mood, VocabEntry} from '@studify/shared/data-access';
import {SeoService, highlight, matches, normalize} from '@studify/shared/utils';

const MOODS: readonly Mood[] = ['midnight', 'nebula', 'ivory'];

interface IndexedVocab extends VocabEntry {
    norm: string;
}

/** Letter 53 vocabulary — 300 trilingual terms with fault-tolerant search. Follows Studify - Vocabulary.html. */
@Component({
    selector: 'studify-vocabulary',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink],
    templateUrl: './vocabulary.component.html'
})
export class VocabularyComponent {
    private readonly texts = inject(IslamicTextsService);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly document = inject(DOCUMENT);
    private readonly seo = inject(SeoService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected readonly moods = MOODS;

    private readonly vocab = signal<IndexedVocab[]>([]);
    protected readonly query = signal('');
    protected readonly stuck = signal(false);
    protected readonly mood = signal<Mood>('midnight');
    protected readonly loadError = signal(false);

    protected readonly total = computed(() => this.vocab().length);
    protected readonly visible = computed<IndexedVocab[]>(() => {
        const q = this.query().trim();
        if (!q) {
            return this.vocab();
        }
        return this.vocab().filter((v) => matches(v.norm, q));
    });

    constructor() {
        this.seo.apply({
            title: 'Letter 53 Vocabulary — 300 terms',
            description:
                'A trilingual glossary of 300 specialist terms from Letter 53 of Nahj al-Balagha — Arabic, Persian and English with fault-tolerant search.',
            path: 'vocabulary',
            type: 'article'
        });
        this.texts.load().subscribe({
            next: (data) =>
                this.vocab.set(data.vocab.map((v) => ({...v, norm: normalize(`${v.arabic} ${v.farsi} ${v.english}`)}))),
            error: () => this.loadError.set(true)
        });
        afterNextRender(() => this.restoreMood());
    }

    protected hl(text: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(highlight(text, this.query()));
    }

    protected clear(): void {
        this.query.set('');
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
        const cursor = this.document.querySelector<HTMLElement>('.ds-cursor');
        if (cursor) {
            cursor.style.left = `${event.clientX}px`;
            cursor.style.top = `${event.clientY}px`;
        }
    }
}
