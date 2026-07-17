import {Course} from './course.model';

/** Course catalog — generated from bundled content by tools/gen-catalog.mjs. */
export const COURSES: readonly Course[] = [
    {
        id: 'creative-writing',
        name: 'Creative Writing',
        fa: 'نگارش خلاق',
        glyph: '✍️',
        color: '#F0726B',
        semester: 'Semester 1',
        description:
            'The craft of clear, expressive writing — paragraph structure, topic sentences, support and revision — distilled into detailed study guides and concise exam summaries.',
        chapters: [
            {
                no: '01',
                title: 'Chapter 1',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'cw-1-guide'},
                    {kind: 'Concise', tag: 'concise', docId: 'cw-1'}
                ]
            },
            {no: '02', title: 'Chapter 2', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-2'}]},
            {no: '03', title: 'Chapter 3', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-3'}]},
            {no: '04', title: 'Chapter 4', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-4'}]},
            {no: '05', title: 'Chapter 5', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-5'}]},
            {no: '09', title: 'Chapter 9', files: [{kind: 'Concise', tag: 'concise', docId: 'cw-9'}]}
        ]
    },
    {
        id: 'critical-discourse-analysis',
        name: 'Critical Discourse Analysis',
        fa: 'تحلیل گفتمان انتقادی',
        glyph: '🔍',
        color: '#3BB6D6',
        semester: 'Semester 1',
        description:
            'Reading power and ideology in text and talk — analysis across three chapter study guides, with an exam-question set.',
        chapters: [
            {no: '01', title: 'Chapter 1', files: [{kind: 'Study Guide', tag: 'guide', docId: 'cda-1-guide'}]},
            {no: '02', title: 'Chapter 2', files: [{kind: 'Study Guide', tag: 'guide', docId: 'cda-2-guide'}]},
            {no: '03', title: 'Chapter 3', files: [{kind: 'Study Guide', tag: 'guide', docId: 'cda-3-guide'}]},
            {no: '04', title: 'Exam Questions', files: [{kind: 'Self-test', tag: 'quiz', docId: 'cda-exam'}]}
        ]
    },
    {
        id: 'news-translation',
        name: 'News Translation',
        fa: 'ترجمهٔ متون مطبوعاتی',
        glyph: '📰',
        color: '#E8A93C',
        semester: 'Semester 1',
        description:
            'Journalistic and media translation — power, globalization, news agencies, ideology and audiovisual reception — each weekly reading in a comprehensive guide and an exam cram.',
        chapters: [
            {
                no: '01',
                title: 'Bielsa Bassnett 2008 Ch1 Power Language Translation · Wk 1-2',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-1-2-1-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-1-2-1-cram'}
                ]
            },
            {
                no: '02',
                title: 'Bielsa Bassnett 2008 Ch2 Globalization Translation · Wk 1-2',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-1-2-2-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-1-2-2-cram'}
                ]
            },
            {
                no: '03',
                title: 'OConnor 2022 Media Translation · Wk 1-2',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-1-2-3-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-1-2-3-cram'}
                ]
            },
            {
                no: '04',
                title: 'Valdeon 2019 Journalistic Translation Research Goes Global · Wk 3',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-3-4-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-3-4-cram'}
                ]
            },
            {
                no: '05',
                title: 'Bielsa 2022 Ch12 Translation News Agencies · Wk 4',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-4-5-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-4-5-cram'}
                ]
            },
            {
                no: '06',
                title: 'Bielsa Bassnett 2008 Ch5 Journalism Translation News Agencies · Wk 4',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-4-6-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-4-6-cram'}
                ]
            },
            {
                no: '07',
                title: 'Caimotto 2010 Ch3 Translating Foreign Articles Local Implications · Wk 5',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-5-7-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-5-7-cram'}
                ]
            },
            {
                no: '08',
                title: 'Loupaki 2010 Ch2 Translators Strategies Ideological Conflict · Wk 5',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-5-8-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-5-8-cram'}
                ]
            },
            {
                no: '09',
                title: 'Bielsa 2022 Ch13 Translation Literary Magazines · Wk 6',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-6-9-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-6-9-cram'}
                ]
            },
            {
                no: '10',
                title: 'Bielsa 2022 Ch17 Reading Translated News · Wk 6',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-6-10-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-6-10-cram'}
                ]
            },
            {
                no: '11',
                title: 'Schaffner Bassnett 2010 Ch5 Translations Italian Media · Wk 6',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-6-11-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-6-11-cram'}
                ]
            },
            {
                no: '12',
                title: 'Bielsa Bassnett 2008 Ch7 Translation Trust · Wk 7',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-7-12-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-7-12-cram'}
                ]
            },
            {
                no: '13',
                title: 'Floros 2022 Ch16 Journalism Translation Ethics · Wk 7',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-7-13-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-7-13-cram'}
                ]
            },
            {
                no: '14',
                title: 'Hernandez Guerrero 2022 Ch15 News Translation Strategies · Wk 8',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-8-14-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-8-14-cram'}
                ]
            },
            {
                no: '15',
                title: 'Stecconi 2010 Ch6 EU Multilingualism Policy · Wk 8',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-8-15-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-8-15-cram'}
                ]
            },
            {
                no: '16',
                title: 'DiGiovanni 2022 Ch25 AVT Audiences Reception · Wk 10',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-10-16-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-10-16-cram'}
                ]
            },
            {
                no: '17',
                title: 'Moll 2022 Ch29 Islamic TV Subtitling · Wk 10',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-10-17-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-10-17-cram'}
                ]
            },
            {
                no: '18',
                title: 'Batchelor 2022 Ch8 Translation Media Paratexts · Wk 11',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-11-18-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-11-18-cram'}
                ]
            },
            {
                no: '19',
                title: 'Farahzad 2012 Translation Criticism · Wk 11',
                files: [
                    {kind: 'فارسی · جامع', tag: 'guide', docId: 'nt-week-11-19-fa-full'},
                    {kind: 'Comprehensive', tag: 'guide', docId: 'nt-week-11-19-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'nt-week-11-19-cram'},
                    {kind: 'فارسی · فشرده', tag: 'concise', docId: 'nt-week-11-19-fa-cram'}
                ]
            }
        ]
    },
    {
        id: 'quran-in-translation',
        name: 'Quran in Translation',
        fa: 'ترجمهٔ قرآن',
        glyph: '📖',
        color: '#46C39A',
        semester: 'Semester 1',
        description: 'Translating the Qur’an — session study guides and exam crams, plus an ultimate exam cheat sheet.',
        chapters: [
            {
                no: '01',
                title: 'Session 1',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-1-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-1-cram'}
                ]
            },
            {
                no: '02',
                title: 'Session 2',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-2-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-2-cram'}
                ]
            },
            {
                no: '21',
                title: 'Session 2.1',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-2-1-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-2-1-cram'}
                ]
            },
            {
                no: '03',
                title: 'Session 3',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-3-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-3-cram'}
                ]
            },
            {
                no: '04',
                title: 'Session 4',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-4-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-4-cram'}
                ]
            },
            {
                no: '05',
                title: 'Session 5',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-5-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-5-cram'}
                ]
            },
            {
                no: '06',
                title: 'Session 6',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'qr-6-guide'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'qr-6-cram'}
                ]
            },
            {
                no: '99',
                title: 'Exam Cheat Sheet',
                files: [{kind: 'Cheat Sheet', tag: 'concise', docId: 'qr-cheatsheet'}]
            }
        ]
    },
    {
        id: 'the-way-of-research',
        name: 'The Way of Research',
        fa: 'روش تحقیق',
        glyph: '🔬',
        color: '#9384F2',
        semester: 'Semester 1',
        description:
            'Research methods in translation studies — foundations, theoretical turns and exam-ready self-tests, presented in the unified reader.',
        chapters: [
            {
                no: '01',
                title: 'Session 1',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-1-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-1-qa'}
                ]
            },
            {
                no: '02',
                title: 'Session 2',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-2-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-2-qa'}
                ]
            },
            {
                no: '03',
                title: 'Session 3',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-3-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-3-qa'}
                ]
            },
            {
                no: '04',
                title: 'Session 4',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-4-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-4-qa'}
                ]
            },
            {
                no: '05',
                title: 'Session 5',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-5-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-5-qa'}
                ]
            },
            {
                no: '06',
                title: 'Session 6',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-6-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-6-qa'}
                ]
            },
            {
                no: '07',
                title: 'Session 7',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-7-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-7-qa'}
                ]
            },
            {
                no: '08',
                title: 'Session 8',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-8-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-8-qa'}
                ]
            },
            {
                no: '09',
                title: 'Session 9',
                files: [
                    {kind: 'Study Guide', tag: 'guide', docId: 'wr-9-guide'},
                    {kind: 'Self-test', tag: 'quiz', docId: 'wr-9-qa'}
                ]
            }
        ]
    },
    {
        id: 'online-journalism',
        name: 'Online Journalism',
        fa: 'روزنامه‌نگاری برخط',
        glyph: '📰',
        color: '#5BA8F0',
        semester: 'Semester 2',
        description:
            'Translation strategies in global news — domestication and foreignisation in the coverage of foreign quotation and culture-specific concepts, examined through the Reuters news agency and the Sarkozy banlieue case study.',
        chapters: [
            {
                no: '01',
                title: 'Session 1',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-1-guide'}],
                video: 'https://notebooklm.google.com/notebook/105a69a6-2145-41f8-a49d-1cea9a57a94b/artifact/8e86deea-c822-4879-a4c1-496cb11df213'
            },
            {
                no: '02',
                title: 'Session 2',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-2-guide'}],
                video: 'https://notebooklm.google.com/notebook/5b28e355-aa66-4857-bd24-fefddfe1b656/artifact/0d6d3b9a-ec61-4b29-a0ed-98df16e19c52'
            },
            {
                no: '03',
                title: 'Session 3',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-3-guide'}],
                video: 'https://notebooklm.google.com/notebook/d2c6a055-e913-4316-a8df-5c5617879f54/artifact/354ca452-0538-4332-b293-42351faf9a7e'
            },
            {
                no: '04',
                title: 'Session 4',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-4-guide'}],
                video: 'https://notebooklm.google.com/notebook/c65b5f3b-376f-4a1c-8fd4-d719a73cb731/artifact/1c03c7a0-f79e-44bd-a93e-01fd53ad2b6e'
            },
            {
                no: '05',
                title: 'Session 5',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-5-guide'}],
                video: 'https://notebooklm.google.com/notebook/ceb95b8d-261f-49e8-a49e-716a43bab5c5/artifact/ff1ef64d-14a6-46af-bdd9-d693322e7565'
            },
            {
                no: '06',
                title: 'Session 6',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-6-guide'}],
                video: 'https://notebooklm.google.com/notebook/31eb61f5-ca9b-4f50-813b-17b7c3f15976/artifact/93237143-fa6c-42fe-867e-184dce3c1828'
            },
            {
                no: '07',
                title: 'Session 7',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-7-guide'}],
                video: 'https://notebooklm.google.com/notebook/fbdc7426-2f27-4052-8c9f-0f57208ec4db/artifact/61a0fc71-540c-4b9b-ae24-6b048a3a50c9'
            },
            {
                no: '08',
                title: 'Session 8',
                files: [{kind: 'Study Guide', tag: 'guide', docId: 'oj-8-guide'}],
                video: 'https://notebooklm.google.com/notebook/f505ada7-7a6c-43b0-a69c-ba3fcd56c7a8/artifact/a149e376-689e-4e7f-81e5-ebed3a002d8d'
            }
        ]
    },
    {
        id: 'political-translation',
        name: 'Political Translation',
        fa: 'ترجمهٔ سیاسی',
        glyph: '🗳️',
        color: '#5BC9A0',
        semester: 'Semester 2',
        description:
            'Translation of political texts — Edward Said, Carl Schmitt and critical discourse analysis, with hands-on translation workshops.',
        chapters: [
            {no: '01', title: 'Session 1', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-1-guide'}]},
            {no: '02', title: 'Session 2', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-2-guide'}]},
            {no: '03', title: 'Session 3', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-3-guide'}]},
            {no: '04', title: 'Session 4', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-4-guide'}]},
            {no: '05', title: 'Session 5', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-5-guide'}]},
            {no: '07', title: 'Session 7', files: [{kind: 'Study Guide', tag: 'guide', docId: 'pt-7-guide'}]}
        ]
    },
    {
        id: 'translation-of-islamic-texts',
        name: 'Translation of Islamic Texts',
        fa: 'ترجمهٔ متون اسلامی',
        glyph: '📜',
        color: '#34CBB8',
        semester: 'Semester 2',
        description:
            'Trilingual reference tools for Imam Ali’s Letter 53 to Malik al-Ashtar — the full covenant, passage by passage, and a 300-term specialist glossary, all searchable across Arabic, Persian and English.',
        chapters: [
            {
                no: '01',
                title: 'Letter 53 · Covenant to Malik al-Ashtar',
                files: [{kind: 'Trilingual reader', tag: 'guide', link: '/letter-53'}]
            },
            {
                no: '02',
                title: 'Specialist Vocabulary · 300 terms',
                files: [{kind: 'Trilingual glossary', tag: 'concise', link: '/vocabulary'}]
            }
        ]
    },
    {
        id: 'translation-theories',
        name: 'Translation Theories',
        fa: 'نظریه‌های ترجمه',
        glyph: '🧠',
        color: '#7C6CF0',
        semester: 'Semester 2',
        description:
            'The foundational theories of translation studies — from the discipline’s birth and the literal/free debate through equivalence, Skopos and functionalism, to Toury’s descriptive norms and Bassnett’s cultural turn. Each core reading in a comprehensive study guide and an exam cram.',
        chapters: [
            {
                no: '01',
                title: 'Week 1 · Munday Ch1 · Main Issues of Translation Studies',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-01-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-01-cram'}
                ],
                video: 'https://drive.google.com/file/d/1bjf--seiKKRx6gqL9W7q3Jq3n9AFX8Wc/preview'
            },
            {
                no: '02',
                title: 'Week 1 · Munday Ch2 · Translation Theory Before the 20th Century',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-02-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-02-cram'}
                ],
                video: 'https://drive.google.com/file/d/1mxO1yhTXVYiknQR3Ebo8jXrn_u8LZR_0/preview'
            },
            {
                no: '03',
                title: 'Week 2 · Pym Ch1 · What Is a Translation Theory?',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-03-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-03-cram'}
                ],
                video: 'https://drive.google.com/file/d/1slMCIwcs5ksYIF3gURdzoSpVW5r7j_IW/preview'
            },
            {
                no: '04',
                title: 'Week 4 · Nida Ch1 · Toward a Science of Translating',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-04-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-04-cram'}
                ],
                video: 'https://drive.google.com/file/d/1ltcAXBXHM98lnY3Nav9gvV6JEga8Vy1N/preview'
            },
            {
                no: '05',
                title: 'Week 4 · Nida Ch2 · The Western Tradition of Translation',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-05-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-05-cram'}
                ],
                video: 'https://drive.google.com/file/d/1eRR25LjLs_SreZiyNbtxM4-Lde2rmOg_/preview'
            },
            {
                no: '06',
                title: 'Week 4 · Munday Ch3 · Equivalence and Equivalent Effect',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-06-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-06-cram'}
                ],
                video: 'https://drive.google.com/file/d/1HqpgX04Up1KpItCBDwGSSvUcdr4Wcv7l/preview'
            },
            {
                no: '07',
                title: 'Week 5 · Nord Ch1 · Functionalism: A Historical Overview',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-07-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-07-cram'}
                ],
                video: 'https://drive.google.com/file/d/1-rELCpkf3q3LVvTv4doonIUvoRXB39Do/preview'
            },
            {
                no: '08',
                title: 'Week 5 · Nord Ch3 · Basic Aspects of Skopostheorie',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-08-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-08-cram'}
                ],
                video: 'https://drive.google.com/file/d/11uh6WiE_OKBfozgCAO7bZPc80yGBqAYX/preview'
            },
            {
                no: '09',
                title: 'Week 6 · Nord Ch4 · Functionalism in Translator Training',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-09-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-09-cram'}
                ],
                video: 'https://drive.google.com/file/d/1NjOTf7Fek7fCnhNGF-mpakA2eUy2ycT5/preview'
            },
            {
                no: '10',
                title: 'Week 6 · Nord Ch6 · Functionalist Approaches to Interpreting',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-10-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-10-cram'}
                ],
                video: 'https://drive.google.com/file/d/1vtyW_nAXBHSkSm6YNFee1dkwtHcGjYh2/preview'
            },
            {
                no: '11',
                title: 'Week 7 · Toury Ch1 · Translations as Facts of a Target Culture',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-11-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-11-cram'}
                ],
                video: 'https://drive.google.com/file/d/1fhAxV0hQg05IR0SrlsT2WVXOtjYWVSpq/preview'
            },
            {
                no: '12',
                title: 'Week 7 · Toury Ch2 · The Notion of ‘Problem’',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-12-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-12-cram'}
                ],
                video: 'https://drive.google.com/file/d/1ewGcywXuKJe0Q29RkJznAkb19U5Lt31D/preview'
            },
            {
                no: '13',
                title: 'Week 7 · Toury Ch3 · Translation as a Norm-Governed Activity',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-13-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-13-cram'}
                ]
            },
            {
                no: '14',
                title: 'Week 8 · Bassnett Ch1 · Central Issues',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-14-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-14-cram'}
                ]
            },
            {
                no: '15',
                title: 'Week 8 · Bassnett Ch2 · History of Translation Theory',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-15-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-15-cram'}
                ]
            },
            {
                no: '16',
                title: 'Week 8 · Bassnett Ch3 · Specific Problems of Literary Translation',
                files: [
                    {kind: 'Comprehensive', tag: 'guide', docId: 'tt-16-full'},
                    {kind: 'Exam Cram', tag: 'concise', docId: 'tt-16-cram'}
                ]
            }
        ]
    }
];

/** Look up a course by id. */
export function findCourse(id: string): Course | undefined {
    return COURSES.find((course) => course.id === id);
}

/** Total study files in a course. */
export function courseFileCount(course: Course): number {
    return course.chapters.reduce((total, ch) => total + ch.files.length, 0);
}
