import { t, micro, constants, log, util, value } from './common';
import * as router from './router';

export { Config } from './config';

const { PKG } = constants;

/**
 * Initializes a new server instance.
 */
export function init(args: {
  db: t.IDb;
  fs: t.IFileSystem;
  title?: string;
  deployedAt?: number | string;
}) {
  const { db, title, fs } = args;
  const base = util.fs.resolve('.');
  const root = fs.root.startsWith(base) ? fs.root.substring(base.length) : fs.root;
  const deployedAt =
    typeof args.deployedAt === 'string' ? value.toNumber(args.deployedAt) : args.deployedAt;

  // Setup the micro-service.
  const deps = PKG.dependencies || {};
  const app = micro.init({
    cors: true,
    log: {
      module: `${log.white(PKG.name)}@${PKG.version}`,
      schema: log.green(deps['@platform/cell.schema']),
      fs: root,
    },
  });

  // Routes.
  router.init({
    title,
    db,
    fs,
    router: app.router,
    deployedAt,
  });

  // Prepare headers before final response is sent to client.
  app.response$.subscribe(e => {
    const headers = {
      ...e.res.headers,
      'Cache-Control': 's-maxage=1, stale-while-revalidate', // See https://zeit.co/docs/v2/network/caching/#stale-while-revalidate
    };

    console.log('headers', headers);

    e.modify({ ...e.res, headers });
  });

  // Finish up.
  return app;
}
