import { BrowserWindow } from 'electron';
import { takeUntil } from 'rxjs/operators';

import { constants, ENV, rx, t, RuntimeUri } from '../common';
import { WindowEvents } from './main.Window.Events';
import { IpcSysInfo } from './main.IpcSysInfo';

type WindowRef = {
  id: t.ElectronWindowId;
  uri: t.ElectronProcessWindowUri;
  browser: BrowserWindow;
};

/**
 * Controller logic for working with Electron windows.
 */
export function WindowController(args: { bus: t.EventBus<any> }) {
  const bus = rx.busAsType<t.WindowEvent>(args.bus);
  const events = WindowEvents({ bus });
  const { dispose, dispose$ } = events;
  const $ = bus.$.pipe(takeUntil(dispose$));

  let refs: WindowRef[] = [];
  const channel = constants.IPC.CHANNEL;
  const sys = IpcSysInfo({ channel, getRefs: () => refs }).listen();

  /**
   * Window creation.
   */
  rx.payload<t.ElectronWindowCreateReqEvent>($, 'runtime.electron/Window/create:req')
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
          enableRemoteModule: false,
          allowRunningInsecureContent: false, // NB: Default:false - but explicitly set false for good measure.
          additionalArguments: argv,
          preload: constants.paths.preload,
        },
      });

      // SECURITY: Prevent un-controlled creation of new windows from within the loaded page.
      browser.webContents.setWindowOpenHandler((e) => {
        // shell.openExternal(url);
        return { action: 'deny' };
      });

      // Store reference to the browser instance.
      const id = browser.id;
      refs = [...refs, { id, uri, browser }];

      const fireChanged = (
        action: t.ElectronWindowChanged['action'],
        windowBounds?: t.ElectronWindowChanged['bounds'],
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
        sys.broadcast(); // NB: This will cause all other windows to get the current state of windows.
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
   * Window status.
   */
  rx.payload<t.WindowStatusReqEvent>($, 'runtime.electron/Window/status:req')
    .pipe()
    .subscribe((e) => {
      const { tx } = e;
      const windows: t.ElectronWindowStatus[] = refs.map(({ id, uri, browser }) => {
        return {
          id,
          uri,
          url: browser.webContents.getURL(),
          title: browser.getTitle(),
          bounds: browser.getBounds(),
          isVisible: browser.isVisible(),
        };
      });
      bus.fire({
        type: 'runtime.electron/Window/status:res',
        payload: { tx, windows },
      });
    });

  /**
   * Window change requests (eg, move, resize).
   */
  rx.payload<t.WindowChangeEvent>($, 'runtime.electron/Window/change')
    .pipe()
    .subscribe((e) => {
      const browser = refs.find((ref) => ref.uri === e.uri)?.browser;
      if (!browser) return;

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
   * IPC: Broadcast event/data to windows.
   */
  rx.event<t.IpcMessageEvent>($, 'runtime.electron/ipc/msg')
    .pipe()
    .subscribe((e) => {
      const targets = e.payload.targets.filter((uri) => uri !== RuntimeUri.main);
      const windows = refs.filter((ref) => targets.includes(ref.uri));
      windows.forEach(({ browser }) => browser.webContents.send(channel, e));
    });

  /**
   * API
   */
  return {
    dispose$,
    dispose,
  };
}
