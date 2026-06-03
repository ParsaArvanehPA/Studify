import {useState, useMemo, useEffect} from 'react';
import {Search, BookOpen, X, Copy, Check, Languages} from 'lucide-react';
import {vocabularyEntries} from '../data/letter53VocabularyData';
import {faultTolerantMatch, highlightText} from '../utils/arabicSearch';
import {IslamicTextsNav} from '../components/IslamicTextsNav';
import {Seo} from '../components/Seo';

export function VocabularyPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [selectionMenu, setSelectionMenu] = useState<{x: number; y: number; text: string} | null>(null);
    const [selectionCopied, setSelectionCopied] = useState(false);
    const [translation, setTranslation] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const copyToClipboard = (text: string, id: number) => {
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

    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return vocabularyEntries;
        const query = searchQuery.trim();
        return vocabularyEntries.filter(e =>
            faultTolerantMatch(e.arabic, query, true) ||
            faultTolerantMatch(e.farsi, query, true) ||
            faultTolerantMatch(e.english, query)
        );
    }, [searchQuery]);

    useEffect(() => {
        if (!searchQuery.trim()) return;
        setTimeout(() => {
            const firstResult = document.getElementById('first-search-result');
            if (firstResult) firstResult.scrollIntoView({behavior: 'instant', block: 'start'});
        }, 0);
    }, [searchQuery, filteredEntries]);

    const firstEntryId = filteredEntries.length > 0 ? filteredEntries[0].id : null;

    return (
        <div className="min-h-screen py-8 px-4">
            <Seo
                title="واژگان تخصصی نامه ۵۳ — Vocabulary"
                description="Specialized vocabulary cheat sheet for Letter 53 of Nahj al-Balagha with searchable Arabic-Persian glosses."
                path="/letter-53-vocabulary"
                type="article"
            />
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">واژگان تخصصی نامه ۵۳ — Vocabulary</h1>
                        <p className="text-gray-400 text-sm">۳۰۰ واژهٔ تخصصی نهج‌البلاغه — عربی، فارسی و انگلیسی</p>
                    </div>
                </div>

                <IslamicTextsNav />

                {/* Vocabulary list */}
                <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                        <div
                            key={entry.id}
                            id={searchQuery.trim() && entry.id === firstEntryId ? 'first-search-result' : undefined}
                            className="glass rounded-xl border border-white/5 flex items-stretch overflow-hidden"
                            style={{scrollMarginTop: '80px'}}
                        >
                            {/* Number */}
                            <div className="flex items-center justify-center w-12 shrink-0 bg-white/5 text-gray-500 text-sm font-medium border-l border-white/5">
                                {entry.id}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/5">
                                {/* Arabic */}
                                <div
                                    className="p-4 bg-amber-500/5 text-amber-100 text-xl flex items-center justify-end text-right"
                                    dir="rtl"
                                    style={{fontFamily: 'Amiri, serif', lineHeight: '2'}}
                                >
                                    {highlightText(entry.arabic, searchQuery, true)}
                                </div>
                                {/* Farsi */}
                                <div
                                    className="p-4 bg-emerald-500/5 text-emerald-100 flex items-center justify-end text-right"
                                    dir="rtl"
                                    style={{fontFamily: 'Vazirmatn, sans-serif', lineHeight: '1.9'}}
                                >
                                    {highlightText(entry.farsi, searchQuery, true)}
                                </div>
                                {/* English */}
                                <div className="p-4 bg-blue-500/5 text-blue-100 flex items-center justify-between gap-3" style={{fontFamily: 'Inter, sans-serif'}}>
                                    <span className="flex-1">{highlightText(entry.english, searchQuery)}</span>
                                    <button
                                        onClick={() => copyToClipboard(`${entry.arabic}\n${entry.farsi}\n${entry.english}`, entry.id)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white shrink-0 cursor-pointer"
                                        title="Copy entry"
                                    >
                                        {copiedId === entry.id ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No results */}
                {searchQuery.trim() && filteredEntries.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No entries found for "{searchQuery}"</p>
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
                                Found {filteredEntries.length} entr{filteredEntries.length !== 1 ? 'ies' : 'y'} matching "{searchQuery}"
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
