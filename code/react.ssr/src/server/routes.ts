import { t, Manifest } from './common';
import * as meta from './routes.meta';
import * as resource from './routes.resource';

/**
 * Router
 */
export function init(args: { router: t.IRouter; manifestUrl: string; baseUrl: string }) {
  const { router, manifestUrl, baseUrl } = args;

  const getManifest = (args: { force?: boolean } = {}) => {
    return Manifest.get({
      manifestUrl,
      baseUrl,
      ttl: 5000,
      force: args.force,
      loadBundleManifest: true,
    });
  };

  // Register routes.
  meta.init({ router, getManifest });
  resource.init({ router, getManifest });

  // Finish up.
  return router;
}
