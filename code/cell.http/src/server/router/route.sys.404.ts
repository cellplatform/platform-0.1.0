import { t } from '../common';
import { ROUTES } from './constants';

/**
 * Wildcard (404).
 */
export function init(args: { router: t.IRouter }) {
  const { router } = args;

  router.get(ROUTES.SYS.WILDCARD, async req => {
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
