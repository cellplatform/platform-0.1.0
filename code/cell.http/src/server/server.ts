import { t, micro, constants, log } from './common';
import * as router from './router';

export { config } from './config';

const { PKG } = constants;

/**
 * Initializes a new server instance.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; title?: string }) {
  const { db, title, fs } = args;

  // Setup the micro-service.
  const deps = PKG.dependencies || {};
  const app = micro.init({
    cors: true,
    log: {
      module: `${log.white(PKG.name)}@${PKG.version}`,
      schema: deps['@platform/cell.schema'],
    },
  });

  // Routes.
  router.init({ title, db, fs, router: app.router });

  // Finish up.
  return app;
}
