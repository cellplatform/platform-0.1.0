import { parse as parseUrl } from 'url';

import { micro } from '../common';
import { Manifest } from '../manifest';

const ttl = 5000;
const CACHE = { 'Cache-Control': `s-maxage=${ttl / 1000}, stale-while-revalidate` };
// const CACHE = { 'Cache-Control': `no-cache` };

/**
 * Router
 */
export function init(args: { router: micro.Router; manifestUrl: string; baseUrl: string }) {
  const { router, manifestUrl, baseUrl } = args;

  const manifestFromCacheOrS3 = (args: { force?: boolean } = {}) => {
    const { force } = args;
    return Manifest.get({ manifestUrl, baseUrl, force, loadBundleManifest: true, ttl });
  };

  /**
   * [GET] manifest/summary.
   */
  router.get('/.manifest/summary', async req => {
    const manifest = await manifestFromCacheOrS3({ force: true });
    const sites = manifest.sites.reduce((acc, site) => {
      const { name, version, size } = site;
      const domain = site.domain.join(', ');
      return { ...acc, [name]: { version, size, domain } };
    }, {});
    return {
      status: 200,
      headers: CACHE,
      data: { sites },
    };
  });

  /**
   * [GET] manifest.
   */
  router.get('/.manifest', async req => {
    const manifest = await manifestFromCacheOrS3({ force: true });
    return {
      status: 200,
      headers: CACHE,
      data: manifest.toObject(),
    };
  });

  /**
   * [GET] resource.
   */
  router.get('*', async req => {
    // Load the manifest.
    const manifest = await manifestFromCacheOrS3();
    if (!manifest.ok) {
      const status = manifest.status;
      const message = 'Manifest could not be loaded.';
      return { status, data: { status, message } };
    }

    // Retrieve the site definition.
    const hostname = (req.headers.host || '').split(':')[0];
    const site = manifest.site.byHost(hostname);
    if (!site) {
      const status = 404;
      const message = `A site definition for the domain '${hostname}' does not exist in the manifest.`;
      return { status, data: { status, message } };
    }

    // Check if there is a direct route match and if found SSR the HTML.
    const url = parseUrl(req.url || '', false);
    const route = site.route(url.pathname);

    if (route) {
      const entry = await route.entry();
      if (entry.ok) {
        return { headers: CACHE, data: entry.html };
      } else {
        const { status, url } = entry;
        const message = `Failed to get entry HTML from CDN.`;
        return { status, headers: CACHE, data: { status, message, url } };
      }
    }

    // Redirect the resource-request to S3.
    const location = site.redirectUrl(url.pathname);
    if (location) {
      return {
        status: 307,
        data: location,
      };
    }

    // No matching resource.
    return undefined;
  });

  // Finish up.
  return router;
}
