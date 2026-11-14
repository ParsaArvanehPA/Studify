# Publishing Studify

Studify is an Angular 21 / Nx 22 app, prerendered to static HTML and hosted on **GitHub Pages**:
<https://parsaarvanehpa.github.io/Studify/>

Pages is configured as **"Deploy from a branch" → `main` / `docs/`**. Whatever is in `docs/` on `main` is the live
site, so publishing = build → copy the build into `docs/` → commit → push.

> `docs/` is generated output: a byte-for-byte mirror of `dist/apps/studify/browser/`. Never edit it by hand.
> (`.github/workflows/deploy.yml` is an optional manual alternative and is not what serves the site.)

## 1. Regenerate the catalogs (only if courses or content changed)

`tools/gen-catalog.mjs` is the source of truth for the course pages and the reader. It writes
`libs/shared/data-access/src/lib/content-catalog.ts` and `course-catalog.ts`; never edit those two by hand.

```bash
node tools/gen-catalog.mjs
npx prettier --write libs/shared/data-access/src/lib/content-catalog.ts libs/shared/data-access/src/lib/course-catalog.ts
```

The home page grid (semesters, course cards, hero stats) is hand-written in
`libs/shared/data-access/src/lib/home-catalog.ts`. Keep `HOME_STATS` in step with it.

## 2. Check before you publish

```bash
npx nx run-many -t lint -p feature data-access studify utils
npm run build          # nx build studify (production, prerendered) + tools/seo-postbuild.mjs
```

The build must finish with no budget warning (initial bundle limit 500 kB) and print `Prerendered N static routes`.
Then serve the real build under its `/Studify/` base path and click through it:

```bash
mkdir -p /tmp/studify-preview && ln -sfn "$PWD/dist/apps/studify/browser" /tmp/studify-preview/Studify
python3 -m http.server 4719 --directory /tmp/studify-preview
# open http://127.0.0.1:4719/Studify/
```

Check the new page loaded directly _and_ reached by clicking from Home, on desktop and phone width, with no console
errors.

## 3. Publish

```bash
rsync -a --delete dist/apps/studify/browser/ docs/
git add -A docs
git commit -m "build: copy docs for GitHub Pages"
git push origin main
```

Commit the source change first (`feat(studify): …`) and the `docs/` copy as its own `build:` commit, matching the
history. Commit messages are checked by commitlint (`commitlint.config.js`): type and scope must come from its lists.

GitHub Pages rebuilds within a minute or two. Watch it with:

```bash
gh api repos/ParsaArvanehPA/Studify/pages/builds/latest --jq '.status'   # → built
```

The site is a PWA (`apps/studify/public/sw.js`): pages are network-first, so a normal reload shows the new version.
A page opened once keeps working offline.

## Adding a cheat sheet (reference-tool page)

Tool pages like Letter 53, Vocabulary and the Poetry Translation cheat sheet share the `ref-*` styles in
`libs/shared/ui/styles/studify-ds.scss` (search bar, chips, cards, moods). To add one:

1. **Data**: a JSON file in `apps/studify/src/assets/data/`, a model plus a small service in
   `libs/shared/data-access/src/lib/` that loads it through `ContentLoaderService`. That loader reads from disk while
   prerendering and over HTTP in the browser, which keeps large text out of the main bundle.
2. **Page**: a standalone component in `libs/shared/feature/src/lib/<name>/`, exported from
   `libs/shared/feature/src/index.ts`. Copy `letter53` or `poetry` as the starting point.
3. **Routes**: add the path to `apps/studify/src/app/app.routes.ts` _and_ `app.routes.server.ts` (prerender).
4. **Catalog**: add a `kind: 'tool'` course (or a tool chapter) in `tools/gen-catalog.mjs`, regenerate, and add the
   card to `home-catalog.ts`.
5. Check and publish as above.

### Poetry Translation (ترجمهٔ شعر): Semester 3

- Page: `/poetry-translation` (`libs/shared/feature/src/lib/poetry/`)
- Data: `apps/studify/src/assets/data/poetry-translation.json`:
  `{sessions: [{no, fa}], poems: [{id, session, fa, en, ref?, couplets: [[{fa, en}, {fa, en}], …]}]}`.
  Each couplet (بیت) is two hemistichs (مصراع), each with its English rendering; `ref` is the number printed beside
  the title in the course pack (e.g. 31).
- Search covers both languages and the poem titles. It ignores diacritics, Arabic/Persian letter variants (ي/ی, ك/ک),
  half-spaces and spacing (`شعر های` = `شعرهای`), and apostrophes (`hearts` = `heart's`).
- For the final exam: append sessions and poems to the JSON (keep ids unique and in order), and update the hero copy
  ("sessions 1–6"), the course description and chapter title in `gen-catalog.mjs`, and the card meta in
  `home-catalog.ts`.

## Known issues (pre-existing, not caused by publishing)

- `nx lint feature` reports 2 accessibility errors in `home.component.html` (the header search `div` has a click
  handler but no key handler or focusability).
- `nx test studify` fails: `apps/studify/src/app/app.spec.ts` imports `./nx-welcome`, which was removed in the
  Angular rebuild.
