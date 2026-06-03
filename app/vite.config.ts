import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, join, dirname } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { studyData } from './src/data/structure'

// Deployed origin (GitHub Pages lowercases the username in the host).
const SITE_ORIGIN = 'https://parsaarvanehpa.github.io'
const SITE_NAME = 'Studify'
const SITE_TAGLINE = 'University Study Materials'
const DEFAULT_DESCRIPTION =
  'Studify organizes university lecture notes, study guides, and exam-prep materials into a clean Semester → Course → Session library.'
const DEFAULT_OG_IMAGE = 'og-default.svg'
const DEFAULT_LOCALE = 'en_US'

// Plugin to serve study files (HTML) without SPA fallback
function serveStudyFiles(): Plugin {
  return {
    name: 'serve-study-files',
    configureServer(server) {
      // Add middleware BEFORE Vite's internal middlewares (don't return a function)
      server.middlewares.use((req, res, next) => {
        // Check if request is for a Semester file
        if (req.url && req.url.includes('/Semester') && req.url.endsWith('.html')) {
          const urlPath = decodeURIComponent(req.url.replace('/Studify', ''))
          const filePath = resolve(__dirname, 'public', urlPath.slice(1))

          if (existsSync(filePath)) {
            const content = readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(content)
            return
          }
        }
        next()
      })
    },
  }
}

// ---- build-time SEO generation (browser-free) ---------------------------------

interface RouteMeta {
  path: string // in-app path, e.g. '/semester/semester-1' ('' === home)
  title: string // page title (without the site-name suffix); empty for home
  description: string
  type: 'website' | 'article'
  jsonLd: object[]
}

const escAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// JSON-LD inline scripts must not contain a literal "</script>".
const escJson = (o: object) => JSON.stringify(o).replace(/</g, '\\u003c')

function buildRoutes(base: string): RouteMeta[] {
  const baseNoSlash = base.replace(/\/$/, '') // '/Studify'
  // Trailing slash matches the non-redirecting GitHub Pages directory URL.
  const abs = (p: string) => {
    const clean = p.replace(/^\/+/, '').replace(/\/+$/, '')
    return clean ? `${SITE_ORIGIN}${baseNoSlash}/${clean}/` : `${SITE_ORIGIN}${baseNoSlash}/`
  }

  const routes: RouteMeta[] = []

  // Home
  routes.push({
    path: '',
    title: '',
    description: DEFAULT_DESCRIPTION,
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: abs('/'),
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
      },
    ],
  })

  // Standalone tool pages
  routes.push({
    path: '/exam-materials',
    title: 'Quran Exam Materials',
    description:
      'Searchable Quran exam-prep tool with Arabic text normalization, fault-tolerant search, and copy/translate features.',
    type: 'website',
    jsonLd: [],
  })
  routes.push({
    path: '/letter-53',
    title: 'نامه ۵۳ نهج البلاغه — Letter 53',
    description:
      'Searchable Arabic-Persian study tool for Letter 53 of Nahj al-Balagha, with fault-tolerant search and section navigation.',
    type: 'article',
    jsonLd: [],
  })
  routes.push({
    path: '/letter-53-vocabulary',
    title: 'واژگان تخصصی نامه ۵۳ — Vocabulary',
    description: 'Specialized vocabulary cheat sheet for Letter 53 of Nahj al-Balagha with searchable Arabic-Persian glosses.',
    type: 'article',
    jsonLd: [],
  })

  // Data-driven semester + course pages
  for (const semester of studyData) {
    const semPath = `/semester/${semester.id}`
    const totalFiles = semester.courses.reduce(
      (acc, c) => acc + c.sessions.reduce((a, s) => a + s.files.length, 0),
      0,
    )
    routes.push({
      path: semPath,
      title: semester.name,
      description: `${semester.name}: ${semester.courses.length} courses and ${totalFiles} study files on ${SITE_NAME}.`,
      type: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
            { '@type': 'ListItem', position: 2, name: semester.name },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: semester.name,
          url: abs(semPath),
          hasPart: semester.courses.map((c) => ({
            '@type': 'Course',
            name: c.name,
            url: abs(`${semPath}/course/${c.id}`),
          })),
        },
      ],
    })

    for (const course of semester.courses) {
      // Courses with a custom `link` redirect elsewhere (e.g. /letter-53) — skip their route.
      if (course.link) continue
      const coursePath = `${semPath}/course/${course.id}`
      const cFiles = course.sessions.reduce((a, s) => a + s.files.length, 0)
      const description =
        course.description ||
        `${course.name}: ${course.sessions.length} sessions and ${cFiles} study files on ${SITE_NAME}.`
      routes.push({
        path: coursePath,
        title: course.name,
        description,
        type: 'article',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
              { '@type': 'ListItem', position: 2, name: semester.name, item: abs(semPath) },
              { '@type': 'ListItem', position: 3, name: course.name },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.name,
            description,
            url: abs(coursePath),
            provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
          },
        ],
      })
    }
  }

  return routes
}

