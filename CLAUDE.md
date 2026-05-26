# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Studify

Studify is a static study-material browser for university courses. It organizes lecture notes, study guides, and exam-prep files (HTML/PDF) into a Semester > Course > Session hierarchy. There is no backend or database — all content metadata is defined in `app/src/data/structure.ts` and the actual study files live under `Semester 1/` as static HTML/PDF.

Deployed to **GitHub Pages** from the `docs/` folder with base path `/Studify/`.

## Commands

All commands run from the `app/` directory:

```bash
npm run dev       # Vite dev server (http://localhost:5173/Studify/)
npm run build     # TypeScript check + Vite build → outputs to ../docs
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

**React 19 + TypeScript + Vite + Tailwind CSS 4**. Uses HashRouter for GitHub Pages compatibility.

### Data flow

Content is entirely driven by the `studyData` array in `app/src/data/structure.ts`. The type hierarchy is:

```
Semester[] → Course[] → Session[] → StudyFile { name, path, type: 'html' | 'pdf' }
```

`StudyFile.path` is relative to the repo root (e.g. `Semester 1/Creative Writing/chapter-1-summary.html`). During dev, a custom Vite plugin (`serveStudyFiles` in `vite.config.ts`) intercepts requests to `/Semester` paths and serves the raw HTML files, bypassing SPA fallback.

### Routing

```
/                                         → HomePage (semester grid + stats)
/semester/:semesterId                     → SemesterPage (course grid)
/semester/:semesterId/course/:courseId     → CoursePage (sessions + file viewer)
/exam-materials                           → QuranExamPage (standalone exam tool)
```

### Key files

- `app/src/data/structure.ts` — single source of truth for all content; adding a course/session means editing this file
- `app/vite.config.ts` — custom `serveStudyFiles` plugin, base path `/Studify/`, build output to `../docs`, path alias `@` → `src`
- `app/src/components/DocumentViewer.tsx` — full-screen modal that renders study files in an iframe
- `app/src/pages/QuranExamPage.tsx` — large standalone page with Arabic text normalization, fuzzy search (Levenshtein), and copy/translate features

### Styling

Dark theme with glass-morphism. Tailwind 4 with custom theme tokens defined in `app/src/index.css` (`--color-primary-*`, `--color-accent-*`). Framer Motion for page transitions and interactions.

## Code style

Prettier config (`.prettierrc.js`): 120 char width, 4-space indent, single quotes, no trailing commas, no bracket spacing.
