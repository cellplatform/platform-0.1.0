import { BrowserWindow } from 'electron';
import { takeUntil } from 'rxjs/operators';

import { constants, ENV, rx, t } from '../common';
import { WindowEvents } from './Window.Events';

type WindowRef = {
  tx: string;
  url: string;
  browser: BrowserWindow;
};

/**
 * Controller logic for working with Electron windows.
 */
export function WindowController(args: { bus: t.EventBus<any>; host: string }) {
  const { host } = args;
  const bus = rx.busAsType<t.ElectronWindowEvent>(args.bus);
  const events = WindowEvents({ bus });
  const { dispose, dispose$ } = events;
  const $ = bus.$.pipe(takeUntil(dispose$));

  let refs: WindowRef[] = [];

  /**
   * Window creation.
   */
  rx.payload<t.ElectronWindowCreateReqEvent>($, 'runtime.electron/window/create:req')
    .pipe()
    .subscribe(async (e) => {
      console.log('creeate', e);
      const { tx, url, props, showOnLoad = true } = e;

      const PROCESS = constants.PROCESS;
      console.log('ENV.isDev', ENV.isDev);
      // const argv = [ENV.isDev ? PROCESS.DEV : '', `${PROCESS.HOST}=${host}`].filter(Boolean);
      const argv: string[] = [];

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
          sandbox: true, // https://www.electronjs.org/docs/api/sandbox-option
          nodeIntegration: false, // NB: Obsolete (see `contextIsolation`) but leaving around for safety.
          contextIsolation: true, // https://www.electronjs.org/docs/tutorial/context-isolation
          enableRemoteModule: false,
          preload: constants.paths.bundle.preload,
          additionalArguments: argv,
        },
      });
      const id = browser.id;
      refs = [...refs, { tx, url, browser }];

      /**
       * Remove reference when closed.
       */
      browser.once('closed', () => {
        refs = refs.filter((ref) => ref.tx !== tx);
        const bounds = { width: -1, height: -1, x: -1, y: -1 };
        bus.fire({
          type: 'runtime.electron/window/changed',
          payload: { id, action: 'closed', bounds },
        });
      });

      /**
       * Track changes.
       */
      browser.on('resize', () => {
        bus.fire({
          type: 'runtime.electron/window/changed',
          payload: { id, action: 'resized', bounds: browser.getBounds() },
        });
      });
      browser.on('move', () => {
        bus.fire({
          type: 'runtime.electron/window/changed',
          payload: { id, action: 'moved', bounds: browser.getBounds() },
        });
      });

      /**
       * Show and alert listeners when complete.
       */
      browser.once('ready-to-show', () => {
        if (e.devTools && ENV.isDev) {
          const mode = typeof e.devTools === 'string' ? e.devTools : 'undocked';
          browser.webContents.openDevTools({ mode });
        }

        if (showOnLoad) browser.show();

        bus.fire({
          type: 'runtime.electron/window/create:res',
          payload: { tx, isShowing: showOnLoad },
        });
      });

      browser.loadURL(url);
    });

  /**
   * Window status.
   */
  rx.payload<t.ElectronWindowsStatusReqEvent>($, 'runtime.electron/windows/status:req')
    .pipe()
    .subscribe((e) => {
      const { tx } = e;
      const windows: t.ElectronWindowStatus[] = refs.map(({ url, browser }) => {
        return {
          url,
          id: browser.id,
          title: browser.getTitle(),
          bounds: browser.getBounds(),
        };
      });
      bus.fire({
        type: 'runtime.electron/windows/status:res',
        payload: { tx, windows },
      });
    });

  /**
   * API
   */
  return {
    dispose$,
    dispose,
  };
}
