import { constants, micro, t, Schema } from '../common';

/**
 * Make common checks/adjustments to responses
 * before they are sent over the wire.
 */
export function beforeResponse(args: { router: t.Router }) {
  const { router } = args;
  const routes = Schema.Urls.routes;

  return (e: micro.MicroResponse) => {
    const { method, url } = e;
    const changes: Record<string, any> = {};
    const { system } = constants.getSystem();
    const match = router.find({ method, url });
    let res = e.res;

    /**
     * Adjust system info.
     */
    if (match && routes.SYS.INFO.includes(match.path)) {
      const ok = e.res.status?.toString().startsWith('2');
      if (ok) {
        res = { ...res, data: { ...res.data, system } };
        changes.res = res;
      }
    }

    /**
     * Add standard headers.
     */
    let headers: t.HttpHeaders = { ...(e.res.headers || {}), system };

    if (!headers['cache-control']) {
      headers = {
        ...headers,
        'cache-control': 'no-cache', // Ensure the data-api responses reflect current state of data.
        // 'cache-control': 's-maxage=1, stale-while-revalidate', // See https://zeit.co/docs/v2/network/caching/#stale-while-revalidate
      };
    }
    changes.headers = headers;

    /**
     * Make changes to response if necessary.
     */
    if (Object.keys(changes).length > 0) {
      e.modify({ ...res, ...changes });
    }
  };
}
