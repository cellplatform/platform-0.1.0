import { parse as parseUrl } from 'url';

import { express, t } from '../common';
import { Manifest } from '../manifest';
import { Router } from './Router';

export type IRoute = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  pattern: RegExp;
  handler: t.RouteHandler;
};

/**
 * Router
 */
export function init(args: { manifestUrl: string; cdnUrl?: string; apiSecret?: string }) {
  const router = Router.create();

  const getManifest = (force?: boolean) =>
    Manifest.get({ url: args.manifestUrl, baseUrl: args.cdnUrl, force });

  const isDenied = (req: t.IncomingMessage): t.RouteResponse | undefined => {
    const { apiSecret } = args;

    // req.headers
    const auth = req.headers.authorization;
    const isAuthorized = !apiSecret ? true : auth === apiSecret;
    if (!isAuthorized) {
      const status = 403;
      const description = `Not allowed. Ensure you have the correct token in the authorization header.`;
      return { status, data: { status, description } };
    }
    return undefined;
  };

  /**
   * [POST] update manifest (reset cache).
   */
  router.post('/.update', async req => {
    const denied = isDenied(req);
    if (denied) {
      return denied;
    }
    await getManifest(true);
    const status = 200;
    return { status, data: { status, message: 'Manifest updated' } };
  });

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
    const site = manifest.site(hostname);
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
        return { data: entry.html };
      }
    }

    // [307] redirect the resource-request to S3.
    const location = site.redirectUrl(url.pathname);
    if (location) {
      const status = 307;
      return { status, data: location };
    }

    // No matching resource.
    return undefined;
  });

  // Finish up.
  return router;
}
