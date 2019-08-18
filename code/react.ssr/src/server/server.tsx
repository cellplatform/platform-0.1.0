import { fs, log, micro } from '../common';
import * as routes from './routes';
export * from '../types';

/**
 * Initialize the [server].
 */
export function init(args: { manifest: string; cdn?: string; secret?: string }) {
  const { manifest, cdn, secret } = args;

  const PKG = require(fs.resolve('package.json')) as { name: string; version: string };
  const res = micro.init({
    log: {
      package: log.white(PKG.name),
      version: PKG.version,
      secret: Boolean(secret),
      manifest,
      cdn: cdn ? cdn : 'false',
    },
  });

  const { router } = res;
  routes.init({ router, manifest, cdn, secret });

  return res;
}
