import { local } from '@platform/cell.fs.local';
import { NodeRuntime } from '@platform/cell.runtime.node';
import { server } from '@platform/cell.service/lib/server';
import { NeDb } from '@platform/fsdb.nedb';
import { filter } from 'rxjs/operators';

import { constants, fs, log, t, Urls, util } from '../common';
import { RuntimeInfo } from './server.RuntimeInfo';

type InitArgs = { prod?: boolean; log?: t.ILog };
type StartArgs = InitArgs & { port?: number; isDev?: boolean };

/**
 * Configure a system [http server].
 */
export function init(args: InitArgs = {}) {
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
 * Configure and start a system [http server].
 */
export async function start(args: StartArgs = {}) {
  const { app, paths } = init(args);

  const port = await util.port.unused(args.port);
  const instance = await app.start({ port });
  const host = `localhost:${port}`;
  const info = RuntimeInfo({ paths });

  app.response$
    // Add electron specific meta-data to system-info.
    .pipe(
      filter((e) => {
        const { url } = e;
        const route = app.router.find({ method: 'GET', url });
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
