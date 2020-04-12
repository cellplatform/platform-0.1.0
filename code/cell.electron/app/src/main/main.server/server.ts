import { local } from '@platform/cell.fs.local';
import { server } from '@platform/cell.http/lib/server';
import { NeDb } from '@platform/fsdb.nedb';
import { app as electron } from 'electron';
import { filter } from 'rxjs/operators';

import { constants, fs, log, t, util } from '../common';

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
    title: 'local',
    db: NeDb.create({ filename: paths.db }),
    fs: local.init({ root: paths.fs, fs }),
    logger,
  });

  return { app, paths };
}

/**
 * Start a CellOS HTTP server.
 */
export async function start(args: IInitArgs & { port?: number; isDev?: boolean } = {}) {
  const { app, paths } = init(args);

  const port = await util.port.unused();
  const instance = await app.start({ port });
  const host = `localhost:${port}`;

  // Return extra information about the app on the sys-info route.
  type Info = t.IResGetSysInfoElectronApp;
  const info = ((): Info => {
    const env = process.env.NODE_ENV as Info['env'];
    const versions = process.versions;
    return {
      packaged: electron.isPackaged,
      env,
      paths: {
        db: paths.db,
        fs: paths.fs,
        log: log.file.path,
      },
      versions: {
        node: versions.node,
        electron: versions.electron,
        chrome: versions.chrome,
        v8: versions.v8,
      },
    };
  })();

  app.response$
    // Add electron specific meta-data to sys info.

    //
    // TODO 🐷 do the filter using [isMatch] on the router using Routes
    //
    // .pipe(filter(e => Urls.routes.SYS.INFO.includes(e.url)))
    .pipe(filter(e => ['/', '/.sys', '/.sys/'].includes(e.url)))
    .subscribe(e => {
      const data: t.IResGetElectronSysInfo = {
        ...e.res.data,
        region: 'local:app',
        app: info,
      };
      e.modify({ ...e.res, data });
    });

  // Finish up.
  return { app, instance, paths, host, port };
}
