import { BrowserWindow } from 'electron';

import { constants, defaultValue, ENV, t, AppWindowModel } from '../common';
import { logWindow } from './window.log';
import { getUrl } from './window.url';

const PROCESS = constants.PROCESS;

export async function createBrowserWindow(args: {
  ctx: t.IContext;
  app: t.AppRow;
  window: t.AppWindowRow;
}) {
  const { ctx, app } = args;
  const client = ctx.client;

  const uri = args.window.uri.toString();
  const host = ctx.client.host;
  const sandbox = true; // https://www.electronjs.org/docs/api/sandbox-option

  const window = await AppWindowModel.load({ client, uri });

  const argv = [
    ENV.isDev ? PROCESS.DEV : '',
    // `${PROCESS.HOST}=${host}`,
    // `${PROCESS.DEF}=${uri}`,
  ].filter((item) => Boolean(item));

  // Create the browser window.
  // Reference docs:
  //   https://www.electronjs.org/docs/api/browser-window
  //
  const browser = new BrowserWindow({
    show: false,

    x: window.props.x,
    y: window.props.y,
    width: defaultValue(window.props.width, app.props.width),
    height: defaultValue(window.props.height, app.props.height),
    minWidth: app.props.minWidth,
    minHeight: app.props.minHeight,

    title: window.props.title,
    titleBarStyle: 'hiddenInset',
    transparent: true,
    vibrancy: 'selection',
    acceptFirstMouse: true,

    webPreferences: {
      sandbox,
      nodeIntegration: false, // NB: Obsolete (see `contextIsolation`) but leaving around for safety.
      contextIsolation: true, // https://www.electronjs.org/docs/tutorial/context-isolation
      enableRemoteModule: false,
      // preload: constants.paths.bundle.preload,
      additionalArguments: argv,
    },
  });

  // Store reference to window.
  const ref: t.IWindowRef = {
    uri,
    send: <T>(channel: string, payload: T) => browser.webContents.send(channel, payload),
  };
  ctx.windowRefs = [...ctx.windowRefs, ref];

  // Monitor events.
  browser.on('resize', () => updateBounds({ browser, window }));
  browser.on('move', () => updateBounds({ browser, window }));
  browser.once(
    'closed',
    () => (ctx.windowRefs = ctx.windowRefs.filter((item) => item.uri !== uri)),
  );
  browser.once('ready-to-show', () => {
    browser.setTitle(window.props.title);
    if (app.props.devTools && ENV.isDev) {
      browser.webContents.openDevTools({ mode: 'undocked' });
    }
    browser.show();
  });

  // Prepare URL.
  const url = await getUrl({ host, app: args.app });
  browser.loadURL(url.toString());

  // Finish up.
  logWindow({ ...args, window, sandbox });
  return { ref, browser, url, app: args.app, window: args.window };
}

/**
 * [Helpers]
 */

function updateBounds(args: { window: t.IAppWindowModel; browser: BrowserWindow }) {
  const { window, browser } = args;
  const { width, height, x, y } = browser.getBounds();
  const props = window.props;
  props.width = width;
  props.height = height;
  props.x = x;
  props.y = y;
}
