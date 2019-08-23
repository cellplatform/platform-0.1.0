import { parse as parseUrl } from 'url';
import * as t from './types';

const CACHE = { 'Cache-Control': `s-maxage=5000, stale-while-revalidate` };

export function init(args: { router: t.IRouter; getManifest: t.GetManifest }) {
  const { router, getManifest } = args;

  /**
   * [GET] resource.
   */
  router.get('*', async req => {
    // Load the manifest.
    const manifest = await getManifest();
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
        return {
          headers: CACHE,
          data: entry.html,
        };
      } else {
        const { status, url } = entry;
        const message = `Failed to get entry HTML from CDN.`;
        return {
          status,
          headers: CACHE,
          data: { status, message, url },
        };
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
}
