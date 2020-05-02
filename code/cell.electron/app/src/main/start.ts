import './config';

import { app } from 'electron';

import { constants, log, Client } from './common';
import { sys } from './main.sys';
import * as screen from './main.screen';
import * as server from './main.server';

const SYS = constants.SYS;

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
  const client = Client.typesystem(host);

  // Ensure typescript declarations exist [types.g.ts]
  // and retrieve sys/app context.
  await sys.initTypeDefs(client, { save: ENV.isDev });
  const ctx = await sys.initContext(client);

  // Upload the bundled system files.
  const bundlePaths = constants.paths.bundle;
  await sys.initWindowDef({
    ctx,
    kind: SYS.KIND.IDE,
    uploadDir: [bundlePaths.sys, bundlePaths.ide],
  });

  logMain({ host, log: log.file.path, db: paths.db, fs: paths.fs });
  await app.whenReady();

  // Initialize UI windows.
  await screen.createWindows({ ctx, kind: SYS.KIND.IDE });

  // TEMP 🐷
  // refs.tray = tray.init({ host, def, ctx }).tray;
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
