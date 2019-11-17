import { t } from '../common';
import * as about from './route.about';
import * as ns from './route.ns';

/**
 * Initialize routes
 */
export function init(args: { db: t.IDb; router: t.IRouter; title?: string }) {
  const { router } = args;

  // Register routes.
  about.init(args);
  ns.init(args);

  /**
   * Wildcard (404).
   */
  router.get('*', async req => {
    const { url, method } = req;
    const status = 404;
    return {
      status,
      data: {
        status,
        method,
        message: 'Not found',
        url,
      },
    };
  });
}
