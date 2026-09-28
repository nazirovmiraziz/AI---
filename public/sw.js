self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("ssai-app-v2").then(function (cache) {
      return cache.addAll([
        "/app-icon.svg",
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/apple-touch-icon.png",
      ]);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== "ssai-app-v2";
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/api/") === 0) return;
  if (url.pathname.indexOf("/_next/") === 0) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("/");
        });
      })
    );
    return;
  }

  if (/\.(png|svg|webp|ico)$/i.test(url.pathname) || url.pathname.indexOf("/icons/") === 0) {
    event.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (!res || res.status !== 200) return res;
          var copy = res.clone();
          caches.open("ssai-app-v2").then(function (cache) {
            cache.put(req, copy);
          });
          return res;
        });
      })
    );
  }
});
