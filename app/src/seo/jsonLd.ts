// JSON-LD structured data builders for rich results.
import { SITE_NAME, SITE_ORIGIN, absoluteUrl } from './siteConfig';
import type { Course, Semester } from '../data/structure';

/** WebSite node with SearchAction-free identity for the home page. */
export function websiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: absoluteUrl('/'),
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_ORIGIN
        }
    };
}

/** BreadcrumbList from ordered [name, path] pairs (path optional for the last/current item). */
export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            ...(item.path ? { item: absoluteUrl(item.path) } : {})
        }))
    };
}

/** Course node describing a single course as an educational offering. */
export function courseJsonLd(course: Course, path: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: course.name,
        description: course.description || `${course.name} study materials on ${SITE_NAME}.`,
        url: absoluteUrl(path),
        provider: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_ORIGIN
        },
        numberOfCredits: undefined,
        hasCourseInstance: course.sessions.length
            ? {
                  '@type': 'CourseInstance',
                  courseMode: 'online',
                  name: `${course.name} — ${course.sessions.length} sessions`
              }
            : undefined
    };
}

/** CollectionPage listing the courses within a semester. */
export function semesterCollectionJsonLd(semester: Semester, path: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: semester.name,
        url: absoluteUrl(path),
        hasPart: semester.courses.map((c) => ({
            '@type': 'Course',
            name: c.name,
            url: absoluteUrl(`/semester/${semester.id}/course/${c.id}`)
        }))
    };
}
