/**
 * Post-build SEO emitter: derives sitemap.xml + robots.txt from the actually
 * prerendered routes, and writes a 404.html SPA fallback for GitHub Pages.
 * Mirrors the generate-seo step from the previous React build.
 */
import {copyFileSync, existsSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const DIST = 'dist/apps/studify/browser';
const ORIGIN = 'https://parsaarvanehpa.github.io';
const BASE = '/Studify';

if (!existsSync(join(DIST, 'index.html'))) {
    console.error(`seo-postbuild: ${DIST}/index.html not found — skipping`);
    process.exit(0);
}

/** Collect every route directory that contains a prerendered index.html. */
function routes(dir, prefix = '') {
    const found = existsSync(join(dir, 'index.html')) ? [prefix] : [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (entry !== 'assets' && statSync(full).isDirectory()) {
            found.push(...routes(full, prefix ? `${prefix}/${entry}` : entry));
        }
    }
    return found;
}

const paths = [...new Set(routes(DIST))].sort();
const today = new Date().toISOString().slice(0, 10);

const urls = paths
    .map((p) => {
        const clean = p.replace(/^\/+|\/+$/g, '');
        const loc = `${ORIGIN}${BASE}/${clean ? `${clean}/` : ''}`;
        const priority = clean === '' ? '1.0' : '0.8';
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}${BASE}/sitemap.xml\n`);
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'));

console.log(`seo-postbuild: ${paths.length} routes → sitemap.xml, robots.txt, 404.html`);
