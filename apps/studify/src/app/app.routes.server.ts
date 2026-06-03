import {RenderMode, ServerRoute} from '@angular/ssr';

import {CONTENT_CATALOG} from '@studify/shared/data-access';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'reader/:docId',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => CONTENT_CATALOG.map((doc) => ({docId: doc.id}))
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
