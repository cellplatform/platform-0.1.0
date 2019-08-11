import { express, S3 } from '../common';
import { Manifest } from '../manifest';
import { parse as parseUrl } from 'url';

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
   * [POST] update.
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

    // Look up the resource.
    const url = parseUrl(req.url);

    // const url

    return res.send({ hostname, url, base: req.baseUrl, manifest: manifest.toObject() });
  });

  // Finish up.
  return router;
}
