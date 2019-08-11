import { parse as parseUrl } from 'url';

import { express, cheerio } from '../common';
import { Manifest } from '../manifest';

/**
 * Router
 */
export function init(args: { manifestUrl: string; cdnUrl?: string; apiSecret?: string }) {
  const router = express.Router();
  const getManifest = (force?: boolean) =>
    Manifest.get({ url: args.manifestUrl, baseUrl: args.cdnUrl, force });

  const isAllowed = (req: express.Request, res: express.Response) => {
    const { apiSecret } = args;
    const auth = req.header('authorization');
    const isAuthorized = auth ? auth === apiSecret : true;
    if (!isAuthorized) {
      const status = 403;
      const error = `Not allowed. Ensure you have the correct token in the authorization header.`;
      res.status(status).send({ status, error });
    }
    return isAuthorized;
  };

  /**
   * [POST] update manifest (reset cache).
   */
  router.post('/.update', async (req, res) => {
    if (!isAllowed(req, res)) {
      return;
    }
    await getManifest(true);
    res.send({ status: 200, message: 'Manifest updated.' });
  });

  /**
   * [GET] resource.
   */
  router.get('*', async (req, res) => {
    // Load the manifest.
    const manifest = await getManifest();
    if (!manifest.ok) {
      const status = manifest.status;
      return res.status(status).send({ status, error: 'Manifest could not be loaded.' });
    }

    // Retrieve the site definition.
    const { hostname } = req;
    const site = manifest.site(hostname);
    if (!site) {
      const status = 404;
      const error = `A site definition for the domain '${hostname}' does not exist in the manifest.`;
      return res.status(status).send({ status, error });
    }

    // Check if there is a direct route match and if found SSR the HTML.
    const url = parseUrl(req.url);
    const route = site.route(url.pathname);
    if (route) {
      const entry = await route.entry();
      if (entry.ok) {
        return res.set('Content-Type', 'text/html; charset=utf-8').send(entry.html);
      }
    }

    // [307] redirect the resource-request to S3.
    const redirect = site.redirectUrl(url.pathname);
    if (redirect) {
      return res.status(307).redirect(redirect);
    }

    // No matching resource.
    const status = 404;
    return res.status(status).send({ status, error: 'Not found.' });
  });

  // Finish up.
  return router;
}
