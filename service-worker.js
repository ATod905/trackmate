/*
 TrackMate © 2026 Aleks Todorovic
 All rights reserved.

 This software is the intellectual property of Aleks Todorovic.
 Unauthorised copying, modification, distribution, or use of this
 software, in whole or in part, is strictly prohibited.

 For permitted use or licensing enquiries, contact the author.
*/

/* TrackMate service worker (v5.7.25)
   - Caches the app shell for offline use
   - Network-first for page navigations so installed PWAs discover new releases
   - Cache-first for static same-origin assets
*/

// TrackMate PWA cache version (bump this whenever you deploy changes)
const CACHE_VERSION = "v5-7-25";
const CACHE_NAME = `trackmate-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./assets/logo-trackmate.png",
  "./assets/TrackMate_logo_icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only same-origin to avoid caching third-party requests
  if (url.origin !== self.location.origin) return;

  // Navigations must check the network first. Otherwise an older service worker
  // can keep returning its cached index.html and prevent the app from ever
  // discovering a newly deployed TrackMate version. Offline still falls back
  // to the cached app shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", resClone));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Static same-origin assets remain cache-first for fast/offline use.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        if (res && res.ok) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      });
    })
  );
});
