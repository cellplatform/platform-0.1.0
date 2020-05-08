import '../config';

import { app } from 'electron';

import { constants, log, Client, fs, ENV } from './common';
import { sys } from './main.sys';
import { sys as sys2 } from './main.sys2';
import { window } from './main.window2';
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
  const prod = ENV.isProd;
  const { paths, host } = await server.start({ log, prod });
  const client = Client.typesystem(host);

  // Ensure typescript declarations exist [types.g.ts]
  // and retrieve sys/app context.
  // await sys.initTypeDefs(client, { save: ENV.isDev });
  // const ctx = await sys.initContext(client);

  // Upload the bundled system files.
  // await sys.initWindowDef({
  //   ctx,
  //   kind: SYS.KIND.IDE,
  //   uploadDir: [bundle.sys, bundle.ide],
  // });

  const bundle = constants.paths.bundle;
  await logMain({ host, log: log.file.path, db: paths.db, fs: paths.fs, preload: bundle.preload });
  await app.whenReady();

  // Initialize UI windows.
  // await window.createWindows({ ctx, kind: SYS.KIND.IDE });

  // TEMP 🐷
  // refs.tray = tray.init({ host, def, ctx }).tray;

  const ctx = await sys2.init(client);
  await window.createOne({ ctx, name: '@platform/cell.ui.sys' });
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

  const toSize = async (path: string) => {
    const exists = await fs.exists(path);
    return exists ? (await fs.size.file(path)).toString({ round: 0, spacer: '' }) : '0B';
  };

  const path = async (input: string) => {
    let output = input;
    if (isDev) {
      const prefix = fs.resolve('..');
      output = output.startsWith(prefix) ? output.substring(prefix.length + 1) : output;
    }
    if (isDev) {
      const size = await toSize(input);
      output = `${output} ${log.blue(size)}`;
    }
    return output;
  };

  add('packaged:', app.isPackaged);
  add('env:', ENV.node || '<empty>');
  add('host:', `http://${args.host.split(':')[0]}:${log.magenta(args.host.split(':')[1])}`);

  add('log:', await path(args.log));
  add('db:', await path(args.db));
  add('fs:', await path(args.fs));
  add('preload:', await path(args.preload));

  log.info.gray(`
${log.white('main')}
${table}
`);
}
