import { t, micro, constants, log, util, value, Schema } from './common';
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
    e.modify({
      ...e.res,
      headers: {
        ...e.res.headers,
        'Cache-Control': 's-maxage=1, stale-while-revalidate', // See https://zeit.co/docs/v2/network/caching/#stale-while-revalidate
      },
    });
  });

  const urls = Schema.url('db.team:80');

  // const url = `localhost:8080/cell:foo!A1`
  const uri = Schema.uri.create.cell('foo', 'A1');

  console.log('uri', uri);

  const url = urls.cell(uri);

  // const

  // const cell = Schema.uri.parse('cell:foo');

  // console.log('cell', cell);

  const cellUrl = url.info;
  const nsUrl = urls.ns('foo');

  // console.log('cellUrl', cellUrl.q);

  console.log('nsUrl.toString()', nsUrl.info.toString());

  const nsUrl2 = nsUrl.info.query({ cells: ['A1', 'B2:B9'] });

  console.log('url.toString()', nsUrl2.toString());

  app.response$.subscribe(e => {
    // console.log(`${e.method} : ${e.url}`);
    // e.
  });

  // Finish up.
  return app;
}
