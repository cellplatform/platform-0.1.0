import { local } from '@platform/cell.fs';
import { server } from '@platform/cell.http/lib/server';
import { NeDb } from '@platform/fsdb.nedb';
import { filter } from 'rxjs/operators';

import { constants, fs, t, Urls } from '../common';
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

  // Start the srever.
  const port = 8080;
  const instance = await app.start({ port });

  app.response$
    // Add electron specific meta-data to sys info.
    .pipe(filter(e => Urls.routes.SYS.INFO.includes(e.url)))
    .subscribe(e => {
      // console.log('Schema', Schema.Urls.routes);
      console.log('Urls', Urls);
      console.log('e', e.res);

      /**
       * TODO 🐷
       * - add more details specific to electron;
       *  - eg: logfile path
       * db path
       * fs path
       */

      // const data = e
      // e.res
      e.modify(e.res);
    });

  // Upload the bundled system.
  await upload({ dir: constants.paths.assets.ui });

  // Finish up.
  return { app, instance, paths };
}
