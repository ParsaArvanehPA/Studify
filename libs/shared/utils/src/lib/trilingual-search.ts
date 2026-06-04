/**
 * Fault-tolerant search across Arabic / Persian / English. TS port of the
 * design prototype's studify-trilingual.js: strips Arabic diacritics, unifies
 * letter variants, lowercases latin, and supports token highlight + matching.
 */

const DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** Normalize a string for fault-tolerant matching. */
export function normalize(s: string): string {
    if (!s) {
        return '';
    }
    return s
        .replace(DIACRITICS, '')
        .replace(/[إأآا]/g, 'ا')
        .replace(/[يیﻰﻱ]/g, 'ی')
        .replace(/[كﻙ]/g, 'ک')
        .replace(/ة/g, 'ه')
        .replace(/[ؤئ]/g, 'و')
        .replace(/‌/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'})[c] ?? c);
}

/** Highlight query tokens within a plain string, returning safe HTML with <mark>. */
export function highlight(original: string, query: string): string {
    const safe = escapeHtml(original);
    const tokens = normalize(query).split(' ').filter(Boolean);
    if (!tokens.length) {
        return safe;
    }
    return safe.replace(/[\p{L}\p{N}ؐ-ٰٟ]+/gu, (w) => {
        const nw = normalize(w);
        return tokens.some((t) => nw.includes(t)) ? `<mark>${w}</mark>` : w;
    });
}

/** True when every query token is present in the pre-normalized haystack. */
export function matches(haystackNorm: string, query: string): boolean {
    const tokens = normalize(query).split(' ').filter(Boolean);
    return tokens.every((t) => haystackNorm.includes(t));
}

/** Trailing debounce. */
export function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number): (...args: T) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: T): void => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

/** Copy text to the clipboard (browser only). */
export async function copyText(text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return false;
    }
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/** Open a Google Translate tab for a phrase (browser only). */
export function openTranslate(text: string, from: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    const url = `https://translate.google.com/?sl=${from || 'auto'}&tl=en&op=translate&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
}
