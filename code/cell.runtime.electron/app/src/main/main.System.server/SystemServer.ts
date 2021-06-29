import { local } from '@platform/cell.fs.local';
import { NodeRuntime } from '@platform/cell.runtime.node';
import { server } from '@platform/cell.service/lib/node/server';
import { NeDb } from '@platform/fsdb.nedb';
import { filter } from 'rxjs/operators';

import { fs, log, t, Urls, util, Paths } from '../common';
import { RuntimeInfo } from './RuntimeInfo';

export const SystemServer = {
  region: 'local:desktop',

  /**
   * Configure a system [http server].
   */
  init(options: { prod?: boolean; log?: t.ILog }) {
    const { prod = false } = options;
    const paths = Paths.data({ prod });

    const app = server.create({
      name: 'main',
      db: NeDb.create({ filename: paths.db }),
      fs: local.init({ dir: paths.fs, fs }),
      runtime: NodeRuntime.create(),
      logger: options.log,
      region: SystemServer.region,
    });

    return { app, paths };
  },

  /**
   * Configure and start a system [http server].
   */
  async start(
    options: {
      prod?: boolean;
      log?: t.ILog;
      port?: number;
      isDev?: boolean;
      silent?: boolean;
    } = {},
  ) {
    const { silent } = options;
    const { app, paths } = SystemServer.init(options);

    const port = await util.port.unused(options.port);
    const instance = await app.start({ port, silent });
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
