const CACHE = 'klika-erp-v2';
const SHELL = [
  '/',
  '/Klika ERP.html',
  '/styles/tokens.css',
  '/styles/responsive.css',
  '/data/mock.js',
  '/data/api.js',
  '/data/resources.js',
  '/components/icons.jsx',
  '/components/store.jsx',
  '/components/rhStore.jsx',
  '/components/AbsenceModal.jsx',
  '/components/Logo.jsx',
  '/components/Shell.jsx',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Solicitudes API: siempre red
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/storage/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // CDN externo (fonts, unpkg, etc.): red con fallback a cache
  if (url.origin !== location.origin) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Archivos propios: cache primero, luego red; actualiza cache en background
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const netFetch = fetch(e.request).then(res => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => null);
      return cached || await netFetch || new Response('Sin conexión', { status: 503 });
    })
  );
});
