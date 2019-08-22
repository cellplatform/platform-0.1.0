import { log, micro } from '../common';
import * as routes from './routes';

export * from '../types';

/**
 * Initialize the [server].
 */
export function init(args: { manifestUrl: string; baseUrl: string; secret?: string }) {
  const { manifestUrl, baseUrl, secret } = args;

  const res = micro.init({
    log: {
      secret: Boolean(secret),
      manifestUrl,
      baseUrl,
    },
  });

  const { router } = res;
  routes.init({ router, manifestUrl, baseUrl, secret });

  return res;
}
