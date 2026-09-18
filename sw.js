const CACHE = "etf-v6";
const PRECACHE = [
  "/endtimesfaith/",
  "/endtimesfaith/index.html",
  "/endtimesfaith/manifest.webmanifest",
  "/endtimesfaith/icons/icon-192.png",
  "/endtimesfaith/icons/icon-512.png",
  "/endtimesfaith/icons/icon-maskable-512.png",
  "/endtimesfaith/icons/apple-touch-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put("/endtimesfaith/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/endtimesfaith/index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networked = fetch(req)
        .then((res) => {
          if (res.ok && url.pathname.startsWith("/endtimesfaith/")) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networked;
    }),
  );
});
