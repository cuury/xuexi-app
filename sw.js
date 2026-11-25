// Offline support. The page itself is checked for updates on every open (network first);
// big data files are served from the saved copy and refreshed whenever a new version is published.
const CACHE = "xuexi-2026.11.24-1848";
const CORE = ["./", "./index.html", "./hanzi-writer.min.js", "./strokes.json", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./fonts/andika-latin-400-normal.woff2", "./fonts/andika-latin-700-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const put = (req, res) => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; };
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    const isPage = e.request.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname);
    if (isPage) {
      // page: newest version when online, saved copy when offline
      e.respondWith(fetch(e.request).then(r => put(e.request, r)).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
    } else {
      // data files (strokes, pinyin, icons): saved copy first; a new version clears the cache
      e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => r.ok ? put(e.request, r) : r)));
    }
    return;
  }
});
