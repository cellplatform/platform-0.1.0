import { filter } from 'rxjs/operators';

import { constants, log, micro, t, util, value } from './common';
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
  log?: Array<'ROUTES'>;
}) {
  const { db, title, fs } = args;
  const logTypes = args.log || [];
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
      fs: `[${fs.type === 'LOCAL' ? 'local' : fs.type}]${root}`,
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

  // Make common checks/adjustments to responses before they are sent over the wire.
  app.response$.subscribe(e => {
    const changes: any = {};

    // Add default cache headers.
    const headers = e.res.headers || {};
    if (!headers['Cache-Control']) {
      /**
       * TODO 🐷
       * - Cache-Control: only for data API, allow caching for the UI routes.
       */

      // Prepare the "Cell|OS" HTTP header.
      const versions = constants.getVersions();
      const version = {
        server: versions.toVersion(versions.server),
        schema: versions.toVersion(versions.schema),
      };
      const os = `Cell|OS; cell.http@${version.server}; cell.schema@${version.schema}`;

      changes.headers = {
        ...headers,
        System: os,
        'cache-control': 'no-cache', // Ensure the data-api responses reflect current state of data.
        // 'Cache-Control': 's-maxage=1, stale-while-revalidate', // See https://zeit.co/docs/v2/network/caching/#stale-while-revalidate
      };
    }

    // Finish up (change response if required).
    if (Object.keys(changes).length > 0) {
      e.modify({ ...e.res, ...changes });
    }
  });

  // Log routes.
  app.events$
    .pipe(
      filter(() => logTypes.includes('ROUTES')),
      filter(e => e.type === 'HTTP/started'),
    )
    .subscribe(e => log.info(app.router.log({ indent: 3 })));

  // Finish up.
  return app;
}
