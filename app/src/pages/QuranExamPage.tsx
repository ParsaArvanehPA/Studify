import React, { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, X, Copy, Check } from 'lucide-react';

// Function to normalize Arabic text for display and Farsi keyboard search
function normalizeArabic(text: string): string {
  let result = text;
  // Remove Arabic diacritical marks (harakat/vowels)
  result = result.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  // Normalize alef variations (أ إ آ ٱ) to plain alef (ا)
  result = result.replace(/[أإآٱ]/g, 'ا');
  // Normalize hamza on waw (ؤ) to plain waw (و)
  result = result.replace(/ؤ/g, 'و');
  // Normalize hamza on yeh (ئ) to yeh (ی)
  result = result.replace(/ئ/g, 'ی');
  // Normalize Arabic yeh (ي) to Persian yeh (ی)
  result = result.replace(/ي/g, 'ی');
  // Normalize Arabic kaf (ك) to Persian kaf (ک)
  result = result.replace(/ك/g, 'ک');
  // Normalize teh marbuta (ة) to heh (ه)
  result = result.replace(/ة/g, 'ه');
  // Break lam-lam ligature by inserting Zero Width Non-Joiner, but preserve الله
  result = result.replace(/الله/g, '___ALLAH___');
  result = result.replace(/لل/g, 'ل\u200Cل');
  result = result.replace(/___ALLAH___/g, 'الله');
  return result;
}

// Function to normalize search query for matching
function normalizeForSearch(text: string): string {
  let result = text;
  // Same normalizations as above for consistent matching
  result = result.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  result = result.replace(/[أإآٱ]/g, 'ا');
  result = result.replace(/ؤ/g, 'و');
  result = result.replace(/ئ/g, 'ی');
  result = result.replace(/ي/g, 'ی');
  result = result.replace(/ك/g, 'ک');
  result = result.replace(/ة/g, 'ه');
  // Remove ZWNJ for search matching
  result = result.replace(/\u200C/g, '');
  return result;
}

// Find best fuzzy match position in text
function findFuzzyMatchPosition(text: string, query: string): { start: number; end: number } | null {
  const words = text.split(/\s+/);
  const queryLower = query.toLowerCase();
  let position = 0;

  for (const word of words) {
    const wordLower = word.toLowerCase();
    // Check for substring match first
    if (wordLower.includes(queryLower)) {
      const subIndex = wordLower.indexOf(queryLower);
      return { start: position + subIndex, end: position + subIndex + queryLower.length };
    }
    // Check for fuzzy match
    const maxDistance = queryLower.length <= 4 ? 1 : 2;
    if (levenshteinDistance(wordLower, queryLower) <= maxDistance) {
      return { start: position, end: position + word.length };
    }
    position += word.length + 1; // +1 for space
  }
  return null;
}

