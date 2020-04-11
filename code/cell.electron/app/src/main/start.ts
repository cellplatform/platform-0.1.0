import { app } from 'electron';

import { constants, log } from './common';
import * as screen from './main.screen';
import * as server from './main.server';
import * as tray from './main.tray';

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
 * Env state.
 */
const prod = app.isPackaged;
if (prod) {
  process.env.NODE_ENV = 'production';
}

/**
 * Startup the application.
 */

export async function start() {
  const { paths, host } = await server.start({ log, prod });

  // Upload the bundled system.

  /**
   * TODO 🐷
   * - change this to "Setup A1: App TypeDefs"
   */

  await server.upload({ sourceDir: constants.paths.bundle.ui });

  // Log: MAIN
  (() => {
    const table = log.table({ border: false });
    const add = (key: string, value: any) => {
      key = ` • ${log.green(key)} `;
      table.add([key, value]);
    };

    add('env:', process.env.NODE_ENV || '<empty>');
    add('packaged:', app.isPackaged);
    add('log:', log.file.path);
    add('db:', paths.db);
    add('fs:', paths.fs);

    log.info.gray(`
${log.white('main')}
${table}
`);
  })();

  await app.whenReady();

  const def = 'cell:sys:A1'; // TODO 🐷
  screen.createWindow({ host, def });

  // TEMP 🐷
  refs.tray = tray.init({ host, def }).tray;

  try {
    // const f = await exec.process.spawn('node -v');
    // console.log('f', f);
    // f.
    // const client = Client.create('localhost:8080');
    // const res = await client.cell('cell:foo:A1').info();
    // log.info(res);
  } catch (error) {
    // console.log('error', error);
    log.error(error);
    // logger.info('foo')
  }
}
