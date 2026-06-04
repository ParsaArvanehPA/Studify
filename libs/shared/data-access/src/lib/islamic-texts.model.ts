/** A section of Letter 53. */
export interface Section {
    id: string;
    name: string;
    nameEnglish: string;
}

/** A trilingual passage. */
export interface Passage {
    id: string;
    arabic: string;
    farsi: string;
    english: string;
    section: string;
    sectionEnglish: string;
}

/** A trilingual glossary entry. */
export interface VocabEntry {
    id: number;
    arabic: string;
    farsi: string;
    english: string;
}

/** The full Letter 53 dataset (data/islamic-texts.json). */
export interface IslamicTexts {
    sections: Section[];
    passages: Passage[];
    vocab: VocabEntry[];
}
