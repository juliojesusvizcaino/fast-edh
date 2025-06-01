/// <reference types="@sveltejs/kit" />
import { build, files, version, prerendered } from '$service-worker';

// Create a unique cache name for this version of the app
const CACHE = `cache-${version}`;

// Base path from your svelte.config.js, ensure it's consistent
const BASE_PATH = '/fast-edh'; // Or dynamically get if possible, but hardcoding is safer here.

// List of assets to cache
// `build` includes project files built by Vite.
// `files` includes files in your `static` directory.
// `prerendered` includes paths to prerendered pages.
// These paths from $service-worker should already be correctly prefixed by SvelteKit if paths.base is set.
const ASSETS_TO_CACHE = [
    ...build,
    ...files,
    ...prerendered,
    `${BASE_PATH}/`, // Explicitly cache the base start URL
    // Add other important root-relative paths if any, prefixed with BASE_PATH
    // e.g., `${BASE_PATH}/offline.html` if you have one
];

self.addEventListener('install', (event) => {
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);
        // Filter out any undefined or null paths that might sneak in from prerendered
        await cache.addAll(ASSETS_TO_CACHE.filter(path => path));
    }
    event.waitUntil(addFilesToCache());
    self.skipWaiting(); // Activate new service worker immediately
});

self.addEventListener('activate', (event) => {
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) {
                await caches.delete(key);
            }
        }
    }
    event.waitUntil(deleteOldCaches());
    self.clients.claim(); // Take control of clients immediately
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE);

        // Check if the request is for an asset we know should be cached
        // The paths in ASSETS_TO_CACHE should be absolute from the domain root (e.g., /fast-edh/main.js)
        const isAsset = ASSETS_TO_CACHE.includes(url.pathname);

        if (isAsset) {
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }
        }

        try {
            const response = await fetch(event.request);
            // Cache successful GET responses that are not opaque (cross-origin without CORS)
            if (response.status === 200 && response.type === 'basic' && (url.protocol === 'http:' || url.protocol === 'https:')) {
                // It's a good practice to clone the response before caching it
                cache.put(event.request, response.clone());
            }
            return response;
        } catch (error) {
            // Network request failed, try to serve from cache
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            // Fallback for navigation requests to the main app shell or an offline page
            if (event.request.mode === 'navigate' || url.pathname === `${BASE_PATH}/`) {
                const offlinePagePath = `${BASE_PATH}/offline.html`; // Ensure this is in ASSETS_TO_CACHE
                const cachedOfflinePage = await cache.match(offlinePagePath);
                if (cachedOfflinePage) return cachedOfflinePage;

                // Fallback to the main start URL if offline page isn't found
                const mainPage = await cache.match(`${BASE_PATH}/`);
                if (mainPage) return mainPage;
            }
        }
        // Generic fallback
        return new Response('Network error or resource not found in cache.', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
    event.respondWith(respond());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
