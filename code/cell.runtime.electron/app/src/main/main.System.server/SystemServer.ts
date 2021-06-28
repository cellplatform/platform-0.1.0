import { local } from '@platform/cell.fs.local';
import { NodeRuntime } from '@platform/cell.runtime.node';
import { server } from '@platform/cell.service/lib/node/server';
import { NeDb } from '@platform/fsdb.nedb';
import { filter } from 'rxjs/operators';

import { constants, fs, log, t, Urls, util } from '../common';
import { RuntimeInfo } from './RuntimeInfo';

export const SystemServer = {
  region: 'local:desktop',

  /**
   * Configure a system [http server].
   */
  init(args: { prod?: boolean; log?: t.ILog }) {
    const { prod = false } = args;
    const paths = constants.Paths.data({ prod });

    const app = server.create({
      name: 'main',
      db: NeDb.create({ filename: paths.db }),
      fs: local.init({ dir: paths.fs, fs }),
      runtime: NodeRuntime.create(),
      logger: args.log,
      region: SystemServer.region,
    });

    return { app, paths };
  },

  /**
   * Configure and start a system [http server].
   */
  async start(args: { prod?: boolean; log?: t.ILog; port?: number; isDev?: boolean }) {
    const { app, paths } = SystemServer.init(args);

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
          region: SystemServer.region,
          runtime: info,
        };
        e.modify({ ...e.res, data });
      });

    app.response$.subscribe((e) => {
      /**
       * TODO 🐷
       * - check for local "security" token to prevent external apps for mucking with the API.
       */
      // e.modify({
      //   status: 500,
      //   data: { error: 'Fail' },
      // });
    });

    // Finish up.
    return { app, instance, paths, host, port };
  },
};
