import { parse as parseUrl } from 'url';

import { micro, log } from '../common';
import { Manifest } from '../manifest';

/**
 * Router
 */
export function init(args: {
  router: micro.Router;
  manifestUrl: string;
  baseUrl: string;
  secret?: string;
}) {
  const { router, manifestUrl, baseUrl } = args;

  const manifestFromCacheOrS3 = (args: { force?: boolean } = {}) => {
    const { force } = args;
    return Manifest.get({ manifestUrl, baseUrl, force, loadBundleManifest: true });
  };

  /**
   * [GET] manifest/summary.
   */
  router.get('/.manifest/summary', async req => {
    const manifest = await manifestFromCacheOrS3();
    const sites = manifest.sites.reduce((acc, site) => {
      const { name, version, size } = site;
      const domain = site.domain.join(', ');
      return { ...acc, [name]: { version, size, domain } };
    }, {});
    return {
      status: 200,
      headers: { 'Cache-Control': `s-maxage=5, stale-while-revalidate` },
      data: { sites },
    };
  });

  /**
   * [GET] manifest.
   */
  router.get('/.manifest', async req => {
    const manifest = await manifestFromCacheOrS3();
    return {
      status: 200,
      headers: { 'Cache-Control': `s-maxage=5, stale-while-revalidate` },
      data: manifest.toObject(),
    };
  });

  /**
   * [POST] manifest (reset cache).
   */
  router.post('/.manifest', async req => {
    const manifest = await manifestFromCacheOrS3({ force: true });
    log.info(`Manifest cache reset.`);
    return {
      status: 200,
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
    const headers = { 'Cache-Control': `s-maxage=5, stale-while-revalidate` };

    if (route) {
      const entry = await route.entry();
      if (entry.ok) {
        return { headers, data: entry.html };
      } else {
        const { status, url } = entry;
        const message = `Failed to get entry HTML from CDN.`;
        return { status, data: { status, message, url } };
      }
    }

    // Redirect the resource-request to S3.
    const location = site.redirectUrl(url.pathname);
    if (location) {
      const status = 307;
      return { status, headers, data: location };
    }

    // No matching resource.
    return undefined;
  });

  // Finish up.
  return router;
}
