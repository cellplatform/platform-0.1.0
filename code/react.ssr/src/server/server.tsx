import { micro } from '../common';
import * as routes from './routes';

export * from '../types';

/**
 * Initialize the [server].
 */
export function init(args: { manifestUrl: string; baseUrl: string }) {
  const { manifestUrl, baseUrl } = args;

  const res = micro.init({
    log: {
      manifestUrl,
      baseUrl,
    },
  });

  const { router } = res;
  routes.init({ router, manifestUrl, baseUrl });

  return res;
}
