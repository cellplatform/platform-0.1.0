import './config';

import { app } from 'electron';

import { constants, log, Client, fs } from './common';
import { sys } from './main.sys';
import * as window from './main.window';
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
  const bundle = constants.paths.bundle;
  await sys.initWindowDef({
    ctx,
    kind: SYS.KIND.IDE,
    uploadDir: [bundle.sys, bundle.ide],
  });

  await logMain({ host, log: log.file.path, db: paths.db, fs: paths.fs, preload: bundle.preload });
  await app.whenReady();

  // Initialize UI windows.
  await window.createWindows({ ctx, kind: SYS.KIND.IDE });

  // TEMP 🐷
  // refs.tray = tray.init({ host, def, ctx }).tray;
}

/**
 * [Helpers]
 */

async function logMain(args: {
  host: string;
  log: string;
  db: string;
  fs: string;
  preload: string;
}) {
  const table = log.table({ border: false });
  const add = (key: string, value: any) => {
    key = ` • ${log.green(key)} `;
    table.add([key, value]);
  };

  const ENV = constants.ENV;
  const isDev = ENV.isDev;

  const path = async (input: string) => {
    let output = input;
    if (isDev) {
      const prefix = fs.resolve('..');
      output = output.startsWith(prefix) ? output.substring(prefix.length + 1) : output;
    }
    if (isDev) {
      const size = await fs.size.file(input);
      output = `${output} ${log.blue(size.toString({ round: 0, spacer: '' }))}`;
    }
    return output;
  };

  add('packaged:', app.isPackaged);
  add('env:', ENV.node || '<empty>');
  add('host:', args.host);
  add('log:', await path(args.log));
  add('db:', await path(args.db));
  add('fs:', await path(args.fs));
  add('preload:', await path(args.preload));

  log.info.gray(`
${log.white('main')}
${table}
`);
}
