import { app, BrowserWindow } from 'electron';
import { fs, log } from './common';

import * as server from './server';
import * as tray from './tray';

import { createWindow } from './screen';

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

  // Log state.
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

    // log.info.gray(`\n\n${table}\n`);
  })();

  await app.whenReady();

  const def = 'cell:sys:A1'; // TODO 🐷
  createWindow({ host, def });

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

// (async () => {
//   const { paths } = await server.start({ log, prod });

//   // Log state.
//   const table = log.table({ border: false });
//   // table.add([log.gray(`${process.env.NODE_ENV} `), app.isPackaged ? '(packaged)' : '']);
//   table.add([log.green('• env:'), log.gray(process.env.NODE_ENV || '<empty>')]);
//   table.add([log.green('• packaged:'), log.gray(app.isPackaged)]);
//   table.add([log.green('• log:'), log.gray(log.file.path)]);
//   table.add([log.green('• db:'), log.gray(paths.db)]);
//   table.add([log.green('• fs:'), log.gray(paths.fs)]);
//   log.info(`\n\n${table}\n`);

//   await app.whenReady();
//   createWindow();

//   // TEMP 🐷
//   refs.tray = tray.init().tray;

//   try {
//     // const f = await exec.process.spawn('node -v');
//     // console.log('f', f);
//     // f.
//     // const client = Client.create('localhost:8080');
//     // const res = await client.cell('cell:foo:A1').info();
//     // log.info(res);
//   } catch (error) {
//     // console.log('error', error);
//     log.error(error);
//     // logger.info('foo')
//   }
// })();
