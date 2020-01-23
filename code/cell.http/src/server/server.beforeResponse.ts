import { constants, micro } from './common';

/**
 * Make common checks/adjustments to responses
 * before they are sent over the wire.
 */
export function beforeResponse(e: micro.IMicroResponse) {
  const changes: any = {};

  // Add default cache headers.
  const headers = e.res.headers || {};

  if (!headers['Cache-Control']) {
    /**
     * TODO 🐷
     * - Cache-Control: only for data API, allow caching for the UI routes.
     */

    const { system } = constants.getSystem();
    changes.headers = {
      ...headers,
      system,
      'cache-control': 'no-cache', // Ensure the data-api responses reflect current state of data.
      // 'Cache-Control': 's-maxage=1, stale-while-revalidate', // See https://zeit.co/docs/v2/network/caching/#stale-while-revalidate
    };
  }

  // Finish up (change response if required).
  if (Object.keys(changes).length > 0) {
    e.modify({ ...e.res, ...changes });
  }
}
