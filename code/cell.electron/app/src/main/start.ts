import { app } from 'electron';

import './config';
import { constants, log } from './common';
import * as screen from './main.screen';
import * as server from './main.server';
import * as tray from './main.tray';
import * as client from './main.client';

const refs: any = {};

/**
 *  NOTE:
 *    Setting this value to true (the default in Electron 9+)
 *    prevents the following warning being emitted in the
 *    console at startup.
 *
 *  WARNING (AVOIDED):
 *    (electron) The default value of app.allowRendererProcessReuse is deprecated,
 *    it is currently "false".  It will change to be "true" in Electron 9.
 *    For more information please check https://github.com/electron/electron/issues/18397
 */
app.allowRendererProcessReuse = true;

/**
 * Environment.
 */
if (app.isPackaged) {
  process.env.NODE_ENV = 'production';
}

/**
 * Startup the application.
 */

export async function start() {
  const ENV = constants.ENV;
  const prod = ENV.isProd;
  const { paths, host } = await server.start({ log, prod });

  /**
   * TODO 🐷
   * - change this to "Setup A1: App TypeDefs"
   */

  // Upload the bundled system files.
  await client.upload({ host, sourceDir: constants.paths.bundle.ui });

  // TEMP 🐷
  await client.writeTypeDefs(host, { save: ENV.isDev });
  await client.writeSys(host);

  logMain({ host, log: log.file.path, db: paths.db, fs: paths.fs });
  await app.whenReady();

  const def = 'cell:sys:A1'; // TODO 🐷
  screen.createWindow({ host, def });

  // TEMP 🐷
  refs.tray = tray.init({ host, def }).tray;
}

/**
 * [Helpers]
 */

function logMain(args: { host: string; log: string; db: string; fs: string }) {
  const table = log.table({ border: false });
  const add = (key: string, value: any) => {
    key = ` • ${log.green(key)} `;
    table.add([key, value]);
  };

  add('env:', process.env.NODE_ENV || '<empty>');
  add('packaged:', app.isPackaged);
  add('host:', args.host);
  add('log:', args.log);
  add('db:', args.db);
  add('fs:', args.fs);

  log.info.gray(`
${log.white('main')}
${table}
`);
}