function headBlock(route: RouteMeta, base: string): string {
  const baseNoSlash = base.replace(/\/$/, '')
  const clean = route.path.replace(/^\/+/, '').replace(/\/+$/, '')
  const canonical = clean ? `${SITE_ORIGIN}${baseNoSlash}/${clean}/` : `${SITE_ORIGIN}${baseNoSlash}/`
  const image = `${SITE_ORIGIN}${baseNoSlash}/${DEFAULT_OG_IMAGE}`
  const fullTitle = route.title ? `${route.title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`
  const d = escAttr(route.description)
  const t = escAttr(fullTitle)

  const lines = [
    `<title>${escAttr(fullTitle)}</title>`,
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${route.type}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:locale" content="${DEFAULT_LOCALE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    ...route.jsonLd.map((b) => `<script type="application/ld+json">${escJson(b)}</script>`),
  ]
  return lines.join('\n    ')
}

/** Inject route-specific metadata into the built index.html so non-JS crawlers and
 *  social scrapers see correct tags. Also emits sitemap.xml, robots.txt and 404.html. */
function generateSeo(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'generate-seo',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    closeBundle() {
      const outDir = config.build.outDir
      const base = config.base || '/'
      const baseNoSlash = base.replace(/\/$/, '')
      const indexPath = resolve(outDir, 'index.html')
      if (!existsSync(indexPath)) {
        this.warn(`generate-seo: ${indexPath} not found; skipping`)
        return
      }

      // Template with the default <title>/<meta description> stripped so we can inject per-route.
      const template = readFileSync(indexPath, 'utf-8')
        .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
        .replace(/<meta\s+name="description"[^>]*>\s*/i, '')

      const routes = buildRoutes(base)
      for (const route of routes) {
        const html = template.replace(/<\/head>/i, `  ${headBlock(route, base)}\n  </head>`)
        const clean = route.path.replace(/^\/+/, '')
        const target = clean ? join(outDir, clean, 'index.html') : indexPath
        mkdirSync(dirname(target), { recursive: true })
        writeFileSync(target, html)
      }

      // 404 fallback: home shell so unknown deep links still boot the SPA.
      writeFileSync(join(outDir, '404.html'), readFileSync(indexPath, 'utf-8'))

      // robots.txt
      writeFileSync(
        join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nSitemap: ${SITE_ORIGIN}${baseNoSlash}/sitemap.xml\n`,
      )

      // sitemap.xml
      const today = new Date().toISOString().slice(0, 10)
      const urls = routes
        .map((r) => {
          const clean = r.path.replace(/^\/+/, '').replace(/\/+$/, '')
          const loc = clean ? `${SITE_ORIGIN}${baseNoSlash}/${clean}/` : `${SITE_ORIGIN}${baseNoSlash}/`
          const priority = r.path === '' ? '1.0' : r.path.includes('/course/') ? '0.7' : '0.8'
          return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
        })
        .join('\n')
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )

      this.info(`generate-seo: prerendered ${routes.length} routes + sitemap/robots/404`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [serveStudyFiles(), react(), tailwindcss(), generateSeo()],
  base: '/Studify/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
