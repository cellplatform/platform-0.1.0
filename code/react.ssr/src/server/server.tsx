import { log, micro } from '../common';
import * as routes from './routes';

export * from '../types';

/**
 * Initialize the [server].
 */
export function init(args: { manifest: string; cdn?: string; secret?: string }) {
  const { manifest, cdn, secret } = args;

  const res = micro.init({
    log: {
      secret: Boolean(secret),
      manifest,
      cdn: cdn ? cdn : 'false',
    },
  });

  const { router } = res;
  routes.init({ router, manifest, cdn, secret });

  return res;
}
