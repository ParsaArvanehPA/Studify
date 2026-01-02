export interface StudyFile {
  name: string;
  path: string;
  type: 'html' | 'pdf';
}

export interface Session {
  id: string;
  name: string;
  files: StudyFile[];
}

export interface Course {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  sessions: Session[];
}

export interface Semester {
  id: string;
  name: string;
  icon: string;
  color: string;
  courses: Course[];
}

export const studyData: Semester[] = [
  {
    id: 'semester-1',
    name: 'Semester 1',
    icon: '📚',
    color: 'from-indigo-500 to-purple-600',
    courses: [
      {
        id: 'creative-writing',
        name: 'Creative Writing',
        icon: '✍️',
        color: 'from-pink-500 to-rose-600',
        description: 'Learn the art of creative expression through writing',
        sessions: [
          {
            id: 'chapter-1',
            name: 'Chapter 1: Paragraph Structure',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Creative Writing/chapter-1-summary.html', type: 'html' },
              { name: 'Concise Summary', path: 'Semester 1/Creative Writing/chapter-1-summary-concise.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-2',
            name: 'Chapter 2',
            files: [
              { name: 'Concise Summary', path: 'Semester 1/Creative Writing/chapter-2-summary-concise.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-3',
            name: 'Chapter 3',
            files: [
              { name: 'Concise Summary', path: 'Semester 1/Creative Writing/chapter-3-summary-concise.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-4',
            name: 'Chapter 4',
            files: [
              { name: 'Concise Summary', path: 'Semester 1/Creative Writing/chapter-4-summary-concise.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-5',
            name: 'Chapter 5',
            files: [
              { name: 'Concise Summary', path: 'Semester 1/Creative Writing/chapter-5-summary-concise.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-9',
            name: 'Chapter 9',
            files: [
              { name: 'Concise Summary', path: 'Semester 1/Creative Writing/chapter-9-summary-concise.html', type: 'html' },
            ]
          },
        ]
      },
      {
        id: 'critical-discourse',
        name: 'Critical Discourse Analysis',
        icon: '🔍',
        color: 'from-cyan-500 to-blue-600',
        description: 'Analyzing language in social and political contexts',
        sessions: [
          {
            id: 'chapter-1',
            name: 'Chapter 1',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Critical Discourse Analysis/chapter-1-summary.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-2',
            name: 'Chapter 2',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Critical Discourse Analysis/chapter-2-summary.html', type: 'html' },
            ]
          },
          {
            id: 'chapter-3',
            name: 'Chapter 3',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Critical Discourse Analysis/chapter-3-summary.html', type: 'html' },
            ]
          },
        ]
      },
      {
        id: 'news-translation',
        name: 'News Translation',
        icon: '📰',
        color: 'from-amber-500 to-orange-600',
        description: 'Translating news content across languages',
        sessions: [
          {
            id: 'week-1-2',
            name: 'Week 1 & 2',
            files: [
              { name: 'Power, Language & Translation', path: 'Semester 1/News Translation/Week-1&2/Comprehensive/Bielsa-Bassnett-2008_Ch1_Power-Language-Translation_Comprehensive.html', type: 'html' },
              { name: 'Globalization & Translation', path: 'Semester 1/News Translation/Week-1&2/Comprehensive/Bielsa-Bassnett-2008_Ch2_Globalization-Translation_Comprehensive.html', type: 'html' },
              { name: 'Media Translation', path: 'Semester 1/News Translation/Week-1&2/Comprehensive/OConnor-2022_Media-Translation_Comprehensive.html', type: 'html' },
              { name: 'Power, Language (Exam Cram)', path: 'Semester 1/News Translation/Week-1&2/Exam-Cram/Bielsa-Bassnett-2008_Ch1_Power-Language-Translation_Exam-Cram.html', type: 'html' },
              { name: 'Globalization (Exam Cram)', path: 'Semester 1/News Translation/Week-1&2/Exam-Cram/Bielsa-Bassnett-2008_Ch2_Globalization-Translation_Exam-Cram.html', type: 'html' },
              { name: 'Media Translation (Exam Cram)', path: 'Semester 1/News Translation/Week-1&2/Exam-Cram/OConnor-2022_Media-Translation_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-3',
            name: 'Week 3',
            files: [
              { name: 'Journalistic Translation Research', path: 'Semester 1/News Translation/Week-3/Comprehensive/Valdeon-2019_Journalistic-Translation-Research-Goes-Global_Comprehensive.html', type: 'html' },
              { name: 'Journalistic Translation (Exam Cram)', path: 'Semester 1/News Translation/Week-3/Exam-Cram/Valdeon-2019_Journalistic-Translation-Research-Goes-Global_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-4',
            name: 'Week 4',
            files: [
              { name: 'Translation & News Agencies', path: 'Semester 1/News Translation/Week-4/Comprehensive/Bielsa-2022_Ch12_Translation-News-Agencies_Comprehensive.html', type: 'html' },
              { name: 'Journalism & Translation', path: 'Semester 1/News Translation/Week-4/Comprehensive/Bielsa-Bassnett-2008_Ch5_Journalism-Translation-News-Agencies.html', type: 'html' },
              { name: 'News Agencies (Exam Cram)', path: 'Semester 1/News Translation/Week-4/Exam-Cram/Bielsa-2022_Ch12_Translation-News-Agencies.html', type: 'html' },
              { name: 'Journalism (Exam Cram)', path: 'Semester 1/News Translation/Week-4/Exam-Cram/Bielsa-Bassnett-2008_Ch5_Journalism-Translation-News-Agencies.html', type: 'html' },
            ]
          },
          {
            id: 'week-5',
            name: 'Week 5',
            files: [
              { name: 'Foreign Articles & Local Implications', path: 'Semester 1/News Translation/Week-5/Comprehensive/Caimotto-2010_Ch3_Translating-Foreign-Articles-Local-Implications_Comprehensive.html', type: 'html' },
              { name: 'Translators Strategies & Ideological Conflict', path: 'Semester 1/News Translation/Week-5/Comprehensive/Loupaki-2010_Ch2_Translators-Strategies-Ideological-Conflict_Comprehensive.html', type: 'html' },
              { name: 'Foreign Articles (Exam Cram)', path: 'Semester 1/News Translation/Week-5/Exam-Cram/Caimotto-2010_Ch3_Translating-Foreign-Articles-Local-Implications_Exam-Cram.html', type: 'html' },
              { name: 'Ideological Conflict (Exam Cram)', path: 'Semester 1/News Translation/Week-5/Exam-Cram/Loupaki-2010_Ch2_Translators-Strategies-Ideological-Conflict_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-6',
            name: 'Week 6',
            files: [
              { name: 'Translation & Literary Magazines', path: 'Semester 1/News Translation/Week-6/Comprehensive/Bielsa-2022_Ch13_Translation-Literary-Magazines_Comprehensive.html', type: 'html' },
              { name: 'Reading Translated News', path: 'Semester 1/News Translation/Week-6/Comprehensive/Bielsa-2022_Ch17_Reading-Translated-News_Comprehensive.html', type: 'html' },
              { name: 'Translations in Italian Media', path: 'Semester 1/News Translation/Week-6/Comprehensive/Schaffner-Bassnett-2010_Ch5_Translations-Italian-Media_Comprehensive.html', type: 'html' },
              { name: 'Literary Magazines (Exam Cram)', path: 'Semester 1/News Translation/Week-6/Exam-Cram/Bielsa-2022_Ch13_Translation-Literary-Magazines_Exam-Cram.html', type: 'html' },
              { name: 'Reading News (Exam Cram)', path: 'Semester 1/News Translation/Week-6/Exam-Cram/Bielsa-2022_Ch17_Reading-Translated-News_Exam-Cram.html', type: 'html' },
              { name: 'Italian Media (Exam Cram)', path: 'Semester 1/News Translation/Week-6/Exam-Cram/Schaffner-Bassnett-2010_Ch5_Translations-Italian-Media_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-7',
            name: 'Week 7',
            files: [
              { name: 'Translation & Trust', path: 'Semester 1/News Translation/Week-7/Comprehensive/Bielsa-Bassnett-2008_Ch7_Translation-Trust_Comprehensive.html', type: 'html' },
              { name: 'Journalism Translation Ethics', path: 'Semester 1/News Translation/Week-7/Comprehensive/Floros-2022_Ch16_Journalism-Translation-Ethics_Comprehensive.html', type: 'html' },
              { name: 'Trust (Exam Cram)', path: 'Semester 1/News Translation/Week-7/Exam-Cram/Bielsa-Bassnett-2008_Ch7_Translation-Trust_Exam-Cram.html', type: 'html' },
              { name: 'Ethics (Exam Cram)', path: 'Semester 1/News Translation/Week-7/Exam-Cram/Floros-2022_Ch16_Journalism-Translation-Ethics_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-8',
            name: 'Week 8',
            files: [
              { name: 'News Translation Strategies', path: 'Semester 1/News Translation/Week-8/Comprehensive/Hernandez-Guerrero-2022_Ch15_News-Translation-Strategies_Comprehensive.html', type: 'html' },
              { name: 'EU Multilingualism Policy', path: 'Semester 1/News Translation/Week-8/Comprehensive/Stecconi-2010_Ch6_EU-Multilingualism-Policy_Comprehensive.html', type: 'html' },
              { name: 'Strategies (Exam Cram)', path: 'Semester 1/News Translation/Week-8/Exam-Cram/Hernandez-Guerrero-2022_Ch15_News-Translation-Strategies_Exam-Cram.html', type: 'html' },
              { name: 'EU Policy (Exam Cram)', path: 'Semester 1/News Translation/Week-8/Exam-Cram/Stecconi-2010_Ch6_EU-Multilingualism-Policy_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-10',
            name: 'Week 10',
            files: [
              { name: 'AVT Audiences & Reception', path: 'Semester 1/News Translation/Week-10/Comprehensive/DiGiovanni-2022_Ch25_AVT-Audiences-Reception_Comprehensive.html', type: 'html' },
              { name: 'Islamic TV Subtitling', path: 'Semester 1/News Translation/Week-10/Comprehensive/Moll-2022_Ch29_Islamic-TV-Subtitling_Comprehensive.html', type: 'html' },
              { name: 'AVT Reception (Exam Cram)', path: 'Semester 1/News Translation/Week-10/Exam-Cram/DiGiovanni-2022_Ch25_AVT-Audiences-Reception_Exam-Cram.html', type: 'html' },
              { name: 'Islamic TV (Exam Cram)', path: 'Semester 1/News Translation/Week-10/Exam-Cram/Moll-2022_Ch29_Islamic-TV-Subtitling_Exam-Cram.html', type: 'html' },
            ]
          },
          {
            id: 'week-11',
            name: 'Week 11',
            files: [
              { name: 'Translation Media Paratexts', path: 'Semester 1/News Translation/Week-11/Comprehensive/Batchelor-2022_Ch8_Translation-Media-Paratexts_Comprehensive.html', type: 'html' },
              { name: 'Translation Criticism', path: 'Semester 1/News Translation/Week-11/Comprehensive/Farahzad-2012_Translation-Criticism_Comprehensive.html', type: 'html' },
              { name: 'Translation Criticism (Persian)', path: 'Semester 1/News Translation/Week-11/Comprehensive/Farahzad-2012_Translation-Criticism_Comprehensive_FA.html', type: 'html' },
              { name: 'Paratexts (Exam Cram)', path: 'Semester 1/News Translation/Week-11/Exam-Cram/Batchelor-2022_Ch8_Translation-Media-Paratexts_Exam-Cram.html', type: 'html' },
              { name: 'Criticism (Exam Cram)', path: 'Semester 1/News Translation/Week-11/Exam-Cram/Farahzad-2012_Translation-Criticism_Exam-Cram.html', type: 'html' },
              { name: 'Criticism Persian (Exam Cram)', path: 'Semester 1/News Translation/Week-11/Exam-Cram/Farahzad-2012_Translation-Criticism_Exam-Cram_FA.html', type: 'html' },
            ]
          },
        ]
      },
      {
        id: 'quran-translation',
        name: 'Quran in Translation',
        icon: '📖',
        color: 'from-emerald-500 to-teal-600',
        description: 'Study of Quranic translation methodologies',
        sessions: [
          {
            id: 'session-1',
            name: 'Session 1',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-1/session-1-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-1/session-1-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'session-2',
            name: 'Session 2',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-2/session-2-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-2/session-2-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'session-2-1',
            name: 'Session 2.1',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-2.1/session-2.1-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-2.1/session-2.1-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'session-3',
            name: 'Session 3',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-3/session-3-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-3/session-3-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'session-4',
            name: 'Session 4',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-4/session-4-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-4/session-4-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'session-5',
            name: 'Session 5',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-5/session-5-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-5/session-5-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'session-6',
            name: 'Session 6',
            files: [
              { name: 'Study Guide', path: 'Semester 1/Quran in Translation/session-6/session-6-study-guide.html', type: 'html' },
              { name: 'Exam Cram', path: 'Semester 1/Quran in Translation/session-6/session-6-exam-cram.html', type: 'html' },
            ]
          },
          {
            id: 'ultimate-cheat-sheet',
            name: 'Ultimate Exam Cheat Sheet',
            files: [
              { name: 'Ultimate Exam Cheat Sheet', path: 'Semester 1/Quran in Translation/ULTIMATE-EXAM-CHEAT-SHEET.html', type: 'html' },
            ]
          },
        ]
      },
      {
        id: 'research',
        name: 'The Way of Research',
        icon: '🔬',
        color: 'from-violet-500 to-purple-600',
        description: 'Research methodologies and academic writing',
        sessions: [
          {
            id: 'session-1',
            name: 'Session 1',
            files: [
              { name: 'Study Guide', path: 'Semester 1/The Way of Research/session-1/session-1-study-guide.html', type: 'html' },
            ]
          },
          {
            id: 'session-2',
            name: 'Session 2',
            files: [
              { name: 'Study Guide', path: 'Semester 1/The Way of Research/session-2/session-2-study-guide.html', type: 'html' },
            ]
          },
          {
            id: 'session-3',
            name: 'Session 3',
            files: [
              { name: 'Study Guide', path: 'Semester 1/The Way of Research/session-3/session-3-study-guide.html', type: 'html' },
            ]
          },
          {
            id: 'session-4',
            name: 'Session 4',
            files: [
              { name: 'Study Guide', path: 'Semester 1/The Way of Research/session-4/session-4-study-guide.html', type: 'html' },
            ]
          },
          {
            id: 'session-5',
            name: 'Session 5',
            files: [
              { name: 'Study Guide', path: 'Semester 1/The Way of Research/session-5/session-5-study-guide.html', type: 'html' },
            ]
          },
          {
            id: 'session-6',
            name: 'Session 6',
            files: [
              { name: 'Study Guide', path: 'Semester 1/The Way of Research/session-6/session-6-study-guide.html', type: 'html' },
            ]
          },
        ]
      },
    ]
  }
];
