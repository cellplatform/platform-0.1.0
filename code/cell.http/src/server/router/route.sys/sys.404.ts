import { ROUTES, t } from '../common';

/**
 * Wildcard (404).
 */
export function init(args: { router: t.IRouter }) {
  const { router } = args;

  router.get(ROUTES.SYS.WILDCARD, async req => {
    const { url = '' } = req;
    const status = 404;

    const data: t.INotFoundResponse = {
      url,
      status,
      type: 'HTTP/404',
      message: 'Not found',
    };

    return { status, data };
  });
}
