import {RenderMode, ServerRoute} from '@angular/ssr';

import {CONTENT_CATALOG, COURSES} from '@studify/shared/data-access';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'reader/:docId',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => CONTENT_CATALOG.map((doc) => ({docId: doc.id}))
    },
    {
        path: 'course/:courseId',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => COURSES.map((course) => ({courseId: course.id}))
    },
    {
        path: '',
        renderMode: RenderMode.Prerender
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender
    }
];
