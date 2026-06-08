/*
 * Studify service worker — base-aware (works under GitHub Pages' /Studify/ scope
 * and at / in dev, since everything is resolved against registration.scope).
 *
 * Strategy:
 *   - navigations  → network-first (content stays fresh; offline falls back to
 *     the cached page, then to the app shell).
 *   - static files → stale-while-revalidate (instant, refreshed in background).
 * Bump VERSION to force a clean cache rotation on the next visit.
 */
const VERSION = 'studify-v2';
const SCOPE = self.registration.scope;
const shellUrl = (path) => new URL(path, SCOPE).href;

const SHELL = [
    '',
    'index.html',
    'manifest.webmanifest',
    'favicon.svg',
    'icons/favicon-32.png',
    'icons/favicon-16.png',
    'apple-touch-icon.png',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png'
].map(shellUrl);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(VERSION)
            .then((cache) => cache.addAll(SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') {
        return;
    }
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(VERSION).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match(shellUrl('index.html'))))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const copy = response.clone();
                        caches.open(VERSION).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
