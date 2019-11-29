import { t, micro, constants, log, util } from './common';
import * as router from './router';

export { config } from './config';

const { PKG } = constants;

/**
 * Initializes a new server instance.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; title?: string }) {
  const { db, title, fs } = args;
  const base = util.fs.resolve('.');
  const root = fs.root.startsWith(base) ? fs.root.substring(base.length) : fs.root;

  // Setup the micro-service.
  const deps = PKG.dependencies || {};
  const app = micro.init({
    cors: true,
    log: {
      module: `${log.white(PKG.name)}@${PKG.version}`,
      schema: log.yellow(deps['@platform/cell.schema']),
      fs: root,
    },
  });

  // Routes.
  router.init({ title, db, fs, router: app.router });

  // Finish up.
  return app;
}
