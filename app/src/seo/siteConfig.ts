// Central SEO configuration. Single source of truth for canonical URLs,
// site identity, and default social metadata.

// Origin of the deployed GitHub Pages site (no trailing slash).
export const SITE_ORIGIN = 'https://parsaarvanehpa.github.io';

// Base path the app is served under (matches Vite `base` and the router basename).
// import.meta.env.BASE_URL is '/Studify/' in this project.
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, ''); // '/Studify'

export const SITE_NAME = 'Studify';
export const SITE_TAGLINE = 'University Study Materials';
export const DEFAULT_DESCRIPTION =
    'Studify organizes university lecture notes, study guides, and exam-prep materials into a clean Semester → Course → Session library.';
export const DEFAULT_LOCALE = 'en_US';

// Default social share image (relative to BASE_PATH). For best support across
// Twitter/Facebook, replace with a 1200×630 PNG/JPG; this SVG is a lightweight placeholder.
export const DEFAULT_OG_IMAGE = 'og-default.svg';

/**
 * Build an absolute canonical URL for an in-app route path (e.g. "/semester/semester-1").
 * Uses a trailing slash to match the non-redirecting GitHub Pages directory URL
 * (Pages 301-redirects "/foo" → "/foo/"), avoiding canonical-vs-redirect mismatches.
 */
export function absoluteUrl(routePath: string): string {
    const clean = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
    const path = clean ? `${BASE_PATH}/${clean}/` : `${BASE_PATH}/`;
    return `${SITE_ORIGIN}${path}`;
}

/** Build an absolute URL for an asset stored under the base path (e.g. "og-default.png"). */
export function absoluteAsset(assetPath: string): string {
    const clean = assetPath.replace(/^\/+/, '');
    return `${SITE_ORIGIN}${BASE_PATH}/${clean}`;
}
