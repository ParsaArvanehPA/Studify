import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    PLATFORM_ID,
    ViewEncapsulation,
    afterNextRender,
    computed,
    inject,
    signal,
    viewChild
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';

import {Couplet, Mood, Poem, PoetryDeck, PoetryService, PoetrySession} from '@studify/shared/data-access';
import {SeoService, copyText, matches, normalize} from '@studify/shared/utils';

const MOODS: readonly Mood[] = ['midnight', 'nebula', 'ivory'];
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
/** A word for highlighting: letters, digits, combining marks (Arabic diacritics) and the Persian half-space. */
const WORD = /[\p{L}\p{N}\p{M}‌]+/gu;
/** Distance from the viewport top to just below the sticky header + search bar. */
const STICKY_OFFSET = 150;

interface IndexedCouplet {
    /** 1-based couplet number within its poem. */
    n: number;
    lines: Couplet;
    /** Normalized haystack — also with spaces removed, so «شعر های» ≈ «شعرهای» and «heart's» ≈ «hearts». */
    norm: string;
}

interface PoemGroup {
    poem: Poem;
    session: PoetrySession;
    couplets: IndexedCouplet[];
}

interface ShownGroup extends PoemGroup {
    hits: IndexedCouplet[];
}

interface LangState {
    fa: boolean;
    en: boolean;
}

function searchable(text: string): string {
    const n = normalize(text);
    return `${n} ${n.replace(/ /g, '')}`;
}

/** Pre-index every couplet; poem titles (and the course-pack number) are searchable too. */
function indexDeck(deck: PoetryDeck): PoemGroup[] {
    return deck.poems.map((poem) => {
        const titles = `${poem.fa} ${poem.en} ${poem.ref ?? ''}`;
        return {
            poem,
            session: deck.sessions.find((s) => s.no === poem.session) ?? {no: poem.session, fa: ''},
            couplets: poem.couplets.map((lines, i) => ({
                n: i + 1,
                lines,
                norm: searchable(`${titles} ${lines[0].fa} ${lines[1].fa} ${lines[0].en} ${lines[1].en}`)
            }))
        };
    });
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'})[c] ?? c);
}

/** Query tokens worth highlighting — single letters are dropped unless they are all there is. */
function highlightTokens(query: string): string[] {
    const all = normalize(query).split(' ').filter(Boolean);
    const long = all.filter((t) => t.length > 1);
    return long.length ? long : all;
}

/** Wrap matching words in <mark>, escaping everything else. */
function markWords(text: string, tokens: string[]): string {
    if (!tokens.length) {
        return escapeHtml(text);
    }
    let out = '';
    let last = 0;
    for (const m of text.matchAll(WORD)) {
        const word = m[0];
        const at = m.index ?? 0;
        const nw = normalize(word);
        out += escapeHtml(text.slice(last, at));
        out += tokens.some((t) => nw.includes(t)) ? `<mark>${escapeHtml(word)}</mark>` : escapeHtml(word);
        last = at + word.length;
    }
    return out + escapeHtml(text.slice(last));
}

/** Poetry Translation mid-term cheat sheet — every couplet, hemistich by hemistich in Persian and English,
 *  with fault-tolerant search, poem filter and a language toggle. Shares the Letter 53 reference chrome. */
@Component({
    selector: 'studify-poetry',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink],
    templateUrl: './poetry.component.html'
})
export class PoetryComponent {
    private readonly poetry = inject(PoetryService);
    private readonly sanitizer = inject(DomSanitizer);
    private readonly document = inject(DOCUMENT);
    private readonly seo = inject(SeoService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

    protected readonly moods = MOODS;

    private readonly all = signal<PoemGroup[]>([]);
    protected readonly loaded = signal(false);
    protected readonly loadError = signal(false);
    protected readonly query = signal('');
    protected readonly activePoem = signal('all');
    protected readonly langs = signal<LangState>({fa: true, en: true});
    protected readonly copied = signal<string | null>(null);
    protected readonly stuck = signal(false);
    protected readonly mood = signal<Mood>('midnight');

    protected readonly poems = computed(() => this.all().map((g) => g.poem));
    protected readonly total = computed(() => this.all().reduce((sum, g) => sum + g.couplets.length, 0));
    protected readonly sessionCount = computed(() => new Set(this.poems().map((p) => p.session)).size);

    private readonly tokens = computed(() => highlightTokens(this.query()));

    protected readonly groups = computed<ShownGroup[]>(() => {
        const q = this.query().trim();
        const active = this.activePoem();
        return this.all()
            .filter((g) => active === 'all' || g.poem.id === active)
            .map((g) => ({...g, hits: q ? g.couplets.filter((c) => matches(c.norm, q)) : g.couplets}))
            .filter((g) => g.hits.length > 0);
    });

    protected readonly shown = computed(() => this.groups().reduce((sum, g) => sum + g.hits.length, 0));

    constructor() {
        this.seo.apply({
            title: 'Poetry Translation · Mid-term cheat sheet',
            description:
                'ترجمهٔ شعر — the Persian poems from sessions 1–6, couplet by couplet with their English renderings, with fault-tolerant Persian/English search.',
            path: 'poetry-translation',
            type: 'article'
        });
        this.poetry.load().subscribe({
            next: (deck) => {
                this.all.set(indexDeck(deck));
                this.loaded.set(true);
            },
            error: () => this.loadError.set(true)
        });
        afterNextRender(() => this.restoreMood());
    }

    protected onQuery(value: string): void {
        this.query.set(value);
        this.revealList();
    }

    protected clear(): void {
        this.query.set('');
        this.searchInput()?.nativeElement.focus();
    }

    protected setPoem(id: string): void {
        this.activePoem.set(id);
        this.revealList();
    }

    protected toggleLang(lang: keyof LangState): void {
        const langs = this.langs();
        const other: keyof LangState = lang === 'fa' ? 'en' : 'fa';
        if (langs[lang] && !langs[other]) {
            return;
        }
        this.langs.set({...langs, [lang]: !langs[lang]});
    }

    protected hl(text: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(markWords(text, this.tokens()));
    }

    protected faNum(n: number): string {
        return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
    }

    protected copyKey(poem: Poem, n: number): string {
        return `${poem.id}-${n}`;
    }

    protected copy(poem: Poem, c: IndexedCouplet): void {
        const [a, b] = c.lines;
        // Each Persian hemistich followed by its own English line.
        void copyText(`${a.fa}\n${a.en}\n\n${b.fa}\n${b.en}`).then((ok) => {
            if (!ok) {
                return;
            }
            const key = this.copyKey(poem, c.n);
            this.copied.set(key);
            setTimeout(() => {
                if (this.copied() === key) {
                    this.copied.set(null);
                }
            }, 1400);
        });
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

    /** If the reader has scrolled past the top of the results, bring it back under the sticky search bar. */
    private revealList(): void {
        if (!this.isBrowser) {
            return;
        }
        const list = this.document.getElementById('poems');
        if (list && list.getBoundingClientRect().top < STICKY_OFFSET - 1) {
            list.scrollIntoView({block: 'start'});
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

    /** "/" focuses the search; Esc clears it. */
    @HostListener('document:keydown', ['$event'])
    protected onKey(event: KeyboardEvent): void {
        const input = this.searchInput()?.nativeElement;
        if (!input) {
            return;
        }
        const target = event.target as HTMLElement | null;
        const typing = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
        if (event.key === '/' && !typing) {
            event.preventDefault();
            input.focus();
        } else if (event.key === 'Escape' && this.query()) {
            this.clear();
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
