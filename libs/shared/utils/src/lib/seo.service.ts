import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

/** Site identity + canonical-URL config (GitHub Pages deployment). */
export const SITE = {
    origin: 'https://parsaarvanehpa.github.io',
    base: '/Studify',
    name: 'Studify',
    tagline: 'University study materials, beautifully unified'
} as const;

/** Build an absolute canonical URL for an in-app route path. */
export function absoluteUrl(path: string): string {
    const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
    return `${SITE.origin}${SITE.base}/${clean ? `${clean}/` : ''}`;
}

/** Page-level metadata the SEO service applies. */
export interface SeoMeta {
    /** Page title without the site suffix. */
    title: string;
    description: string;
    /** In-app route path, e.g. "reader/cw-1-guide". */
    path: string;
    type?: 'website' | 'article';
    /** JSON-LD structured-data object. */
    jsonLd?: Record<string, unknown>;
}

/**
 * Centralizes document metadata (title, description, canonical, Open Graph,
 * Twitter, JSON-LD). Called per page; runs during prerender so static pages ship
 * with correct SEO tags for non-JS crawlers.
 */
@Injectable({providedIn: 'root'})
export class SeoService {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly document = inject(DOCUMENT);

    apply(seo: SeoMeta): void {
        const fullTitle = `${seo.title} · ${SITE.name}`;
        const url = absoluteUrl(seo.path);
        const type = seo.type ?? 'article';

        this.title.setTitle(fullTitle);
        this.meta.updateTag({name: 'description', content: seo.description});
        this.meta.updateTag({property: 'og:site_name', content: SITE.name});
        this.meta.updateTag({property: 'og:type', content: type});
        this.meta.updateTag({property: 'og:title', content: fullTitle});
        this.meta.updateTag({property: 'og:description', content: seo.description});
        this.meta.updateTag({property: 'og:url', content: url});
        this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
        this.meta.updateTag({name: 'twitter:title', content: fullTitle});
        this.meta.updateTag({name: 'twitter:description', content: seo.description});

        this.setCanonical(url);
        this.setJsonLd(seo.jsonLd);
    }

    private setCanonical(url: string): void {
        const head = this.document.head;
        let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!link) {
            link = this.document.createElement('link');
            link.setAttribute('rel', 'canonical');
            head.appendChild(link);
        }
        link.setAttribute('href', url);
    }

    private setJsonLd(data: Record<string, unknown> | undefined): void {
        const id = 'studify-jsonld';
        const existing = this.document.getElementById(id);
        if (existing) {
            existing.remove();
        }
        if (!data) {
            return;
        }
        const script = this.document.createElement('script');
        script.id = id;
        script.setAttribute('type', 'application/ld+json');
        script.textContent = JSON.stringify(data);
        this.document.head.appendChild(script);
    }
}
