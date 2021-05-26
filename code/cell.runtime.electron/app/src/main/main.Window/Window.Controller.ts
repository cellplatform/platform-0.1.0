import { BrowserWindow } from 'electron';
import { takeUntil } from 'rxjs/operators';

import { constants, ENV, rx, t, RuntimeUri, R } from '../common';
import { WindowEvents } from './Window.Events';

type WindowRef = {
  tx: string;
  uri: t.ElectronWindowUri;
  browser: BrowserWindow;
};

/**
 * Controller logic for working with Electron windows.
 */
export function WindowController(args: { bus: t.EventBus<any>; host: string }) {
  const { host } = args;
  const bus = rx.busAsType<t.WindowEvent>(args.bus);
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
      const { tx, url, props } = e;

      const PROCESS = constants.PROCESS;
      console.log('ENV.isDev', ENV.isDev);
      const argv = [
        ENV.isDev ? PROCESS.DEV : '',
        `${PROCESS.RUNTIME}=${'cell.runtime.electron'}@${ENV.pkg.version}`,
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
          sandbox: true, // https://www.electronjs.org/docs/api/sandbox-option
          nodeIntegration: false, // NB: Obsolete (see `contextIsolation`) but leaving around for safety.
          contextIsolation: true, // https://www.electronjs.org/docs/tutorial/context-isolation
          enableRemoteModule: false,
          preload: constants.paths.bundle.preload,
          additionalArguments: argv,
        },
      });
      const id = browser.id;
      const uri = RuntimeUri.window.create(id);
      refs = [...refs, { tx, uri, browser }];

      const fireChanged = (
        action: t.ElectronWindowChanged['action'],
        bounds?: t.ElectronWindowChanged['bounds'],
      ) => {
        bus.fire({
          type: 'runtime.electron/window/changed',
          payload: {
            uri,
            action,
            bounds: bounds ?? { width: -1, height: -1, x: -1, y: -1 },
          },
        });
      };

      /**
       * Remove reference when closed.
       */
      browser.once('closed', () => {
        refs = refs.filter((ref) => ref.tx !== tx);
        fireChanged('close');
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
          type: 'runtime.electron/window/create:res',
          payload: { tx, isVisible },
        });
      });

      browser.loadURL(url);
    });

  /**
   * Window status.
   */
  rx.payload<t.WindowsStatusReqEvent>($, 'runtime.electron/windows/status:req')
    .pipe()
    .subscribe((e) => {
      const { tx } = e;
      const windows: t.ElectronWindowStatus[] = refs.map(({ uri, browser }) => {
        return {
          uri,
          url: browser.webContents.getURL(),
          title: browser.getTitle(),
          bounds: browser.getBounds(),
          isVisible: browser.isVisible(),
        };
      });
      bus.fire({
        type: 'runtime.electron/windows/status:res',
        payload: { tx, windows },
      });
    });

  /**
   * Window change requests (eg, move, resize).
   */
  rx.payload<t.WindowChangeEvent>($, 'runtime.electron/window/change')
    .pipe()
    .subscribe((e) => {
      const browser = refs.find((ref) => ref.uri === e.uri)?.browser;
      if (!browser) return;

      console.log('e', e);

      if (e.bounds) {
        const { x, y, width, height } = e.bounds;
        const current = browser.getBounds();
        browser.setBounds({
          x: x ?? current.x,
          y: y ?? current.y,
          width: width ?? current.width,
          height: height ?? current.height,
        });
      }

      if (typeof e.isVisible === 'boolean') {
        if (e.isVisible && !browser.isVisible()) browser.show();
        if (!e.isVisible && browser.isVisible()) browser.hide();
      }
    });

  /**
   * IPC send requests.
   */
  rx.payload<t.IpcSendEvent>($, 'runtime.electron/ipc/send')
    .pipe()
    .subscribe((e) => {
      //
      /**
       * TODO 🐷
       */
      console.log('send', e);

      const { targets, event } = e;
      const channel = constants.IPC.CHANNEL;

      const windows = refs.filter((ref) => targets.includes(ref.uri));

      windows.forEach(({ browser }) => browser.webContents.send(channel, event));
    });

  /**
   * API
   */
  return {
    dispose$,
    dispose,
  };
}
