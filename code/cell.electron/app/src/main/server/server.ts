import { local } from '@platform/cell.fs';
import { server } from '@platform/cell.http/lib/server';
import { NeDb } from '@platform/fsdb.nedb';
import { filter } from 'rxjs/operators';
import { app as electron } from 'electron';

import { constants, fs, t, Urls, log } from '../common';
import { upload } from './upload';

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

  const app = server.init({
    title: 'local',
    db: NeDb.create({ filename: paths.db }),
    fs: local.init({ root: paths.fs }),
    logger,
  });

  return { app, paths };
}

/**
 * Start a CellOS http server.
 */
export async function start(args: IInitArgs = {}) {
  const { app, paths } = init(args);

  // Start the server.
  const port = 8080;
  const instance = await app.start({ port });

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
    .pipe(filter(e => Urls.routes.SYS.INFO.includes(e.url)))
    .subscribe(e => {
      const data: t.IResGetElectronSysInfo = {
        ...e.res.data,
        region: 'local:app',
        app: info,
      };
      e.modify({ ...e.res, data });
    });

  // Upload the bundled system.
  await upload({ dir: constants.paths.assets.ui });

  // Finish up.
  return { app, instance, paths };
}
