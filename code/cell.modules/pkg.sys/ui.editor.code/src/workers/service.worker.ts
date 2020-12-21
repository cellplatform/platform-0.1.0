const ctx: ServiceWorker = self as any;

/**
 * Refs:
 *    - https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent#Examples
 *    - https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker
 */

ctx.addEventListener('fetch', async (event: any) => {
  const request = event.request;
  const { method, url } = request;

  if (method !== 'GET') return;
  if (!isLocal(url) && isJavascript(url)) return; // NB: Do not attempt to cache cross-domain JS (not allowed by CORS).
  if (!isStaticAsset(url)) return;

  const cache = await caches.open('CodeEditor');
  let response = await cache.match(request);

  if (response) {
    console.log('from cache', request.url);
  }

  if (response) return response; // Already cached.

  // Fetch and cache.
  response = await fetch(request);
  await cache.put(request, response);
  return response;
});

/**
 * [Helpers]
 */
function isLocal(url: string) {
  url = (url || '').trim();
  return url.startsWith(location.origin);
}

function stripSuffix(url: string) {
  url = (url || '').trim();
  url = url.split('#')[0];
  url = url.split('?')[0];
  return url;
}

function isJavascript(url: string) {
  return stripSuffix(url).endsWith('.js');
}

function isStaticAsset(url: string) {
  return url.includes('/static/vs/') || url.includes('/static/types/');
}
