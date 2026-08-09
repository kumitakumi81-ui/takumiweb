const CACHE_NAME = "takumi-staff-ai-v8";
const APP_SHELL = [
  "./staff-ai.html",
  "./staff-ai.webmanifest",
  "./favicon.svg",
  "./assets/site.css",
  "./assets/ai-studio.css?v=8",
  "./assets/ai-studio-core.js?v=8",
  "./assets/ai-studio.js?v=8"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).catch(() => caches.match("./staff-ai.html"))
    )
  );
});
