import React, {useState, useMemo, useEffect} from 'react';
import {Search, BookOpen, X, Copy, Check, Languages} from 'lucide-react';
import {letter53Passages, sectionGroups} from '../data/letter53Data';

function normalizeArabic(text: string): string {
    let result = text;
    result = result.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
    result = result.replace(/[أإآٱ]/g, 'ا');
    result = result.replace(/ؤ/g, 'و');
    result = result.replace(/ئ/g, 'ی');
    result = result.replace(/ي/g, 'ی');
    result = result.replace(/ك/g, 'ک');
    result = result.replace(/ة/g, 'ه');
    result = result.replace(/الله/g, '___ALLAH___');
    result = result.replace(/لل/g, 'ل\u200Cل');
    result = result.replace(/___ALLAH___/g, 'الله');
    return result;
}

function normalizeForSearch(text: string): string {
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

function levenshteinDistance(a: string, b: string): number {
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

function fuzzyMatchWords(text: string, query: string, maxDistance: number = 2): boolean {
    const words = text.toLowerCase().split(/\s+/);
    const queryLower = query.toLowerCase();
    const adjustedMaxDistance = queryLower.length <= 4 ? 1 : maxDistance;
    return words.some(word => {
        if (word.length < 2) return false;
        if (word.includes(queryLower) || queryLower.includes(word)) return true;
        return levenshteinDistance(word, queryLower) <= adjustedMaxDistance;
    });
}

function phoneticNormalize(str: string): string {
    return str.toLowerCase()
        .replace(/oo|ou|uu/g, 'u').replace(/ee|ei|ii/g, 'i').replace(/aa|ah|a'/g, 'a')
        .replace(/kh/g, 'k').replace(/gh/g, 'g').replace(/sh/g, 's').replace(/th/g, 't').replace(/dh/g, 'd')
        .replace(/q/g, 'k').replace(/'/g, '').replace(/`/g, '');
}

function phoneticMatch(text: string, query: string): boolean {
    return phoneticNormalize(text).includes(phoneticNormalize(query));
}

function faultTolerantMatch(text: string, query: string, isArabic: boolean = false): boolean {
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

function findFuzzyMatchPosition(text: string, query: string): {start: number; end: number} | null {
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
function buildNormalizedMap(original: string, normalized: string): number[] {
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

function highlightText(text: string, query: string, isArabic: boolean = false): React.ReactNode {
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

export function Letter53Page() {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectionMenu, setSelectionMenu] = useState<{x: number; y: number; text: string} | null>(null);
    const [selectionCopied, setSelectionCopied] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const copySelectedText = () => {
        if (selectionMenu) {
            navigator.clipboard.writeText(selectionMenu.text);
            setSelectionCopied(true);
            setTimeout(() => {
                setSelectionMenu(null);
                setSelectionCopied(false);
                window.getSelection()?.removeAllRanges();
            }, 300);
        }
    };

    const translateSelectedText = async () => {
        if (selectionMenu && !isTranslating) {
            setIsTranslating(true);
            setTranslation('Translating...');
            try {
                const text = encodeURIComponent(selectionMenu.text);
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${text}&langpair=ar|en`);
                const data = await response.json();
                if (data.responseStatus === 200 && data.responseData?.translatedText) {
                    setTranslation(data.responseData.translatedText);
                } else {
                    setTranslation('Translation failed. Try again.');
                }
            } catch {
                setTranslation('Network error. Check connection.');
            } finally {
                setIsTranslating(false);
            }
        }
    };

    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            const selectedText = selection?.toString().trim();
            if (selectedText && selectedText.length > 0) {
                const range = selection?.getRangeAt(0);
                const rect = range?.getBoundingClientRect();
                if (rect) {
                    setSelectionMenu({x: rect.left + rect.width / 2, y: rect.top - 10, text: selectedText});
                }
            } else {
                setSelectionMenu(null);
                setTranslation(null);
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.selection-menu')) {
                setSelectionMenu(null);
                setTranslation(null);
            }
        };
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (selectionMenu && selectionMenu.text) {
            translateSelectedText();
        }
    }, [selectionMenu]);

    const filteredPassages = useMemo(() => {
        if (!searchQuery.trim()) return letter53Passages;
        const query = searchQuery.trim();
        return letter53Passages.filter(p =>
            faultTolerantMatch(p.arabic, query, true) ||
            faultTolerantMatch(p.farsi, query, true) ||
            faultTolerantMatch(p.english, query) ||
            faultTolerantMatch(p.sectionEnglish, query) ||
            faultTolerantMatch(p.section, query, true)
        );
    }, [searchQuery]);

    const groupedPassages = useMemo(() => {
        const groups: {[key: string]: typeof letter53Passages} = {};
        filteredPassages.forEach(p => {
            if (!groups[p.section]) groups[p.section] = [];
            groups[p.section].push(p);
        });
        return groups;
    }, [filteredPassages]);

    useEffect(() => {
        if (!searchQuery.trim()) return;
        setTimeout(() => {
            const firstResult = document.getElementById('first-search-result');
            if (firstResult) firstResult.scrollIntoView({behavior: 'instant', block: 'start'});
        }, 0);
    }, [searchQuery, filteredPassages]);

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">نامه ۵۳ نهج البلاغه — Letter 53</h1>
                        <p className="text-gray-400 text-sm">Imam Ali's Letter to Malik al-Ashtar</p>
                    </div>
                </div>

                {/* Sections */}
                {sectionGroups.map((section) => {
                    const passages = groupedPassages[section.name];
                    if (!passages || passages.length === 0) return null;

                    const firstPassageId = filteredPassages.length > 0 ? filteredPassages[0].id : null;
                    let lastSubSection = '';

                    return (
                        <section key={section.id} id={section.id} className="mb-12">
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-2xl font-bold text-white mb-1" dir="rtl" style={{fontFamily: 'Vazirmatn, sans-serif'}}>
                                    {section.name}
                                </h2>
                                <p className="text-emerald-400 mb-6">{section.nameEnglish}</p>

                                <div className="space-y-4">
                                    {passages.map((passage) => {
                                        let subHeader = null;
                                        if (passage.subSection && passage.subSection !== lastSubSection) {
                                            lastSubSection = passage.subSection;
                                            subHeader = (
                                                <div className="glass rounded-xl p-3 border border-teal-500/20 mb-4">
                                                    <h3 className="text-lg font-semibold text-teal-400" dir="rtl" style={{fontFamily: 'Vazirmatn, sans-serif'}}>
                                                        {passage.subSection}
                                                    </h3>
                                                    {passage.subSectionEnglish && (
                                                        <p className="text-teal-300/70 text-sm">{passage.subSectionEnglish}</p>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <React.Fragment key={passage.id}>
                                                {subHeader}
                                                <div
                                                    id={searchQuery.trim() && passage.id === firstPassageId ? 'first-search-result' : undefined}
                                                    className="glass rounded-xl overflow-hidden border border-white/5"
                                                    style={{scrollMarginTop: '80px'}}
                                                >
                                                    {/* Arabic */}
                                                    <div
                                                        className="text-lg md:text-xl text-amber-100 p-4 bg-amber-500/5 border-b border-white/5"
                                                        dir="rtl"
                                                        style={{fontFamily: 'Amiri, serif', lineHeight: '2.2'}}
                                                    >
                                                        {highlightText(passage.arabic, searchQuery, true)}
                                                    </div>
                                                    {/* Farsi */}
                                                    <div
                                                        className="text-base text-emerald-100 p-4 bg-emerald-500/5 border-b border-white/5"
                                                        dir="rtl"
                                                        style={{fontFamily: 'Vazirmatn, sans-serif', lineHeight: '2'}}
                                                    >
                                                        {highlightText(passage.farsi, searchQuery, true)}
                                                    </div>
                                                    {/* English */}
                                                    <div className="flex items-start gap-3 p-4 bg-blue-500/5">
                                                        <div className="text-blue-100 leading-relaxed flex-1" style={{fontFamily: 'Inter, sans-serif'}}>
                                                            {highlightText(passage.english, searchQuery)}
                                                        </div>
                                                        <button
                                                            onClick={() => copyToClipboard(
                                                                passage.arabic + '\n\n' + passage.farsi + '\n\n' + passage.english,
                                                                passage.id
                                                            )}
                                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white shrink-0 cursor-pointer"
                                                            title="Copy passage"
                                                        >
                                                            {copiedId === passage.id ? (
                                                                <Check className="w-4 h-4 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    );
                })}

                {/* No results */}
                {searchQuery.trim() && filteredPassages.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No passages found for "{searchQuery}"</p>
                    </div>
                )}

                {/* Search Bar - Fixed at bottom */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f0f1a] border-t border-white/10 z-50">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                dir="rtl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="جستجو (عربی، فارسی، انگلیسی...)"
                                className="w-full pr-12 pl-12 py-4 rounded-xl bg-[#1a1a2e] border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <div className="mt-2 text-sm text-gray-400 text-center">
                                Found {filteredPassages.length} passage{filteredPassages.length !== 1 ? 's' : ''} matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-24" />
            </div>

            {/* Selection Menu */}
            {selectionMenu && (
                <div
                    className="selection-menu fixed z-[100] transform -translate-x-1/2 -translate-y-full"
                    style={{left: selectionMenu.x, top: selectionMenu.y}}
                >
                    <div className="bg-gray-800 border border-white/20 rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={copySelectedText}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                {selectionCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
                                <span className="text-white text-sm">{selectionCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                            <div className="w-px h-6 bg-white/20" />
                            <button
                                onClick={translateSelectedText}
                                disabled={isTranslating}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isTranslating ? (
                                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Languages className="w-4 h-4 text-sky-400" />
                                )}
                                <span className="text-white text-sm">{isTranslating ? 'Translating...' : 'Translate'}</span>
                            </button>
                        </div>
                        {translation && (
                            <div className="px-3 py-2 border-t border-white/10 max-w-sm">
                                <p className="text-emerald-400 text-sm leading-relaxed">{translation}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