// Function to highlight search matches in text (supports exact and fuzzy matching)
function highlightText(text: string, query: string, isArabic: boolean = false): React.ReactNode {
  if (!query.trim() || query.length < 2) return text;

  const normalizedQuery = isArabic ? normalizeForSearch(query) : query.toLowerCase();
  const normalizedText = isArabic ? normalizeForSearch(text) : text.toLowerCase();

  // Try exact match first
  if (normalizedText.includes(normalizedQuery)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while ((searchIndex = normalizedText.indexOf(normalizedQuery, lastIndex)) !== -1) {
      if (searchIndex > lastIndex) {
        parts.push(text.slice(lastIndex, searchIndex));
      }
      parts.push(
        <mark key={searchIndex} className="bg-yellow-500/40 text-inherit rounded px-0.5">
          {text.slice(searchIndex, searchIndex + normalizedQuery.length)}
        </mark>
      );
      lastIndex = searchIndex + normalizedQuery.length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }

  // Try phonetic match for non-Arabic text
  if (!isArabic && query.length >= 3) {
    const phoneticText = phoneticNormalize(text);
    const phoneticQuery = phoneticNormalize(query);
    if (phoneticText.includes(phoneticQuery)) {
      // Find approximate position using phonetic normalized text
      const phoneticIndex = phoneticText.indexOf(phoneticQuery);
      // Estimate original position (rough approximation)
      const ratio = phoneticIndex / phoneticText.length;
      const estimatedStart = Math.floor(ratio * text.length);
      const estimatedEnd = Math.min(text.length, estimatedStart + query.length + 3);

      return (
        <>
          {text.slice(0, estimatedStart)}
          <mark className="bg-yellow-500/40 text-inherit rounded px-0.5">
            {text.slice(estimatedStart, estimatedEnd)}
          </mark>
          {text.slice(estimatedEnd)}
        </>
      );
    }
  }

  // Try fuzzy match
  if (query.length >= 3) {
    const fuzzyMatch = findFuzzyMatchPosition(text, query);
    if (fuzzyMatch) {
      return (
        <>
          {text.slice(0, fuzzyMatch.start)}
          <mark className="bg-yellow-500/40 text-inherit rounded px-0.5">
            {text.slice(fuzzyMatch.start, fuzzyMatch.end)}
          </mark>
          {text.slice(fuzzyMatch.end)}
        </>
      );
    }
  }

  return text;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Check if query fuzzy matches any word in text
function fuzzyMatchWords(text: string, query: string, maxDistance: number = 2): boolean {
  const words = text.toLowerCase().split(/\s+/);
  const queryLower = query.toLowerCase();

  // Adjust max distance based on query length
  const adjustedMaxDistance = queryLower.length <= 4 ? 1 : maxDistance;

  return words.some(word => {
    // Skip very short words
    if (word.length < 2) return false;
    // Exact substring match
    if (word.includes(queryLower) || queryLower.includes(word)) return true;
    // Fuzzy match
    return levenshteinDistance(word, queryLower) <= adjustedMaxDistance;
  });
}

// Phonetic normalization for transliteration variants
function phoneticNormalize(str: string): string {
  return str.toLowerCase()
    // Vowel normalizations
    .replace(/oo|ou|uu/g, 'u')
    .replace(/ee|ei|ii/g, 'i')
    .replace(/aa|ah|a'/g, 'a')
    // Consonant normalizations for Arabic/Islamic terms
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/sh/g, 's')
    .replace(/th/g, 't')
    .replace(/dh/g, 'd')
    .replace(/q/g, 'k')
    .replace(/'/g, '')
    .replace(/`/g, '')
    // Common transliteration variants
    .replace(/salat|salah|salaat/g, 'salat')
    .replace(/ruku|rukoo|rukou/g, 'ruku')
    .replace(/sujud|sujood|sajda|sajdah/g, 'sujud')
    .replace(/quran|kuran|qoran/g, 'quran')
    .replace(/takbir|takbeer/g, 'takbir')
    .replace(/fatiha|fatihah|fateha/g, 'fatiha');
}

// Check if query phonetically matches text
function phoneticMatch(text: string, query: string): boolean {
  const normalizedText = phoneticNormalize(text);
  const normalizedQuery = phoneticNormalize(query);
  return normalizedText.includes(normalizedQuery);
}

// Combined fault-tolerant matching
function faultTolerantMatch(text: string, query: string, isArabic: boolean = false): boolean {
  if (!query.trim() || query.length < 2) return false;

  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();

  // 1. Exact match (fastest)
  if (textLower.includes(queryLower)) return true;

  // 2. Normalized match for Arabic/Farsi
  if (isArabic) {
    const normalizedText = normalizeForSearch(text);
    const normalizedQuery = normalizeForSearch(query);
    if (normalizedText.includes(normalizedQuery)) return true;
  }

  // 3. Phonetic match (for transliteration variants)
  if (!isArabic && query.length >= 3 && phoneticMatch(text, query)) return true;

  // 4. Fuzzy match (for typos) - only for queries >= 3 chars
  if (query.length >= 3 && fuzzyMatchWords(text, query)) return true;

  return false;
}

interface QuranVerse {
  id: string;
  surah: string;
  surahEnglish: string;
  verseNumber: string;
  arabic: string;
  translation: string;
  session: string;
}

// All exam material verses with Irving translations
const quranVerses: QuranVerse[] = [
  // Session 1: Surah An-Nisa (4:9-12)
  {
    id: 'nisa-9',
    surah: 'النساء',
    surahEnglish: 'An-Nisa (The Women)',
    verseNumber: '4:9',
    arabic: 'وَلْيَخْشَ الَّذِينَ لَوْ تَرَكُوا مِنْ خَلْفِهِمْ ذُرِّيَّةً ضِعَافًا خَافُوا عَلَيْهِمْ فَلْيَتَّقُوا اللَّهَ وَلْيَقُولُوا قَوْلًا سَدِيدًا',
    translation: 'Let those be concerned who, if they left weak offspring behind, would be afraid on their account. Let them heed God and speak in an appropriate manner.',
    session: 'Session 1'
  },
  {
    id: 'nisa-10',
    surah: 'النساء',
    surahEnglish: 'An-Nisa (The Women)',
    verseNumber: '4:10',
    arabic: 'إِنَّ الَّذِينَ يَأْكُلُونَ أَمْوَالَ الْيَتَامَىٰ ظُلْمًا إِنَّمَا يَأْكُلُونَ فِي بُطُونِهِمْ نَارًا وَسَيَصْلَوْنَ سَعِيرًا',
    translation: 'Those who consume orphans property wrongfully merely eat fire in their bellies, and they will roast in a blaze.',
    session: 'Session 1'
  },
  {
    id: 'nisa-11',
    surah: 'النساء',
    surahEnglish: 'An-Nisa (The Women)',
    verseNumber: '4:11',
    arabic: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ فَإِنْ كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ وَإِنْ كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِنْ كَانَ لَهُ وَلَدٌ فَإِنْ لَمْ يَكُنْ لَهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ فَإِنْ كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ مِنْ بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ آبَاؤُكُمْ وَأَبْنَاؤُكُمْ لَا تَدْرُونَ أَيُّهُمْ أَقْرَبُ لَكُمْ نَفْعًا فَرِيضَةً مِنَ اللَّهِ إِنَّ اللَّهَ كَانَ عَلِيمًا حَكِيمًا',
    translation: 'God instructs you concerning your children: a male shall have as much as the share of two females. If there are more than two women, they shall receive two-thirds of what he leaves; while if there is only one, she shall have half. Each of his parents shall have a sixth of whatever he leaves, if he has a child. If he has no child, and both his parents are his heirs, then his mother shall have a third. If he has siblings, his mother shall have a sixth, after any bequest he may have made or any debt. You do not know which of them, your parents or your children, are closer to you in usefulness, as an assignment from God. God is Aware, Wise.',
    session: 'Session 1'
  },
  {
    id: 'nisa-12',
    surah: 'النساء',
    surahEnglish: 'An-Nisa (The Women)',
    verseNumber: '4:12',
    arabic: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِنْ لَمْ يَكُنْ لَهُنَّ وَلَدٌ فَإِنْ كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ مِنْ بَعْدِ وَصِيَّةٍ يُوصِينَ بِهَا أَوْ دَيْنٍ وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِنْ لَمْ يَكُنْ لَكُمْ وَلَدٌ فَإِنْ كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُمْ مِنْ بَعْدِ وَصِيَّةٍ تُوصُونَ بِهَا أَوْ دَيْنٍ وَإِنْ كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ فَإِنْ كَانُوا أَكْثَرَ مِنْ ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ مِنْ بَعْدِ وَصِيَّةٍ يُوصَىٰ بِهَا أَوْ دَيْنٍ غَيْرَ مُضَارٍّ وَصِيَّةً مِنَ اللَّهِ وَاللَّهُ عَلِيمٌ حَلِيمٌ',
    translation: 'You will have half of whatever your wives leave, provided they have no child. If they have a child, you will have a fourth of what they leave, after any bequest they may have made or any debt. They shall have a fourth of what you leave if you have no child; while if you have a child, they shall have an eighth of anything you leave, after any bequest you may have made or any debt. If a man or woman is inherited from laterally and has a brother or a sister, each of them shall have a sixth. If there are more than that, they shall be partners in a third, after any bequest that has been made or any debt, without harm to anyone, as an instruction from God. God is Aware, Lenient.',
    session: 'Session 1'
  },

  // Session 2: Surah Al-Ma'idah (5:94, 105-109)
  {
    id: 'maidah-94',
    surah: 'المائدة',
    surahEnglish: 'Al-Maidah (The Table Spread)',
    verseNumber: '5:94',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَيَبْلُوَنَّكُمُ اللَّهُ بِشَيْءٍ مِنَ الصَّيْدِ تَنَالُهُ أَيْدِيكُمْ وَرِمَاحُكُمْ لِيَعْلَمَ اللَّهُ مَنْ يَخَافُهُ بِالْغَيْبِ فَمَنِ اعْتَدَىٰ بَعْدَ ذَٰلِكَ فَلَهُ عَذَابٌ أَلِيمٌ',
    translation: 'You who believe, God will test you with some game that your hands and lances may reach, so God may know who fears Him despite the unseen. Anyone who transgresses after that will have painful torment.',
    session: 'Session 2'
  },
  {
    id: 'maidah-105',
    surah: 'المائدة',
    surahEnglish: 'Al-Maidah (The Table Spread)',
    verseNumber: '5:105',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا عَلَيْكُمْ أَنْفُسَكُمْ لَا يَضُرُّكُمْ مَنْ ضَلَّ إِذَا اهْتَدَيْتُمْ إِلَى اللَّهِ مَرْجِعُكُمْ جَمِيعًا فَيُنَبِّئُكُمْ بِمَا كُنْتُمْ تَعْمَلُونَ',
    translation: 'You who believe, you are responsible only for yourselves. Anyone who has gone astray will not harm you, provided you are guided. Unto God will you all return, and He will notify you about whatever you have been doing.',
    session: 'Session 2'
  },
  {
    id: 'maidah-106',
    surah: 'المائدة',
    surahEnglish: 'Al-Maidah (The Table Spread)',
    verseNumber: '5:106',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا شَهَادَةُ بَيْنِكُمْ إِذَا حَضَرَ أَحَدَكُمُ الْمَوْتُ حِينَ الْوَصِيَّةِ اثْنَانِ ذَوَا عَدْلٍ مِنْكُمْ أَوْ آخَرَانِ مِنْ غَيْرِكُمْ إِنْ أَنْتُمْ ضَرَبْتُمْ فِي الْأَرْضِ فَأَصَابَتْكُمْ مُصِيبَةُ الْمَوْتِ تَحْبِسُونَهُمَا مِنْ بَعْدِ الصَّلَاةِ فَيُقْسِمَانِ بِاللَّهِ إِنِ ارْتَبْتُمْ لَا نَشْتَرِي بِهِ ثَمَنًا وَلَوْ كَانَ ذَا قُرْبَىٰ وَلَا نَكْتُمُ شَهَادَةَ اللَّهِ إِنَّا إِذًا لَمِنَ الْآثِمِينَ',
    translation: 'You who believe, testimony between you when death appears for one of you at the time of making a bequest should consist of two just persons from among yourselves or two others who are strangers, if you are traveling around the earth and the calamity of death befalls you. Detain them both after prayer and let them both swear by God if you have any doubts: "We shall not sell it for any price even though some near relative is involved. We will not hide God\'s testimony; otherwise we would be sinners."',
    session: 'Session 2'
  },
  {
    id: 'maidah-107',
    surah: 'المائدة',
    surahEnglish: 'Al-Maidah (The Table Spread)',
    verseNumber: '5:107',
    arabic: 'فَإِنْ عُثِرَ عَلَىٰ أَنَّهُمَا اسْتَحَقَّا إِثْمًا فَآخَرَانِ يَقُومَانِ مَقَامَهُمَا مِنَ الَّذِينَ اسْتَحَقَّ عَلَيْهِمُ الْأَوْلَيَانِ فَيُقْسِمَانِ بِاللَّهِ لَشَهَادَتُنَا أَحَقُّ مِنْ شَهَادَتِهِمَا وَمَا اعْتَدَيْنَا إِنَّا إِذًا لَمِنَ الظَّالِمِينَ',
    translation: 'If it is discovered that either of them has deserved the charge of a sin, then two others shall stand up in their stead from among the ones who were sinned against, the two nearest ones, and they shall both swear by God: "Our testimony is truer than either of their testimonies, and we have not transgressed; otherwise we would be wrongdoers."',
    session: 'Session 2'
  },
  {
    id: 'maidah-108',
    surah: 'المائدة',
    surahEnglish: 'Al-Maidah (The Table Spread)',
    verseNumber: '5:108',
    arabic: 'ذَٰلِكَ أَدْنَىٰ أَنْ يَأْتُوا بِالشَّهَادَةِ عَلَىٰ وَجْهِهَا أَوْ يَخَافُوا أَنْ تُرَدَّ أَيْمَانٌ بَعْدَ أَيْمَانِهِمْ وَاتَّقُوا اللَّهَ وَاسْمَعُوا وَاللَّهُ لَا يَهْدِي الْقَوْمَ الْفَاسِقِينَ',
    translation: 'That is more likely to make them produce testimony in its proper form, or fear that other oaths may be taken to refute their own oaths. Heed God and listen! God does not guide depraved folk.',
    session: 'Session 2'
  },
  {
    id: 'maidah-109',
    surah: 'المائدة',
    surahEnglish: 'Al-Maidah (The Table Spread)',
    verseNumber: '5:109',
    arabic: 'يَوْمَ يَجْمَعُ اللَّهُ الرُّسُلَ فَيَقُولُ مَاذَا أُجِبْتُمْ قَالُوا لَا عِلْمَ لَنَا إِنَّكَ أَنْتَ عَلَّامُ الْغُيُوبِ',
    translation: 'Someday God will gather the messengers together and say: "What response did you receive?" They will say: "We have no knowledge; You are the Knower of Unseen things."',
    session: 'Session 2'
  },

  // Session 2.1: Ayat Al-Kursi - Surah Al-Baqarah (2:255-257)
  {
    id: 'baqarah-255',
    surah: 'البقرة',
    surahEnglish: 'Al-Baqarah (The Cow)',
    verseNumber: '2:255',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    translation: 'God - there is no deity except Him, the Living, the Self-Subsisting. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is there who can intercede with Him except by His permission? He knows what is before them and what is behind them, and they do not encompass any of His knowledge except what He wills. His throne extends over the heavens and the earth, and their preservation does not tire Him. He is the Most High, the Most Great.',
    session: 'Session 2.1 - Ayat Al-Kursi'
  },
  {
    id: 'baqarah-256',
    surah: 'البقرة',
    surahEnglish: 'Al-Baqarah (The Cow)',
    verseNumber: '2:256',
    arabic: 'لَا إِكْرَاهَ فِي الدِّينِ قَدْ تَبَيَّنَ الرُّشْدُ مِنَ الْغَيِّ فَمَنْ يَكْفُرْ بِالطَّاغُوتِ وَيُؤْمِنْ بِاللَّهِ فَقَدِ اسْتَمْسَكَ بِالْعُرْوَةِ الْوُثْقَىٰ لَا انْفِصَامَ لَهَا وَاللَّهُ سَمِيعٌ عَلِيمٌ',
    translation: 'There is no compulsion in religion. The right direction is henceforth distinct from error. And whoever rejects false deities and believes in God has grasped the most trustworthy handhold, which will never break. And God is Hearing and Knowing.',
    session: 'Session 2.1 - Ayat Al-Kursi'
  },
  {
    id: 'baqarah-257',
    surah: 'البقرة',
    surahEnglish: 'Al-Baqarah (The Cow)',
    verseNumber: '2:257',
    arabic: 'اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا يُخْرِجُهُمْ مِنَ الظُّلُمَاتِ إِلَى النُّورِ وَالَّذِينَ كَفَرُوا أَوْلِيَاؤُهُمُ الطَّاغُوتُ يُخْرِجُونَهُمْ مِنَ النُّورِ إِلَى الظُّلُمَاتِ أُولَٰئِكَ أَصْحَابُ النَّارِ هُمْ فِيهَا خَالِدُونَ',
    translation: 'God is the Patron of those who believe. He brings them out of darkness into light. As for those who disbelieve, their patrons are false deities. They bring them out of light into darkness. Those are the inmates of the Fire; they will remain in it forever.',
    session: 'Session 2.1 - Ayat Al-Kursi'
  },

  // Session 3: Surah Al-Insan (76:1-22)
  {
    id: 'insan-1',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:1',
    arabic: 'هَلْ أَتَىٰ عَلَى الْإِنْسَانِ حِينٌ مِنَ الدَّهْرِ لَمْ يَكُنْ شَيْئًا مَذْكُورًا',
    translation: 'Has there come upon man a period of time when he was nothing worth mentioning?',
    session: 'Session 3'
  },
  {
    id: 'insan-2',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:2',
    arabic: 'إِنَّا خَلَقْنَا الْإِنْسَانَ مِنْ نُطْفَةٍ أَمْشَاجٍ نَبْتَلِيهِ فَجَعَلْنَاهُ سَمِيعًا بَصِيرًا',
    translation: 'We created man from a mixed drop to test him, and We made him hearing and seeing.',
    session: 'Session 3'
  },
  {
    id: 'insan-3',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:3',
    arabic: 'إِنَّا هَدَيْنَاهُ السَّبِيلَ إِمَّا شَاكِرًا وَإِمَّا كَفُورًا',
    translation: 'We have shown him the way, whether he be grateful or ungrateful.',
    session: 'Session 3'
  },
  {
    id: 'insan-4',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:4',
    arabic: 'إِنَّا أَعْتَدْنَا لِلْكَافِرِينَ سَلَاسِلَ وَأَغْلَالًا وَسَعِيرًا',
    translation: 'We have prepared for the disbelievers chains and shackles and a blazing fire.',
    session: 'Session 3'
  },
  {
    id: 'insan-5',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:5',
    arabic: 'إِنَّ الْأَبْرَارَ يَشْرَبُونَ مِنْ كَأْسٍ كَانَ مِزَاجُهَا كَافُورًا',
    translation: 'The righteous shall drink from a cup mixed with camphor,',
    session: 'Session 3'
  },
  {
    id: 'insan-6',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:6',
    arabic: 'عَيْنًا يَشْرَبُ بِهَا عِبَادُ اللَّهِ يُفَجِّرُونَهَا تَفْجِيرًا',
    translation: 'a spring from which the servants of God will drink, making it gush forth abundantly.',
    session: 'Session 3'
  },
  {
    id: 'insan-7',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:7',
    arabic: 'يُوفُونَ بِالنَّذْرِ وَيَخَافُونَ يَوْمًا كَانَ شَرُّهُ مُسْتَطِيرًا',
    translation: 'They fulfill their vows and fear a Day whose evil will be widespread.',
    session: 'Session 3'
  },
  {
    id: 'insan-8',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:8',
    arabic: 'وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا',
    translation: 'And they give food, in spite of their love for it, to the needy, the orphan, and the captive,',
    session: 'Session 3'
  },
  {
    id: 'insan-9',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:9',
    arabic: 'إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ لَا نُرِيدُ مِنْكُمْ جَزَاءً وَلَا شُكُورًا',
    translation: '"We feed you only for the sake of God. We desire no reward from you, nor thanks."',
    session: 'Session 3'
  },
  {
    id: 'insan-10',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:10',
    arabic: 'إِنَّا نَخَافُ مِنْ رَبِّنَا يَوْمًا عَبُوسًا قَمْطَرِيرًا',
    translation: '"We fear from our Lord a Day, frowning and distressful."',
    session: 'Session 3'
  },
  {
    id: 'insan-11',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:11',
    arabic: 'فَوَقَاهُمُ اللَّهُ شَرَّ ذَٰلِكَ الْيَوْمِ وَلَقَّاهُمْ نَضْرَةً وَسُرُورًا',
    translation: 'So God will protect them from the evil of that Day and give them radiance and joy.',
    session: 'Session 3'
  },
  {
    id: 'insan-12',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:12',
    arabic: 'وَجَزَاهُمْ بِمَا صَبَرُوا جَنَّةً وَحَرِيرًا',
    translation: 'And He will reward them for their patience with a garden and silk.',
    session: 'Session 3'
  },
  {
    id: 'insan-13',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:13',
    arabic: 'مُتَّكِئِينَ فِيهَا عَلَى الْأَرَائِكِ لَا يَرَوْنَ فِيهَا شَمْسًا وَلَا زَمْهَرِيرًا',
    translation: 'Reclining therein on couches, they will see neither sun nor bitter cold.',
    session: 'Session 3'
  },
  {
    id: 'insan-14',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:14',
    arabic: 'وَدَانِيَةً عَلَيْهِمْ ظِلَالُهَا وَذُلِّلَتْ قُطُوفُهَا تَذْلِيلًا',
    translation: 'And its shades will be close upon them, and its fruit clusters brought within easy reach.',
    session: 'Session 3'
  },
  {
    id: 'insan-15',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:15',
    arabic: 'وَيُطَافُ عَلَيْهِمْ بِآنِيَةٍ مِنْ فِضَّةٍ وَأَكْوَابٍ كَانَتْ قَوَارِيرَا',
    translation: 'And there will be passed around vessels of silver and cups of crystal,',
    session: 'Session 3'
  },
  {
    id: 'insan-16',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:16',
    arabic: 'قَوَارِيرَا مِنْ فِضَّةٍ قَدَّرُوهَا تَقْدِيرًا',
    translation: 'crystal of silver, which they have measured precisely.',
    session: 'Session 3'
  },
  {
    id: 'insan-17',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:17',
    arabic: 'وَيُسْقَوْنَ فِيهَا كَأْسًا كَانَ مِزَاجُهَا زَنْجَبِيلًا',
    translation: 'And they will be given to drink a cup mixed with ginger,',
    session: 'Session 3'
  },
  {
    id: 'insan-18',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:18',
    arabic: 'عَيْنًا فِيهَا تُسَمَّىٰ سَلْسَبِيلًا',
    translation: 'from a spring therein named Salsabil.',
    session: 'Session 3'
  },
  {
    id: 'insan-19',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:19',
    arabic: 'وَيَطُوفُ عَلَيْهِمْ وِلْدَانٌ مُخَلَّدُونَ إِذَا رَأَيْتَهُمْ حَسِبْتَهُمْ لُؤْلُؤًا مَنْثُورًا',
    translation: 'And there will circulate among them young boys made eternal. When you see them, you would think them scattered pearls.',
    session: 'Session 3'
  },
  {
    id: 'insan-20',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:20',
    arabic: 'وَإِذَا رَأَيْتَ ثَمَّ رَأَيْتَ نَعِيمًا وَمُلْكًا كَبِيرًا',
    translation: 'And when you look there, you will see bliss and a great kingdom.',
    session: 'Session 3'
  },
  {
    id: 'insan-21',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:21',
    arabic: 'عَالِيَهُمْ ثِيَابُ سُنْدُسٍ خُضْرٌ وَإِسْتَبْرَقٌ وَحُلُّوا أَسَاوِرَ مِنْ فِضَّةٍ وَسَقَاهُمْ رَبُّهُمْ شَرَابًا طَهُورًا',
    translation: 'Upon them will be green garments of fine silk and brocade. And they will be adorned with bracelets of silver, and their Lord will give them a purifying drink.',
    session: 'Session 3'
  },
  {
    id: 'insan-22',
    surah: 'الإنسان',
    surahEnglish: 'Al-Insan (Man)',
    verseNumber: '76:22',
    arabic: 'إِنَّ هَٰذَا كَانَ لَكُمْ جَزَاءً وَكَانَ سَعْيُكُمْ مَشْكُورًا',
    translation: '"Indeed, this is a reward for you, and your effort has been appreciated."',
    session: 'Session 3'
  },

  // Session 4: Surah Al-Fajr (89:1-30)
  {
    id: 'fajr-1',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:1',
    arabic: 'وَالْفَجْرِ',
    translation: 'By the Daybreak,',
    session: 'Session 4'
  },
  {
    id: 'fajr-2',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:2',
    arabic: 'وَلَيَالٍ عَشْرٍ',
    translation: 'and ten nights,',
    session: 'Session 4'
  },
  {
    id: 'fajr-3',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:3',
    arabic: 'وَالشَّفْعِ وَالْوَتْرِ',
    translation: 'and the even and the odd,',
    session: 'Session 4'
  },
  {
    id: 'fajr-4',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:4',
    arabic: 'وَاللَّيْلِ إِذَا يَسْرِ',
    translation: 'and the night as it journeys on!',
    session: 'Session 4'
  },
  {
    id: 'fajr-5',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:5',
    arabic: 'هَلْ فِي ذَٰلِكَ قَسَمٌ لِذِي حِجْرٍ',
    translation: 'Is there not an oath in that for any prudent person?',
    session: 'Session 4'
  },
  {
    id: 'fajr-6',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:6',
    arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِعَادٍ',
    translation: 'Have you not seen how your Lord dealt with Ad,',
    session: 'Session 4'
  },
  {
    id: 'fajr-7',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:7',
    arabic: 'إِرَمَ ذَاتِ الْعِمَادِ',
    translation: 'Iram of the columns,',
    session: 'Session 4'
  },
  {
    id: 'fajr-8',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:8',
    arabic: 'الَّتِي لَمْ يُخْلَقْ مِثْلُهَا فِي الْبِلَادِ',
    translation: 'the like of which has never been created in the land;',
    session: 'Session 4'
  },
  {
    id: 'fajr-9',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:9',
    arabic: 'وَثَمُودَ الَّذِينَ جَابُوا الصَّخْرَ بِالْوَادِ',
    translation: 'and Thamud who hollowed out rocks in the valley;',
    session: 'Session 4'
  },
  {
    id: 'fajr-10',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:10',
    arabic: 'وَفِرْعَوْنَ ذِي الْأَوْتَادِ',
    translation: 'and Pharaoh of the tent pegs,',
    session: 'Session 4'
  },
  {
    id: 'fajr-11',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:11',
    arabic: 'الَّذِينَ طَغَوْا فِي الْبِلَادِ',
    translation: 'who transgressed in the lands',
    session: 'Session 4'
  },
  {
    id: 'fajr-12',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:12',
    arabic: 'فَأَكْثَرُوا فِيهَا الْفَسَادَ',
    translation: 'and spread much corruption in them.',
    session: 'Session 4'
  },
  {
    id: 'fajr-13',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:13',
    arabic: 'فَصَبَّ عَلَيْهِمْ رَبُّكَ سَوْطَ عَذَابٍ',
    translation: 'So your Lord poured out a scourge of punishment on them.',
    session: 'Session 4'
  },
  {
    id: 'fajr-14',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:14',
    arabic: 'إِنَّ رَبَّكَ لَبِالْمِرْصَادِ',
    translation: 'Indeed, your Lord is ever watchful.',
    session: 'Session 4'
  },
  {
    id: 'fajr-15',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:15',
    arabic: 'فَأَمَّا الْإِنْسَانُ إِذَا مَا ابْتَلَاهُ رَبُّهُ فَأَكْرَمَهُ وَنَعَّمَهُ فَيَقُولُ رَبِّي أَكْرَمَنِ',
    translation: 'As for man, whenever his Lord tests him, honoring him and blessing him, he says: "My Lord has honored me!"',
    session: 'Session 4'
  },
  {
    id: 'fajr-16',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:16',
    arabic: 'وَأَمَّا إِذَا مَا ابْتَلَاهُ فَقَدَرَ عَلَيْهِ رِزْقَهُ فَيَقُولُ رَبِّي أَهَانَنِ',
    translation: 'But whenever He tests him by rationing His sustenance for him, he says: "My Lord has disgraced me!"',
    session: 'Session 4'
  },
  {
    id: 'fajr-17',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:17',
    arabic: 'كَلَّا بَلْ لَا تُكْرِمُونَ الْيَتِيمَ',
    translation: 'But no! Rather you do not honor the orphan,',
    session: 'Session 4'
  },
  {
    id: 'fajr-18',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:18',
    arabic: 'وَلَا تَحَاضُّونَ عَلَىٰ طَعَامِ الْمِسْكِينِ',
    translation: 'and you do not urge feeding the needy,',
    session: 'Session 4'
  },
  {
    id: 'fajr-19',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:19',
    arabic: 'وَتَأْكُلُونَ التُّرَاثَ أَكْلًا لَمًّا',
    translation: 'and you greedily devour the inheritance,',
    session: 'Session 4'
  },
  {
    id: 'fajr-20',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:20',
    arabic: 'وَتُحِبُّونَ الْمَالَ حُبًّا جَمًّا',
    translation: 'and you love wealth with an ardent love.',
    session: 'Session 4'
  },
  {
    id: 'fajr-21',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:21',
    arabic: 'كَلَّا إِذَا دُكَّتِ الْأَرْضُ دَكًّا دَكًّا',
    translation: 'But no! When the earth is pounded to dust, pounding upon pounding,',
    session: 'Session 4'
  },
  {
    id: 'fajr-22',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:22',
    arabic: 'وَجَاءَ رَبُّكَ وَالْمَلَكُ صَفًّا صَفًّا',
    translation: 'and your Lord comes with the angels, rank upon rank,',
    session: 'Session 4'
  },
  {
    id: 'fajr-23',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:23',
    arabic: 'وَجِيءَ يَوْمَئِذٍ بِجَهَنَّمَ يَوْمَئِذٍ يَتَذَكَّرُ الْإِنْسَانُ وَأَنَّىٰ لَهُ الذِّكْرَىٰ',
    translation: 'and Hell is brought near that day - on that day man will remember, but how will remembrance avail him?',
    session: 'Session 4'
  },
  {
    id: 'fajr-24',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:24',
    arabic: 'يَقُولُ يَا لَيْتَنِي قَدَّمْتُ لِحَيَاتِي',
    translation: 'He will say: "Would that I had sent ahead for my life!"',
    session: 'Session 4'
  },
  {
    id: 'fajr-25',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:25',
    arabic: 'فَيَوْمَئِذٍ لَا يُعَذِّبُ عَذَابَهُ أَحَدٌ',
    translation: 'On that day, none will punish as He punishes,',
    session: 'Session 4'
  },
  {
    id: 'fajr-26',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:26',
    arabic: 'وَلَا يُوثِقُ وَثَاقَهُ أَحَدٌ',
    translation: 'and none will bind as He binds.',
    session: 'Session 4'
  },
  {
    id: 'fajr-27',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:27',
    arabic: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ',
    translation: 'O tranquil soul,',
    session: 'Session 4'
  },
  {
    id: 'fajr-28',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:28',
    arabic: 'ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَرْضِيَّةً',
    translation: 'return to your Lord, well-pleased and pleasing to Him!',
    session: 'Session 4'
  },
  {
    id: 'fajr-29',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:29',
    arabic: 'فَادْخُلِي فِي عِبَادِي',
    translation: 'Enter among My servants,',
    session: 'Session 4'
  },
  {
    id: 'fajr-30',
    surah: 'الفجر',
    surahEnglish: 'Al-Fajr (The Dawn)',
    verseNumber: '89:30',
    arabic: 'وَادْخُلِي جَنَّتِي',
    translation: 'and enter My Paradise!',
    session: 'Session 4'
  },

  // Session 5: Surah Al-Alaq (96:1-19)
  {
    id: 'alaq-1',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:1',
    arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
    translation: 'Read in the name of your Lord Who creates,',
    session: 'Session 5'
  },
  {
    id: 'alaq-2',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:2',
    arabic: 'خَلَقَ الْإِنْسَانَ مِنْ عَلَقٍ',
    translation: 'creates man from a clot.',
    session: 'Session 5'
  },
  {
    id: 'alaq-3',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:3',
    arabic: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ',
    translation: 'Read, for your Lord is Most Generous,',
    session: 'Session 5'
  },
  {
    id: 'alaq-4',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:4',
    arabic: 'الَّذِي عَلَّمَ بِالْقَلَمِ',
    translation: 'Who teaches by the pen,',
    session: 'Session 5'
  },
  {
    id: 'alaq-5',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:5',
    arabic: 'عَلَّمَ الْإِنْسَانَ مَا لَمْ يَعْلَمْ',
    translation: 'teaches man what he did not know.',
    session: 'Session 5'
  },
  {
    id: 'alaq-6',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:6',
    arabic: 'كَلَّا إِنَّ الْإِنْسَانَ لَيَطْغَىٰ',
    translation: 'But no! Man exceeds all bounds,',
    session: 'Session 5'
  },
  {
    id: 'alaq-7',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:7',
    arabic: 'أَنْ رَآهُ اسْتَغْنَىٰ',
    translation: 'when he considers himself self-sufficient.',
    session: 'Session 5'
  },
  {
    id: 'alaq-8',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:8',
    arabic: 'إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ',
    translation: 'Indeed, to your Lord is the return.',
    session: 'Session 5'
  },
  {
    id: 'alaq-9',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:9',
    arabic: 'أَرَأَيْتَ الَّذِي يَنْهَىٰ',
    translation: 'Have you seen the one who forbids',
    session: 'Session 5'
  },
  {
    id: 'alaq-10',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:10',
    arabic: 'عَبْدًا إِذَا صَلَّىٰ',
    translation: 'a servant when he prays?',
    session: 'Session 5'
  },
  {
    id: 'alaq-11',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:11',
    arabic: 'أَرَأَيْتَ إِنْ كَانَ عَلَى الْهُدَىٰ',
    translation: 'Have you seen if he is upon guidance',
    session: 'Session 5'
  },
  {
    id: 'alaq-12',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:12',
    arabic: 'أَوْ أَمَرَ بِالتَّقْوَىٰ',
    translation: 'or enjoins righteousness?',
    session: 'Session 5'
  },
  {
    id: 'alaq-13',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:13',
    arabic: 'أَرَأَيْتَ إِنْ كَذَّبَ وَتَوَلَّىٰ',
    translation: 'Have you seen if he denies and turns away?',
    session: 'Session 5'
  },
  {
    id: 'alaq-14',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:14',
    arabic: 'أَلَمْ يَعْلَمْ بِأَنَّ اللَّهَ يَرَىٰ',
    translation: 'Does he not know that God sees?',
    session: 'Session 5'
  },
  {
    id: 'alaq-15',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:15',
    arabic: 'كَلَّا لَئِنْ لَمْ يَنْتَهِ لَنَسْفَعًا بِالنَّاصِيَةِ',
    translation: 'But no! If he does not desist, We will surely drag him by the forelock -',
    session: 'Session 5'
  },
  {
    id: 'alaq-16',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:16',
    arabic: 'نَاصِيَةٍ كَاذِبَةٍ خَاطِئَةٍ',
    translation: 'a lying, sinful forelock.',
    session: 'Session 5'
  },
  {
    id: 'alaq-17',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:17',
    arabic: 'فَلْيَدْعُ نَادِيَهُ',
    translation: 'So let him call his associates;',
    session: 'Session 5'
  },
  {
    id: 'alaq-18',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:18',
    arabic: 'سَنَدْعُ الزَّبَانِيَةَ',
    translation: 'We will call the angels of Hell.',
    session: 'Session 5'
  },
  {
    id: 'alaq-19',
    surah: 'العلق',
    surahEnglish: 'Al-Alaq (The Clot)',
    verseNumber: '96:19',
    arabic: 'كَلَّا لَا تُطِعْهُ وَاسْجُدْ وَاقْتَرِبْ',
    translation: 'But no! Do not obey him. Prostrate and draw near to God.',
    session: 'Session 5'
  },

  // Session 6: Surah Al-Buruj (85:1-22)
  {
    id: 'buruj-1',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:1',
    arabic: 'وَالسَّمَاءِ ذَاتِ الْبُرُوجِ',
    translation: 'By the sky containing great stars,',
    session: 'Session 6'
  },
  {
    id: 'buruj-2',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:2',
    arabic: 'وَالْيَوْمِ الْمَوْعُودِ',
    translation: 'and by the promised Day,',
    session: 'Session 6'
  },
  {
    id: 'buruj-3',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:3',
    arabic: 'وَشَاهِدٍ وَمَشْهُودٍ',
    translation: 'and by the witness and what is witnessed,',
    session: 'Session 6'
  },
  {
    id: 'buruj-4',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:4',
    arabic: 'قُتِلَ أَصْحَابُ الْأُخْدُودِ',
    translation: 'cursed were the companions of the trench,',
    session: 'Session 6'
  },
  {
    id: 'buruj-5',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:5',
    arabic: 'النَّارِ ذَاتِ الْوَقُودِ',
    translation: 'the fire full of fuel,',
    session: 'Session 6'
  },
  {
    id: 'buruj-6',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:6',
    arabic: 'إِذْ هُمْ عَلَيْهَا قُعُودٌ',
    translation: 'when they were sitting by it,',
    session: 'Session 6'
  },
  {
    id: 'buruj-7',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:7',
    arabic: 'وَهُمْ عَلَىٰ مَا يَفْعَلُونَ بِالْمُؤْمِنِينَ شُهُودٌ',
    translation: 'and they were witnesses to what they were doing to the believers.',
    session: 'Session 6'
  },
  {
    id: 'buruj-8',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:8',
    arabic: 'وَمَا نَقَمُوا مِنْهُمْ إِلَّا أَنْ يُؤْمِنُوا بِاللَّهِ الْعَزِيزِ الْحَمِيدِ',
    translation: 'And they resented them only because they believed in God, the Almighty, the Praiseworthy,',
    session: 'Session 6'
  },
  {
    id: 'buruj-9',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:9',
    arabic: 'الَّذِي لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ وَاللَّهُ عَلَىٰ كُلِّ شَيْءٍ شَهِيدٌ',
    translation: 'to Whom belongs the dominion of the heavens and the earth. And God is Witness over all things.',
    session: 'Session 6'
  },
  {
    id: 'buruj-10',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:10',
    arabic: 'إِنَّ الَّذِينَ فَتَنُوا الْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ ثُمَّ لَمْ يَتُوبُوا فَلَهُمْ عَذَابُ جَهَنَّمَ وَلَهُمْ عَذَابُ الْحَرِيقِ',
    translation: 'Indeed, those who persecuted the believing men and believing women, and then did not repent, will have the punishment of Hell, and they will have the punishment of the Burning Fire.',
    session: 'Session 6'
  },
  {
    id: 'buruj-11',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:11',
    arabic: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ لَهُمْ جَنَّاتٌ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ ذَٰلِكَ الْفَوْزُ الْكَبِيرُ',
    translation: 'Indeed, those who believe and do righteous deeds will have gardens beneath which rivers flow. That is the great triumph.',
    session: 'Session 6'
  },
  {
    id: 'buruj-12',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:12',
    arabic: 'إِنَّ بَطْشَ رَبِّكَ لَشَدِيدٌ',
    translation: 'Indeed, the grip of your Lord is severe.',
    session: 'Session 6'
  },
  {
    id: 'buruj-13',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:13',
    arabic: 'إِنَّهُ هُوَ يُبْدِئُ وَيُعِيدُ',
    translation: 'Indeed, it is He Who originates and repeats.',
    session: 'Session 6'
  },
  {
    id: 'buruj-14',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:14',
    arabic: 'وَهُوَ الْغَفُورُ الْوَدُودُ',
    translation: 'And He is the Forgiving, the Loving,',
    session: 'Session 6'
  },
  {
    id: 'buruj-15',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:15',
    arabic: 'ذُو الْعَرْشِ الْمَجِيدُ',
    translation: 'Owner of the Glorious Throne,',
    session: 'Session 6'
  },
  {
    id: 'buruj-16',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:16',
    arabic: 'فَعَّالٌ لِمَا يُرِيدُ',
    translation: 'Doer of whatever He wills.',
    session: 'Session 6'
  },
  {
    id: 'buruj-17',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:17',
    arabic: 'هَلْ أَتَاكَ حَدِيثُ الْجُنُودِ',
    translation: 'Has the story reached you of the hosts,',
    session: 'Session 6'
  },
  {
    id: 'buruj-18',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:18',
    arabic: 'فِرْعَوْنَ وَثَمُودَ',
    translation: 'of Pharaoh and Thamud?',
    session: 'Session 6'
  },
  {
    id: 'buruj-19',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:19',
    arabic: 'بَلِ الَّذِينَ كَفَرُوا فِي تَكْذِيبٍ',
    translation: 'But those who disbelieve are in denial,',
    session: 'Session 6'
  },
  {
    id: 'buruj-20',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:20',
    arabic: 'وَاللَّهُ مِنْ وَرَائِهِمْ مُحِيطٌ',
    translation: 'while God encompasses them from behind.',
    session: 'Session 6'
  },
  {
    id: 'buruj-21',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:21',
    arabic: 'بَلْ هُوَ قُرْآنٌ مَجِيدٌ',
    translation: 'Rather, this is a Glorious Quran,',
    session: 'Session 6'
  },
  {
    id: 'buruj-22',
    surah: 'البروج',
    surahEnglish: 'Al-Buruj (The Mansions of the Stars)',
    verseNumber: '85:22',
    arabic: 'فِي لَوْحٍ مَحْفُوظٍ',
    translation: 'in a Preserved Tablet.',
    session: 'Session 6'
  },
];

// Group verses by session
const sessionGroups = [
  { id: 'session-1', name: 'Session 1', description: 'Surah An-Nisa (4:9-12)' },
  { id: 'session-2', name: 'Session 2', description: 'Surah Al-Maidah (5:94, 105-109)' },
  { id: 'session-2.1', name: 'Session 2.1', description: 'Ayat Al-Kursi (2:255-257)' },
  { id: 'session-3', name: 'Session 3', description: 'Surah Al-Insan (76:1-22)' },
  { id: 'session-4', name: 'Session 4', description: 'Surah Al-Fajr (89:1-30)' },
  { id: 'session-5', name: 'Session 5', description: 'Surah Al-Alaq (96:1-19)' },
  { id: 'session-6', name: 'Session 6', description: 'Surah Al-Buruj (85:1-22)' },
];

// Prayer Guide Data
const prayerGuide = [
  {
    section: 'Before Starting',
    sectionFarsi: 'قبل از شروع',
    steps: [
      { title: 'Intention (Niyyah)', farsi: 'نیت', type: 'Pillar', desc: 'You do not say this out loud. You simply decide in your heart something like:', quote: '"I intend to perform four units (rakahs) of the [Zuhr / Asr / Isha] prayer for the sake of Allah."' },
    ]
  },
  {
    section: 'Rakah 1',
    sectionFarsi: 'رکعت اول',
    steps: [
      { title: 'Standing facing the Qiblah', farsi: 'ایستادن رو به قبله', type: 'Pillar', desc: 'Stand upright, facing the direction of the Kabah (qiblah), calmly.' },
      { title: 'Opening Takbir (Takbirat al-Ihram)', farsi: 'تکبیرة الاحرام', type: 'Pillar', desc: 'Raise your hands (recommended) and say:', quote: '"Allah is the Greatest."' },
      { title: 'Optional Opening Supplication', farsi: 'دعای استفتاح (مستحب)', type: 'Recommended', desc: 'You may say:', quote: '"Glory be to You, O Allah, and praise be to You. Blessed is Your Name, exalted is Your Majesty, and there is no god but You."' },
      { title: 'Recitation: al-Fatihah', farsi: 'قرائت حمد', type: 'Obligatory (Pillar in Shia)', quote: '"In the Name of Allah, the Entirely Merciful, the Especially Merciful. All praise belongs to Allah, Lord of all worlds. The Entirely Merciful, the Especially Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us to the straight path – the path of those whom You have blessed, not of those who incur anger, nor of those who go astray."' },
      { title: 'Recitation: Another Surah (e.g., Ikhlas)', farsi: 'قرائت سوره (مثلاً توحید)', type: 'Obligatory', quote: '"In the Name of Allah, the Entirely Merciful, the Especially Merciful. Say: He is Allah, One. Allah, the Self-Sufficient. He neither begets nor is born, and there is none comparable to Him."' },
      { title: 'Bowing (Ruku)', farsi: 'رکوع', type: 'Pillar', desc: 'Bend forward, hands on knees. Say at least once (3x recommended):', quote: '"Glory be to my Lord, the Most Great, and praise is His."' },
      { title: 'Rising from Ruku', farsi: 'قیام بعد از رکوع', type: 'Pillar', desc: 'Rise back to standing. You may say:', quote: '"Allah hears the one who praises Him."' },
      { title: 'First Prostration (Sujud 1)', farsi: 'سجده اول', type: 'Pillar', desc: 'Forehead on ground. Say at least once (3x recommended):', quote: '"Glory be to my Lord, the Most High, and praise is His."' },
      { title: 'Sitting between Prostrations', farsi: 'نشستن بین دو سجده', type: 'Part of Pillar', desc: 'Sit up calmly. Recommended to say:', quote: '"I seek forgiveness from Allah, my Lord, and I turn to Him."' },
      { title: 'Second Prostration (Sujud 2)', farsi: 'سجده دوم', type: 'Pillar', quote: '"Glory be to my Lord, the Most High, and praise is His."' },
    ]
  },
  {
    section: 'Rakah 2',
    sectionFarsi: 'رکعت دوم',
    steps: [
      { title: 'Standing and Recitation', farsi: 'قیام و قرائت', type: 'Obligatory', desc: 'Recite al-Fatihah, then another surah (e.g., Ikhlas).' },
      { title: 'Ruku (Bowing)', farsi: 'رکوع', type: 'Pillar', quote: '"Glory be to my Lord, the Most Great, and praise is His."' },
      { title: 'Two Prostrations', farsi: 'دو سجده', type: 'Pillar', quote: '"Glory be to my Lord, the Most High, and praise is His."' },
      { title: 'Sitting for Tashahhud', farsi: 'نشستن برای تشهد', type: 'Obligatory', quote: '"I bear witness that there is no god except Allah, alone, without partner. And I bear witness that Muhammad is His servant and His messenger. O Allah, send Your blessings upon Muhammad and the family of Muhammad."' },
    ]
  },
  {
    section: 'Rakah 3',
    sectionFarsi: 'رکعت سوم',
    steps: [
      { title: 'Standing Recitation', farsi: 'قیام و قرائت (حمد یا تسبیحات)', type: 'Choose One', desc: 'Either al-Fatihah OR Four Glorifications (3x):', quote: '"Glory be to Allah, and praise be to Allah, and there is no god except Allah, and Allah is the Greatest."' },
      { title: 'Ruku', farsi: 'رکوع', type: 'Pillar', quote: '"Glory be to my Lord, the Most Great, and praise is His."' },
      { title: 'Two Prostrations', farsi: 'دو سجده', type: 'Pillar', quote: '"Glory be to my Lord, the Most High, and praise is His."' },
    ]
  },
  {
    section: 'Rakah 4',
    sectionFarsi: 'رکعت چهارم',
    steps: [
      { title: 'Standing Recitation', farsi: 'قیام و قرائت (حمد یا تسبیحات)', type: 'Choose One', desc: 'Either al-Fatihah OR Four Glorifications (3x).' },
      { title: 'Ruku', farsi: 'رکوع', type: 'Pillar', quote: '"Glory be to my Lord, the Most Great, and praise is His."' },
      { title: 'Two Prostrations', farsi: 'دو سجده', type: 'Pillar', quote: '"Glory be to my Lord, the Most High, and praise is His."' },
    ]
  },
  {
    section: 'Final Tashahhud and Salam',
    sectionFarsi: 'تشهد و سلام پایانی',
    steps: [
      { title: 'Final Tashahhud', farsi: 'تشهد آخر', type: 'Obligatory', quote: '"I bear witness that there is no god except Allah, alone, without partner. And I bear witness that Muhammad is His servant and His messenger. O Allah, send Your blessings upon Muhammad and the family of Muhammad."' },
      { title: 'Salam (Ending)', farsi: 'سلام نماز', type: 'Obligatory', quote: '"Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. Peace be upon you all, and the mercy of Allah and His blessings."' },
    ]
  },
];

const prayerPillars = [
  { name: 'Intention (Niyyah)', desc: 'Intending in the heart the specific prayer for the sake of Allah.', farsi: 'نیت' },
  { name: 'Opening Takbir', desc: 'Saying "Allah is the Greatest" at the start.', farsi: 'تکبیرة الاحرام' },
  { name: 'Standing (Qiyam)', desc: 'Being upright while saying takbir and reciting.', farsi: 'قیام' },
  { name: 'Recitation of al-Fatihah', desc: 'In the first two rakahs (pillar in Shia fiqh).', farsi: 'قرائت حمد' },
  { name: 'Bowing (Ruku)', desc: 'Proper bowing with stillness and glorification.', farsi: 'رکوع' },
  { name: 'Rising from Ruku', desc: 'Returning to full standing after bowing.', farsi: 'قیام بعد از رکوع' },
  { name: 'Two Prostrations (Sujud)', desc: 'Both prostrations with stillness and glorification.', farsi: 'سجود' },
  { name: 'Order (Tartib)', desc: 'Doing actions in correct sequence.', farsi: 'ترتیب' },
  { name: 'Continuity (Muwalat)', desc: 'No long unnecessary breaks between actions.', farsi: 'موالات' },
];

// Farsi Key Terms
const farsiPrayerTerms = [
  { term: 'نماز', meaning: 'Prayer (Salah)' },
  { term: 'رکعت', meaning: 'Unit of prayer (Rakah)' },
  { term: 'نیت', meaning: 'Intention (Niyyah)' },
  { term: 'تکبیرة الاحرام', meaning: 'Opening Takbir' },
  { term: 'قیام', meaning: 'Standing' },
  { term: 'قرائت', meaning: 'Recitation' },
  { term: 'رکوع', meaning: 'Bowing' },
  { term: 'سجود', meaning: 'Prostration' },
  { term: 'تشهد', meaning: 'Testimony/Witnessing' },
  { term: 'سلام', meaning: 'Greeting (ending prayer)' },
  { term: 'قبله', meaning: 'Direction of Kabah' },
  { term: 'واجب', meaning: 'Obligatory' },
  { term: 'رکن', meaning: 'Pillar' },
  { term: 'مستحب', meaning: 'Recommended' },
  { term: 'تسبیحات اربعه', meaning: 'Four Glorifications' },
];

const farsiPrayerNotes = [
  'نماز ظهر و عصر و عشا هر کدام ۴ رکعت هستند',
  'در رکعت اول و دوم باید حمد و سوره خوانده شود',
  'در رکعت سوم و چهارم میتوان حمد یا تسبیحات اربعه خواند',
  'تسبیحات اربعه: سبحان الله والحمد لله ولا اله الا الله والله اکبر (۳ بار)',
  'ذکر رکوع: سبحان ربی العظیم و بحمده',
  'ذکر سجود: سبحان ربی الاعلی و بحمده',
  'بعد از رکعت دوم و چهارم تشهد خوانده میشود',
  'نماز با سلام تمام میشود',
];

export function QuranExamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number; text: string } | null>(null);
  const [selectionCopied, setSelectionCopied] = useState(false);

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

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (rect) {
          setSelectionMenu({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            text: selectedText
          });
        }
      } else {
        setSelectionMenu(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.selection-menu')) {
        setSelectionMenu(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter verses based on search query with fault tolerance
  const filteredVerses = useMemo(() => {
    if (!searchQuery.trim()) return quranVerses;

    const query = searchQuery.trim();
    return quranVerses.filter(verse =>
      faultTolerantMatch(verse.arabic, query, true) ||
      faultTolerantMatch(verse.translation, query) ||
      verse.verseNumber.includes(query) ||
      faultTolerantMatch(verse.surahEnglish, query) ||
      faultTolerantMatch(verse.session, query)
    );
  }, [searchQuery]);

  // Group filtered verses by session
  const groupedVerses = useMemo(() => {
    const groups: { [key: string]: QuranVerse[] } = {};
    filteredVerses.forEach(verse => {
      const sessionKey = verse.session.split(' - ')[0];
      if (!groups[sessionKey]) {
        groups[sessionKey] = [];
      }
      groups[sessionKey].push(verse);
    });
    return groups;
  }, [filteredVerses]);

  // Filter prayer guide based on search query with fault tolerance
  const filteredPrayerGuide = useMemo(() => {
    if (!searchQuery.trim()) return prayerGuide;

    const query = searchQuery.trim();

    return prayerGuide.map(section => ({
      ...section,
      steps: section.steps.filter(step =>
        faultTolerantMatch(step.title, query) ||
        faultTolerantMatch(step.type, query) ||
        (step.desc && faultTolerantMatch(step.desc, query)) ||
        (step.quote && faultTolerantMatch(step.quote, query)) ||
        (step.farsi && faultTolerantMatch(step.farsi, query, true)) ||
        (section.sectionFarsi && faultTolerantMatch(section.sectionFarsi, query, true))
      )
    })).filter(section => section.steps.length > 0);
  }, [searchQuery]);

  // Filter Farsi notes based on search query with fault tolerance
  const filteredFarsiNotes = useMemo(() => {
    if (!searchQuery.trim()) return farsiPrayerNotes;

    const query = searchQuery.trim();
    return farsiPrayerNotes.filter(note =>
      faultTolerantMatch(note, query, true)
    );
  }, [searchQuery]);

  // Filter Farsi terms based on search query with fault tolerance
  const filteredFarsiTerms = useMemo(() => {
    if (!searchQuery.trim()) return farsiPrayerTerms;

    const query = searchQuery.trim();
    return farsiPrayerTerms.filter(item =>
      faultTolerantMatch(item.term, query, true) ||
      faultTolerantMatch(item.meaning, query)
    );
  }, [searchQuery]);

  // Filter pillars based on search query with fault tolerance
  const filteredPillars = useMemo(() => {
    if (!searchQuery.trim()) return prayerPillars;

    const query = searchQuery.trim();
    return prayerPillars.filter(pillar =>
      faultTolerantMatch(pillar.name, query) ||
      faultTolerantMatch(pillar.desc, query) ||
      faultTolerantMatch(pillar.farsi, query, true)
    );
  }, [searchQuery]);

  // Check if prayer section has any matches
  const hasPrayerMatches = searchQuery.trim() && (
    filteredPrayerGuide.length > 0 ||
    filteredFarsiNotes.length > 0 ||
    filteredFarsiTerms.length > 0 ||
    filteredPillars.length > 0
  );

  // Show prayer section if no search or has matches
  const showPrayerSection = !searchQuery.trim() || hasPrayerMatches;

  // Scroll to first result when search changes
  useEffect(() => {
    if (!searchQuery.trim()) return;

    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const firstResult = document.getElementById('first-search-result');
      if (firstResult) {
        firstResult.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 0);
  }, [searchQuery, filteredVerses, filteredPrayerGuide]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Quran Exam Materials</h1>
        </div>

        {/* Verses Sections */}
        {sessionGroups.map((session, sessionIndex) => {
          const sessionKey = session.name;
          const verses = groupedVerses[sessionKey];

          if (!verses || verses.length === 0) return null;

          // Check if this section contains the first result
          const firstVerseId = filteredVerses.length > 0 ? filteredVerses[0].id : null;

          return (
            <section
              key={session.id}
              id={session.id}
              className="mb-12"
            >
              <div className="glass rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{session.name}</h2>
                <p className="text-emerald-400 mb-6">{session.description}</p>

                <div className="space-y-6">
                  {verses.map((verse) => (
                    <div
                      key={verse.id}
                      id={searchQuery.trim() && verse.id === firstVerseId ? 'first-search-result' : undefined}
                      className="glass rounded-xl p-5 border border-white/5"
                      style={{ scrollMarginTop: '80px' }}
                    >
                      {/* Arabic Text with Verse Reference */}
                      <div
                        className="text-lg md:text-xl text-white mb-3 text-right font-arabic"
                        dir="rtl"
                        style={{ fontFamily: 'Amiri, serif', lineHeight: '1.8' }}
                      >
                        {highlightText(normalizeArabic(verse.arabic), searchQuery, true)}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-sans mr-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {verse.verseNumber}
                        </span>
                      </div>

                      {/* English Translation */}
                      <div className="flex items-start gap-3 border-t border-white/10 pt-4">
                        <div className="text-gray-300 leading-relaxed flex-1">
                          {highlightText(verse.translation, searchQuery)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(verse.translation, verse.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white shrink-0 cursor-pointer"
                          title="Copy translation"
                        >
                          {copiedId === verse.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Prayer Guide Section */}
        {showPrayerSection && (
          <section
            id={searchQuery.trim() && filteredVerses.length === 0 && hasPrayerMatches ? 'first-search-result' : 'prayer-guide'}
            className="mb-12"
            style={{ scrollMarginTop: '80px' }}
          >
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Prayer Guide</h2>
              <p className="text-emerald-400 mb-4">Four-Rak'ah Prayer (Shia Practice)</p>

              {/* Farsi Key Notes */}
              {filteredFarsiNotes.length > 0 && (
                <div className="glass rounded-xl p-4 border border-sky-500/20 mb-6">
                  <h3 className="text-lg font-semibold text-sky-400 mb-3" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>نکات کلیدی نماز</h3>
                  <ul className="space-y-2" dir="rtl">
                    {filteredFarsiNotes.map((note, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-sky-400">•</span>
                        <span style={{ fontFamily: 'Vazirmatn, sans-serif' }}>{highlightText(note, searchQuery, true)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Farsi Terms */}
              {filteredFarsiTerms.length > 0 && (
                <div className="glass rounded-xl p-4 border border-purple-500/20 mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">Key Terms / <span style={{ fontFamily: 'Vazirmatn, sans-serif' }}>اصطلاحات</span></h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredFarsiTerms.map((item, index) => (
                      <div key={index} className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <span className="text-purple-300 text-sm" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.term}</span>
                        <span className="text-gray-500 text-xs mx-1">-</span>
                        <span className="text-gray-400 text-xs">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredPrayerGuide.length > 0 && (
                <div className="space-y-6">
                  {filteredPrayerGuide.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="glass rounded-xl p-4 border border-white/5">
                      <h3 className="text-lg font-semibold text-purple-400 mb-3">
                        {section.section}
                        {section.sectionFarsi && (
                          <span className="mr-2 text-purple-300" style={{ fontFamily: 'Vazirmatn, sans-serif' }}> / {section.sectionFarsi}</span>
                        )}
                      </h3>
                      <div className="space-y-3">
                        {section.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="pl-4 border-l-2 border-emerald-500/30">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-white font-medium text-sm">{highlightText(step.title, searchQuery)}</span>
                              {step.farsi && (
                                <span className="text-emerald-300 text-sm" style={{ fontFamily: 'Vazirmatn, sans-serif' }}>({highlightText(step.farsi, searchQuery, true)})</span>
                              )}
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                                {step.type}
                              </span>
                            </div>
                            {step.desc && <p className="text-gray-400 text-sm mb-1">{highlightText(step.desc, searchQuery)}</p>}
                            {step.quote && <p className="text-gray-300 text-sm italic">{highlightText(step.quote, searchQuery)}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pillars Summary */}
              {filteredPillars.length > 0 && (
                <div className="mt-6 glass rounded-xl p-4 border border-amber-500/20">
                  <h3 className="text-lg font-semibold text-amber-400 mb-3">Pillars (Arkan) / <span style={{ fontFamily: 'Vazirmatn, sans-serif' }}>ارکان نماز</span></h3>
                  <p className="text-gray-500 text-xs mb-3">If a pillar is left out, prayer is invalid</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredPillars.map((pillar, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-amber-400 text-sm">{index + 1}.</span>
                        <div>
                          <span className="text-white text-sm font-medium">{highlightText(pillar.name, searchQuery)}</span>
                          <span className="text-amber-300 text-xs mr-1" dir="rtl" style={{ fontFamily: 'Vazirmatn, sans-serif' }}> ({highlightText(pillar.farsi, searchQuery, true)})</span>
                          <span className="text-gray-400 text-sm"> - {highlightText(pillar.desc, searchQuery)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
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
                placeholder="جستجوی آیات (عربی، انگلیسی، نام سوره، شماره آیه...)"
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
                Found {filteredVerses.length} verse{filteredVerses.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Spacer for fixed search bar */}
        <div className="h-24" />
      </div>

      {/* Selection Copy Menu */}
      {selectionMenu && (
        <div
          className="selection-menu fixed z-[100] transform -translate-x-1/2 -translate-y-full"
          style={{ left: selectionMenu.x, top: selectionMenu.y }}
        >
          <button
            onClick={copySelectedText}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-white/20 rounded-lg shadow-xl hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {selectionCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-white" />
            )}
            <span className="text-white text-sm">{selectionCopied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
