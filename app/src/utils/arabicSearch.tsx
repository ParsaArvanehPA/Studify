import React from 'react';

export function normalizeForSearch(text: string): string {
    let result = text;
    result = result.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    result = result.replace(/[أإآٱ]/g, 'ا');
    result = result.replace(/ؤ/g, 'و');
    result = result.replace(/ئ/g, 'ی');
    result = result.replace(/ي/g, 'ی');
    result = result.replace(/ك/g, 'ک');
    result = result.replace(/ة/g, 'ه');
    result = result.replace(/\u200C/g, '');
    return result;
}

export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
}

export function fuzzyMatchWords(text: string, query: string, maxDistance: number = 2): boolean {
    const words = text.toLowerCase().split(/\s+/);
    const queryLower = query.toLowerCase();
    const adjustedMaxDistance = queryLower.length <= 4 ? 1 : maxDistance;
    return words.some(word => {
        if (word.length < 2) return false;
        if (word.includes(queryLower) || queryLower.includes(word)) return true;
        return levenshteinDistance(word, queryLower) <= adjustedMaxDistance;
    });
}

export function phoneticNormalize(str: string): string {
    return str.toLowerCase()
        .replace(/oo|ou|uu/g, 'u').replace(/ee|ei|ii/g, 'i').replace(/aa|ah|a'/g, 'a')
        .replace(/kh/g, 'k').replace(/gh/g, 'g').replace(/sh/g, 's').replace(/th/g, 't').replace(/dh/g, 'd')
        .replace(/q/g, 'k').replace(/'/g, '').replace(/`/g, '');
}

export function phoneticMatch(text: string, query: string): boolean {
    return phoneticNormalize(text).includes(phoneticNormalize(query));
}

export function faultTolerantMatch(text: string, query: string, isArabic: boolean = false): boolean {
    if (!query.trim() || query.length < 2) return false;
    const queryLower = query.toLowerCase().trim();
    const textLower = text.toLowerCase();
    if (textLower.includes(queryLower)) return true;
    if (isArabic) {
        if (normalizeForSearch(text).includes(normalizeForSearch(query))) return true;
    }
    if (!isArabic && query.length >= 3 && phoneticMatch(text, query)) return true;
    if (query.length >= 3 && fuzzyMatchWords(text, query)) return true;
    return false;
}

export function findFuzzyMatchPosition(text: string, query: string): {start: number; end: number} | null {
    const words = text.split(/\s+/);
    const queryLower = query.toLowerCase();
    let position = 0;
    for (const word of words) {
        const wordLower = word.toLowerCase();
        if (wordLower.includes(queryLower)) {
            const subIndex = wordLower.indexOf(queryLower);
            return {start: position + subIndex, end: position + subIndex + queryLower.length};
        }
        const maxDistance = queryLower.length <= 4 ? 1 : 2;
        if (levenshteinDistance(wordLower, queryLower) <= maxDistance) {
            return {start: position, end: position + word.length};
        }
        position += word.length + 1;
    }
    return null;
}

// Build a mapping from normalized string positions back to original string positions
export function buildNormalizedMap(original: string, normalized: string): number[] {
    const map: number[] = []; // map[normalizedIndex] = originalIndex
    let oi = 0;
    for (let ni = 0; ni < normalized.length; ni++) {
        // Skip characters in original that were removed during normalization (diacritics)
        while (oi < original.length && normalizeForSearch(original[oi]) === '') {
            oi++;
        }
        map[ni] = oi;
        oi++;
    }
    map[normalized.length] = original.length; // end sentinel
    return map;
}

export function highlightText(text: string, query: string, isArabic: boolean = false): React.ReactNode {
    if (!query.trim() || query.length < 2) return text;
    const normalizedQuery = isArabic ? normalizeForSearch(query) : query.toLowerCase();
    const normalizedText = isArabic ? normalizeForSearch(text) : text.toLowerCase();

    if (normalizedText.includes(normalizedQuery)) {
        if (isArabic) {
            // Use position mapping to highlight in the original text with diacritics
            const map = buildNormalizedMap(text, normalizedText);
            const parts: React.ReactNode[] = [];
            let lastOrigIndex = 0;
            let searchIndex = 0;
            while ((searchIndex = normalizedText.indexOf(normalizedQuery, searchIndex)) !== -1) {
                const origStart = map[searchIndex];
                const origEnd = map[searchIndex + normalizedQuery.length] ?? text.length;
                if (origStart > lastOrigIndex) parts.push(text.slice(lastOrigIndex, origStart));
                parts.push(
                    <mark key={searchIndex} className="bg-yellow-500/40 text-inherit rounded px-0.5">
                        {text.slice(origStart, origEnd)}
                    </mark>
                );
                lastOrigIndex = origEnd;
                searchIndex += normalizedQuery.length;
            }
            if (lastOrigIndex < text.length) parts.push(text.slice(lastOrigIndex));
            return parts;
        }
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let searchIndex = 0;
        while ((searchIndex = normalizedText.indexOf(normalizedQuery, lastIndex)) !== -1) {
            if (searchIndex > lastIndex) parts.push(text.slice(lastIndex, searchIndex));
            parts.push(
                <mark key={searchIndex} className="bg-yellow-500/40 text-inherit rounded px-0.5">
                    {text.slice(searchIndex, searchIndex + normalizedQuery.length)}
                </mark>
            );
            lastIndex = searchIndex + normalizedQuery.length;
        }
        if (lastIndex < text.length) parts.push(text.slice(lastIndex));
        return parts;
    }

    if (!isArabic && query.length >= 3) {
        const phoneticText = phoneticNormalize(text);
        const phoneticQuery = phoneticNormalize(query);
        if (phoneticText.includes(phoneticQuery)) {
            const phoneticIndex = phoneticText.indexOf(phoneticQuery);
            const ratio = phoneticIndex / phoneticText.length;
            const estimatedStart = Math.floor(ratio * text.length);
            const estimatedEnd = Math.min(text.length, estimatedStart + query.length + 3);
            return (
                <>
                    {text.slice(0, estimatedStart)}
                    <mark className="bg-yellow-500/40 text-inherit rounded px-0.5">{text.slice(estimatedStart, estimatedEnd)}</mark>
                    {text.slice(estimatedEnd)}
                </>
            );
        }
    }

    if (query.length >= 3) {
        const fuzzyMatch = findFuzzyMatchPosition(text, query);
        if (fuzzyMatch) {
            return (
                <>
                    {text.slice(0, fuzzyMatch.start)}
                    <mark className="bg-yellow-500/40 text-inherit rounded px-0.5">{text.slice(fuzzyMatch.start, fuzzyMatch.end)}</mark>
                    {text.slice(fuzzyMatch.end)}
                </>
            );
        }
    }

    return text;
}
