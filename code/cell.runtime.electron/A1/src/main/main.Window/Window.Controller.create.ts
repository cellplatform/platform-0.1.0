import { BrowserWindow } from 'electron';

import { constants, ENV, RuntimeUri, rx, t } from '../common';
import { WindowRef } from './types';

/**
 * Controller for creating new browser windows.
 */
export function WindowCreationController(args: {
  bus: t.EventBus<t.WindowEvent>;
  events: t.WindowEvents;
  broadcastStatus: () => void; // Send latest status to all windows.
}) {
  const { events, bus, broadcastStatus } = args;
  const $ = events.$;
  let refs: WindowRef[] = [];

  /**
   * Window creation.
   */
  rx.payload<t.WindowCreateReqEvent>($, 'runtime.electron/Window/create:req')
    .pipe()
    .subscribe(async (e) => {
      const { tx, url, props } = e;
      const uri = RuntimeUri.window.create();

      // Generate constants to pass into the browser process.
      const PROCESS = constants.PROCESS;
      const argv = [
        ENV.isDev ? PROCESS.DEV : '',
        `${PROCESS.RUNTIME}=${'cell.runtime.electron'}@${ENV.pkg.version}`,
        `${PROCESS.URI_SELF}=${uri}`,
      ].filter(Boolean);

      const browser = new BrowserWindow({
        show: false,

        x: props.x,
        y: props.y,
        width: props.width ?? 800,
        height: props.height ?? 600,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
        maxWidth: props.maxWidth,
        maxHeight: props.maxHeight,
        title: props.title,
        titleBarStyle: 'hiddenInset',
        transparent: true,
        vibrancy: 'selection',
        acceptFirstMouse: true,

        webPreferences: {
          sandbox: true, //           https://www.electronjs.org/docs/api/sandbox-option
          contextIsolation: true, //  https://www.electronjs.org/docs/tutorial/context-isolation
          nodeIntegration: false, //  NB: Obsolete (see `contextIsolation`) but leaving around for safety.
          allowRunningInsecureContent: false, // NB: Default:false - but explicitly set false for good measure.
          additionalArguments: argv,
          preload: constants.Paths.preload,
        },
      });

      // SECURITY: Prevent un-controlled creation of new windows from within the loaded page.
      browser.webContents.setWindowOpenHandler((e) => ({ action: 'deny' }));

      // Store reference to the browser instance.
      const id = browser.id;
      refs = [...refs, { id, uri, browser }];

      const fireChanged = (
        action: t.WindowChanged['action'],
        windowBounds?: t.WindowChanged['bounds'],
      ) => {
        const bounds = windowBounds ?? { width: -1, height: -1, x: -1, y: -1 };
        bus.fire({
          type: 'runtime.electron/Window/changed',
          payload: { uri, action, bounds },
        });
      };

      /**
       * Remove reference when closed.
       */
      browser.once('closed', () => {
        refs = refs.filter((ref) => ref.uri !== uri);
        fireChanged('close');
        broadcastStatus(); // NB: This will cause all other windows to get the current state of windows.
      });

      /**
       * Track changes and alert listeners.
       */
      browser.on('resize', () => fireChanged('resize', browser.getBounds()));
      browser.on('move', () => fireChanged('move', browser.getBounds()));

      /**
       * Show and alert listeners when browser creation is complete.
       */
      browser.once('ready-to-show', () => {
        if (e.devTools && ENV.isDev) {
          const mode = typeof e.devTools === 'string' ? e.devTools : 'undocked';
          browser.webContents.openDevTools({ mode });
        }

        const isVisible = props.isVisible ?? true;
        if (isVisible) browser.show();

        bus.fire({
          type: 'runtime.electron/Window/create:res',
          payload: { tx, uri, isVisible },
        });
      });

      browser.loadURL(url);
    });

  /**
   * Api
   */
  return {
    get refs() {
      return refs;
    },
  };
}
