import { fs } from '@platform/fs';
import { app } from 'electron';

import * as devTools from '../helpers/devTools/main';
import { init as initIpc, IpcClient, IpcMessage, MAIN_ID } from '../helpers/ipc/main';
import * as logger from '../helpers/logger/main';
import { init as initSettings } from '../helpers/settings/main';
import { WindowsMain } from '../helpers/windows/main';
import * as t from '../types';

export * from '../types';
export * from '../helpers/screen/main';
export { is } from '../helpers/is/main';
export { devTools, logger };

/**
 * Initializes [Main] process systems (safely).
 */
export async function init<M extends IpcMessage = any, S extends t.SettingsJson = any>(
  args: {
    appName?: string;
    ipc?: t.IpcClient<M>;
    log?: t.IMainLog | string;
    settings?: t.IMainSettingsClient<S>;
    windows?: t.IWindows;
  } = {},
): Promise<t.IMain<M, S>> {
  await ready();
  const { appName } = args;
  const id = MAIN_ID;

  try {
    // Initiaize modules.
    const ipc = args.ipc || initIpc<M>();
    const settings = args.settings || initSettings<S>({ ipc });
    const windows = args.windows || WindowsMain.instance({ ipc });
    const log =
      typeof args.log === 'object'
        ? args.log // Logger already exists and was provided.
        : initLog({ ipc, dir: args.log, appName }); // Initialize a new log.
    devTools.listen({ ipc, windows });

    // Finish up.
    const main: t.IMain<M, S> = { id, ipc, log, settings, windows };
    return main;
  } catch (error) {
    console.log('MAIN/INIT:', error); // tslint:disable-line
    throw error;
  }
}

/**
 * Promise that waits until the app is ready or returns immediately if already `ready`.
 */
export function ready() {
  return new Promise((resolve, reject) => {
    if (app.isReady()) {
      resolve();
    } else {
      app.on('ready', () => resolve());
    }
  });
}

/**
 * [Internal]
 */
function initLog(args: { ipc: IpcClient; dir?: string; appName?: string }) {
  // Initialize electron log directires.
  // https://electronjs.org/docs/api/app#appsetapplogspathpath
  //
  // NOTE: this is necessary when using electron 6.x
  //       commented out here so as not to fail when consumers use 5.x
  //       put this line prior to init in the calling code when working with 6.
  //
  // app.setAppLogsPath();

  // Setup the logger
  const { ipc } = args;
  let appName = args.appName || app.getName();
  appName = appName.replace(/\s/g, '-').toLowerCase();
  const dir = args.dir || fs.join(fs.dirname(app.getPath('logs')), appName);
  return logger.init({ ipc, dir });
}
