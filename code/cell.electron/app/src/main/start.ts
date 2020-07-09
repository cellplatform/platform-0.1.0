import { app } from 'electron';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Client, constants, ENV, fs, log, rx, t } from './common';
import * as server from './main.server';
import { sys } from './main.sys';
import { window } from './main.window';

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

  // Start the HTTP server.
  const port = prod ? undefined : 5000;
  const { paths, host } = await server.start({ log, prod, port });

  // Initialize the typesystem HTTP client.
  const event$ = new Subject<t.AppEvent>();
  const client = Client.typesystem({ http: host, event$: event$ as Subject<t.TypedSheetEvent> });

  // Log main process.
  const bundle = constants.paths.bundle;
  await logMain({ host, log: log.file.path, db: paths.db, fs: paths.fs, preload: bundle.preload });
  await app.whenReady();

  // Initialize the system models.
  const ctx = await sys.init({ client, event$ });

  log.info();
  log.info(`app modules: ${log.yellow(ctx.apps.total)}`);
  ctx.apps.forEach((app) => {
    log.info.gray(` • ${log.magenta(app.name)}`);
  });
  log.info();

  await window.createAll({ ctx });

  // ctx.apps.le
  // console.log('ctx.apps.total', ctx.apps.total);
  // console.log('ctx.windowRefs.length', ctx.windowRefs.length);

  // if (ctx.windowRefs.length < ctx.apps.total) {
  if (ctx.windowRefs.length === 0) {
    // TEMP 🐷- Ensure at least one window for each app exists.

    const sys = ctx.apps.row(0);
    const name = sys.props.name;
    window.createOne({ ctx, name });

    // ctx.apps.forEach((app) => {
    //   const name = app.name;
    // });
  }

  rx.payload<t.IpcDebugEvent>(event$, 'IPC/debug')
    .pipe(filter((e) => e.source !== 'MAIN'))
    .subscribe((e) => {
      const name = e.data.name;
      const arg = e.data.arg || '';
      if (name && e.data.action === 'OPEN') {
        console.log('create', name, arg);
        window.createOne({ ctx, name, argv: [arg] });
      }
    });

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
