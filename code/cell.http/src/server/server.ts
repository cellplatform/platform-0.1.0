import { t, micro, constants, log } from './common';
import * as router from './router';

export { config } from './config';

const { PKG } = constants;

/**
 * Initializes a new server instance.
 */
export function init(args: { db: t.IDb; title?: string }) {
  const { db, title } = args;

  // Setup the micro-service.
  const app = micro.init({
    cors: true,
    log: {
      module: `${log.white(PKG.name)}@${PKG.version}`,
      schema: PKG.dependencies['@platform/cell.schema'],
    },
  });

  // Routes.
  router.init({ title, db, router: app.router });

  // Finish up.
  return app;
}
