import { app } from 'electron';

import { constants, ENV, fs, log, rx, t } from './common';
import { menu } from './main.menu';
import * as server from './main.server';
import { Window } from './main.Window';

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
 * Ensure all renderer processes are opened in "sandbox" mode.
 * https://www.electronjs.org/docs/tutorial/sandbox#enabling-the-sandbox-globally
 */
app.enableSandbox();

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
  log.info.gray('━'.repeat(60));
  const prod = ENV.isProd;

  // Start the HTTP server.
  const port = prod ? undefined : 5000;
  const { paths, host, instance } = await server.start({ log, prod, port });

  /**
   * Initialize controllers
   */
  const mainbus = rx.bus<t.ElectronRuntimeEvent>();
  Window.Controller({ mainbus });

  try {
    /**
     * Log main process.
     */
    await logMain({ host, paths, log: log.file.path, preload: constants.paths.preload });

    await app.whenReady();

    await menu.build({ bus: mainbus, paths, port: instance.port });

    // TEMP 🐷
    // refs.tray = tray.init({ host, def, ctx }).tray;
  } catch (error) {
    log.error('🐷 Failed on startup:');
    log.error(error);
  }
}

/**
 * [Helpers]
 */

async function logMain(args: {
  host: string;
  log: string;
  preload: string;
  paths: t.IElectronPaths;
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

  add('packaged:', ENV.isPackaged);
  add('env:', ENV.node || '<empty>');
  add('host:', `http://${args.host.split(':')[0]}:${log.white(args.host.split(':')[1])}`);

  add('preload:', await path(args.preload));
  add('log:', await path(args.log));
  add('db:', await path(args.paths.db));
  add('fs:', await path(args.paths.fs));
  add('config:', await path(args.paths.config));

  log.info.gray(`
${log.white('main')}
${table}
`);
}
