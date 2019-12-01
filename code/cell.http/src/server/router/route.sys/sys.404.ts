import { ROUTES, t, ERROR } from '../common';

/**
 * Wildcard (404).
 */
export function init(args: { router: t.IRouter }) {
  const { router } = args;

  router.get(ROUTES.SYS.WILDCARD, async req => {
    const status = 404;
    const data: t.IHttpError = {
      status,
      type: ERROR.NOT_FOUND,
      message: 'Not found.',
    };
    return { status, data };
  });
}
