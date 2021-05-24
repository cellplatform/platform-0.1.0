import { local } from '@platform/cell.fs.local';
import { NodeRuntime } from '@platform/cell.runtime.node';
import { server } from '@platform/cell.service/lib/server';
import { NeDb } from '@platform/fsdb.nedb';
import { filter } from 'rxjs/operators';

import { constants, fs, log, t, Urls, util } from '../common';
import { RuntimeInfo } from './server.info';

type IInitArgs = {
  prod?: boolean;
  log?: t.ILog;
};

/**
 * Configure and initialize a CellOS http server.
 */
export function init(args: IInitArgs = {}) {
  const { log: logger, prod = false } = args;
  const paths = constants.paths.data({ prod });

  const app = server.create({
    name: 'local',
    db: NeDb.create({ filename: paths.db }),
    fs: local.init({ dir: paths.fs, fs }),
    runtime: NodeRuntime.create(),
    logger,
  });

  return { app, paths };
}

/**
 * Start a system HTTP server.
 */
export async function start(args: IInitArgs & { port?: number; isDev?: boolean } = {}) {
  const { app, paths } = init(args);

  const port = await util.port.unused(args.port);
  const instance = await app.start({ port });
  const host = `localhost:${port}`;
  const info = await RuntimeInfo({ paths });

  app.response$
    // Add electron specific meta-data to sys-info.
    .pipe(
      filter((e) => {
        const route = app.router.find({ method: 'GET', url: e.url });
        return !route ? false : Urls.routes.SYS.INFO.some((path) => route.path === path);
      }),
    )
    .subscribe((e) => {
      const data: t.IResGetElectronSysInfo = {
        ...e.res.data,
        region: 'local:app:main',
        runtime: info,
      };
      e.modify({ ...e.res, data });
    });

  // Finish up.
  return { app, instance, paths, host, port };
}
