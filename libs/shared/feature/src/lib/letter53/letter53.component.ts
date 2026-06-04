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

import {IslamicTextsService, Mood, Passage, Section} from '@studify/shared/data-access';
import {SeoService, copyText, highlight, matches, normalize, openTranslate} from '@studify/shared/utils';

const MOODS: readonly Mood[] = ['midnight', 'nebula', 'ivory'];

interface IndexedPassage extends Passage {
    norm: string;
}

type Row = {kind: 'header'; section: Section; n: number} | {kind: 'passage'; passage: IndexedPassage};

interface LangState {
    ar: boolean;
    fa: boolean;
    en: boolean;
}

/** Letter 53 reference tool — trilingual passages with fault-tolerant search,
 *  section navigation, language toggle and copy/translate. Follows Studify - Letter 53.html. */
@Component({
    selector: 'studify-letter53',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink],
    templateUrl: './letter53.component.html'
})
export class Letter53Component {
    private readonly texts = inject(IslamicTextsService);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly document = inject(DOCUMENT);
    private readonly seo = inject(SeoService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected readonly moods = MOODS;

    protected readonly sections = signal<Section[]>([]);
    private readonly passages = signal<IndexedPassage[]>([]);
    protected readonly query = signal('');
    protected readonly activeSection = signal('all');
    protected readonly langs = signal<LangState>({ar: true, fa: true, en: true});
    protected readonly stuck = signal(false);
    protected readonly mood = signal<Mood>('midnight');
    protected readonly loadError = signal(false);

    protected readonly rows = computed<Row[]>(() => {
        const q = this.query().trim();
        const active = this.activeSection();
        const sections = this.sections();
        const out: Row[] = [];
        let last: string | null = null;
        for (const passage of this.passages()) {
            if (active !== 'all' && passage.sectionEnglish !== active) {
                continue;
            }
            if (q && !matches(passage.norm, q)) {
                continue;
            }
            if (passage.sectionEnglish !== last) {
                last = passage.sectionEnglish;
                const section = sections.find((s) => s.nameEnglish === passage.sectionEnglish);
                if (section) {
                    out.push({kind: 'header', section, n: sections.indexOf(section) + 1});
                }
            }
            out.push({kind: 'passage', passage});
        }
        return out;
    });

    protected readonly shown = computed(() => this.rows().filter((r) => r.kind === 'passage').length);

    constructor() {
        this.seo.apply({
            title: 'The Covenant to Malik al-Ashtar · Letter 53',
            description:
                "Imam Ali's Letter 53 (Nahj al-Balagha) — 200 passages in Arabic, Persian and English with fault-tolerant search.",
            path: 'letter-53',
            type: 'article'
        });
        this.texts.load().subscribe({
            next: (data) => {
                this.sections.set(data.sections);
                this.passages.set(
                    data.passages.map((p) => ({...p, norm: normalize(`${p.arabic} ${p.farsi} ${p.english}`)}))
                );
            },
            error: () => this.loadError.set(true)
        });
        afterNextRender(() => this.restoreMood());
    }

    protected sectionLabel(section: Section): string {
        return section.nameEnglish.replace(/^Section \d+:\s*/, '');
    }

    protected setSection(id: string): void {
        this.activeSection.set(id);
    }

    protected toggleLang(lang: keyof LangState): void {
        const langs = this.langs();
        const onCount = Object.values(langs).filter(Boolean).length;
        if (langs[lang] && onCount === 1) {
            return;
        }
        this.langs.set({...langs, [lang]: !langs[lang]});
    }

    protected clear(): void {
        this.query.set('');
    }

    protected hl(text: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(highlight(text, this.query()));
    }

    protected copy(passage: Passage): void {
        void copyText(`${passage.arabic}\n\n${passage.farsi}\n\n${passage.english}`);
    }

    protected translate(passage: Passage): void {
        openTranslate(passage.arabic, 'ar');
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
