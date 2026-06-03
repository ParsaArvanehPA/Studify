import React, {useState, useMemo, useEffect} from 'react';
import {Search, BookOpen, X, Copy, Check, Languages} from 'lucide-react';
import {letter53Passages, sectionGroups} from '../data/letter53Data';
import {faultTolerantMatch, highlightText} from '../utils/arabicSearch';
import {IslamicTextsNav} from '../components/IslamicTextsNav';
import {Seo} from '../components/Seo';

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
            <Seo
                title="نامه ۵۳ نهج البلاغه — Letter 53"
                description="Searchable Arabic-Persian study tool for Letter 53 of Nahj al-Balagha, with fault-tolerant search and section navigation."
                path="/letter-53"
                type="article"
            />
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

                <IslamicTextsNav />

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
