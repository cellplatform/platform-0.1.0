import { constants, micro, t } from './common';

/**
 * Make common checks/adjustments to responses
 * before they are sent over the wire.
 */
export function prepareResponse(e: micro.IMicroResponse) {
  const changes: any = {};

  // Add default headers.
  const { system } = constants.getSystem();
  let headers: t.IHttpHeaders = { ...(e.res.headers || {}), system };

  if (!headers['cache-control']) {
    headers = {
      ...headers,
      'cache-control': 'no-cache', // Ensure the data-api responses reflect current state of data.
      // 'cache-control': 's-maxage=1, stale-while-revalidate', // See https://zeit.co/docs/v2/network/caching/#stale-while-revalidate
    };
  }
  changes.headers = headers;

  // Finish up (change response if required).
  if (Object.keys(changes).length > 0) {
    e.modify({ ...e.res, ...changes });
  }
}
