import { parse as parseUrl } from 'url';
import { t, fs } from './common';

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
    const host = req.headers.host;
    const hostname = (host || '').split(':')[0];
    const site = manifest.site.byHost(hostname);
    if (!site) {
      const status = 404;
      const message = `A site definition for the domain '${hostname}' does not exist in the manifest.`;
      return { status, data: { status, message } };
    }

    // Check if there is a direct route match and if found "server-side-render" the HTML.
    const url = parseUrl(req.url || '', false);
    const route = site.route(url.pathname);
    const ext = fs.extname(url.pathname || ''); // NB: an extension indicates an asset resource, not the entry HTML.

    if (route && !ext) {
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
