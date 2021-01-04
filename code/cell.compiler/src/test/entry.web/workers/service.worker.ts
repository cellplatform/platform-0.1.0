const ctx: ServiceWorker = self as any;

ctx.addEventListener('install', function (e) {
  console.log('🚀 service-worker installed:', e);

  // event.waitUntil(
  //   caches.open(cacheName).then(function(cache) {
  //     return cache.addAll(
  //       [
  //         '/css/bootstrap.css',
  //         '/css/main.css',
  //         '/js/bootstrap.min.js',
  //         '/js/jquery.min.js',
  //         '/offline.html'
  //       ]
  //     );
  //   })
  // );
});

self.addEventListener('fetch', async function (e) {
  // console.log('fetch event:', e);
  // event.respondWith(
  //   caches.open('mysite-dynamic').then(function(cache) {
  //     return cache.match(event.request).then(function (response) {
  //       return response || fetch(event.request).then(function(response) {
  //         cache.put(event.request, response.clone());
  //         return response;
  //       });
  //     });
  //   })
  // );
});
