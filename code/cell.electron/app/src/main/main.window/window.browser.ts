import { BrowserWindow } from 'electron';

import { constants, ENV, t } from '../common';
import { logWindow } from './window.log';
import { getUrl } from './window.url';

const PROCESS = constants.PROCESS;

export async function createBrowserWindow(args: {
  ctx: t.IContext;
  app: t.ITypedSheetRow<t.App>;
  window: t.ITypedSheetRow<t.AppWindow>;
}) {
  const { ctx } = args;
  const window = args.window.props;
  const app = args.app.props;
  const uri = args.window.uri.toString();
  const host = ctx.host;

  // Create the browser window.
  // Docs: https://www.electronjs.org/docs/api/browser-window
  const browser = new BrowserWindow({
    show: false,
    width: window.width,
    height: window.height,
    x: window.x,
    y: window.y,
    title: window.title,
    titleBarStyle: 'hiddenInset',
    backgroundColor: app.backgroundColor,
    webPreferences: {
      sandbox: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: constants.paths.bundle.preload,
      additionalArguments: [
        ENV.isDev ? PROCESS.DEV : '',
        `${PROCESS.HOST}=${host}`,
        `${PROCESS.WINDOW_URI}=${uri}`,
      ],
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
  browser.once('closed', () => (ctx.windowRefs = ctx.windowRefs.filter(item => item.uri !== uri)));
  browser.once('ready-to-show', () => {
    browser.setTitle(window.title);
    browser.webContents.openDevTools(); // TEMP 🐷
    browser.show();
  });

  // Prepare URL.
  const url = getUrl({ host, app: args.app });
  browser.loadURL(url.toString());

  // Finish up.
  logWindow(args);
  return { ref, browser, url, app: args.app, window: args.window };
}

/**
 * [Helpers]
 */

function updateBounds(args: {
  window: t.ITypedSheetRowProps<t.AppWindow>;
  browser: BrowserWindow;
}) {
  const { window, browser } = args;
  const { width, height, x, y } = browser.getBounds();
  window.width = width;
  window.height = height;
  window.x = x;
  window.y = y;
}
