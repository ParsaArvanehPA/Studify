import {
    SITE_NAME,
    SITE_TAGLINE,
    DEFAULT_DESCRIPTION,
    DEFAULT_LOCALE,
    DEFAULT_OG_IMAGE,
    absoluteUrl,
    absoluteAsset
} from '../seo/siteConfig';

interface SeoProps {
    /** Page-specific title. Rendered as "<title> · Studify" unless `title` is empty (home). */
    title?: string;
    description?: string;
    /** In-app route path for the canonical URL, e.g. "/semester/semester-1". */
    path: string;
    /** Asset path (under base) for the social image. Defaults to the site OG image. */
    image?: string;
    /** Open Graph type. "website" for index-like pages, "article" for content. */
    type?: 'website' | 'article';
    /** JSON-LD structured data object(s). */
    jsonLd?: object | object[];
    /** Discourage indexing (e.g. thin/utility pages). */
    noindex?: boolean;
}

/**
 * Renders document metadata. React 19 hoists <title>, <meta>, and <link>
 * into <head> automatically, so this can live anywhere in the tree.
 */
export function Seo({
    title,
    description = DEFAULT_DESCRIPTION,
    path,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    jsonLd,
    noindex = false
}: SeoProps) {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
    const canonical = absoluteUrl(path);
    const imageUrl = absoluteAsset(image);
    const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

    return (
        <>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />
            {noindex && <meta name="robots" content="noindex,follow" />}

            {/* Open Graph */}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:locale" content={DEFAULT_LOCALE} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {blocks.map((block, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
                />
            ))}
        </>
    );
}
