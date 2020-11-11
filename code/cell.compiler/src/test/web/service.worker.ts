console.log('service worker!!');
console.log('self', self);

self.addEventListener('install', function (event: any) {
  console.log('install event:', event);
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

self.addEventListener('fetch', async function (event) {
  console.log('fetch event:', event);

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
