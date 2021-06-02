import { app } from 'electron';

import { constants, ENV, fs, log, rx, t, ConfigFile } from './common';
import * as server from './main.server';
import { Window } from './main.Window';
import { Log } from './main.Log';
import { Bundle } from './main.Bundle';
import { Menu } from './main.Menu';
import { System } from './main.System';
import { BuildMenu } from './main.Menu.build';

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
  const bus = rx.bus<t.ElectronRuntimeEvent>();
  const prod = ENV.isProd;

  try {
    // Start the HTTP server.
    const port = prod ? undefined : 5000;
    const { paths, host, instance } = await server.start({ log, prod, port });

    // Load the configuration JSON file.
    const config = await ConfigFile.read();
    log.info('config', config);

    await app.whenReady();

    /**
     * Initialize controllers
     */
    System.Controller({ bus, paths, host, config });
    Window.Controller({ bus });
    Log.Controller({ bus });
    Menu.Controller({ bus });
    Bundle.Controller({ bus, host });

    log.info(`Controllers initialized`);

    const bundle = Bundle.Events({ bus });
    await bundle.upload.fire({
      sourceDir: constants.paths.bundle.sys,
      targetDir: 'app.sys/web',
      // force: dev,
      force: true, // TODO 🐷 - overwrite if later
    });

    const uploadRes = await bundle.status.get({ dir: 'app.sys/web' });
    console.log('-------------------------------------------');
    console.log('uploadRes', uploadRes);

    const preload = constants.paths.preload;

    await logMain({ host, paths: { data: paths, preload } });

    // await menu.build({ bus, paths, port: instance.port });
    BuildMenu({ bus }).load();

    const sysEvents = System.Events({ bus });
    const sysStatus = await sysEvents.status.get();
    log.info('System Status', sysStatus);

    // TEMP 🐷
    // refs.tray = tray.init({ host, def, ctx }).tray;

    log.info(`✨ Startup Complete`);
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
  paths: { preload: string; data: t.ElectronDataPaths };
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
  add('preload:', await path(args.paths.preload));
  add('log:', await path(args.paths.data.log));
  add('db:', await path(args.paths.data.db));
  add('fs:', await path(args.paths.data.fs));
  add('config:', await path(args.paths.data.config));

  log.info.gray(`
runtime.electron.${log.white('main')}:
${table}
`);
}
