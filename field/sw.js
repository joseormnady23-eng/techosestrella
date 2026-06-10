// Klika Campo · Service Worker — cachea el shell de la app para uso offline.
const CACHE = "klika-campo-v1";
const SHELL = [
  "./index.html",
  "./css/app.css",
  "./js/api.js",
  "./js/app.js",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Las llamadas al API nunca se cachean (siempre red; el offline lo maneja la cola en la app).
  if (url.pathname.includes("/api/") || e.request.method !== "GET") return;

  // App shell: cache-first con respaldo a red.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
