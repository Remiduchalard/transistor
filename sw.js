const CACHE_NAME = 'transistor-clicker-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './proliferation.html',
    './css/style.css',
    './css/desktop.css',
    './css/mobile.css',
    './css/machines.css',
    './css/animations.css',
    './js/events.js',
    './js/i18n.js',
    './js/config.js',
    './js/equivalences.js',
    './js/machines.js',
    './js/upgrades.js',
    './js/game.js',
    './js/bot.js',
    './js/ui/core.js',
    './js/ui/stats.js',
    './js/ui/shop.js',
    './js/ui/notifications.js',
    './js/ui/modals.js',
    './js/ui/controls.js',
    './js/main.js',
    './js/desktop.js',
    './js/mobile.js',
    './js/lang/fr.js',
    './js/lang/en.js',
    './favicon.svg'
];

self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it's a stream
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheAllowlist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});