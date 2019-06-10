import { app, BrowserWindow } from 'electron';
import * as S from 'electron-window-state';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { t, defaultValue } from './common';

const WindowState = require('electron-window-state');

export class ScreenFactory<M extends t.IpcMessage = any, S extends t.StoreJson = any>
  implements t.IScreenContext<M, S> {
  /**
   * [Lifecycle]
   */
  constructor(args: {
    log: t.ILog;
    ipc: t.IpcClient<M>;
    settings: t.IStoreClient<S>;
    windows: t.IWindows;
  }) {
    this.log = args.log;
    this.settings = args.settings;
    this.ipc = args.ipc;
    this.windows = args.windows;
  }

  /**
   * [Fields]
   */
  public readonly log: t.ILog;
  public readonly settings: t.IStoreClient<S>;
  public readonly ipc: t.IpcClient<M>;
  public readonly windows: t.IWindows;

  /**
   * [Methods]
   */
  public create(args: {
    type: string;
    url: string;
    uid: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
    bounds?: Partial<Electron.Rectangle>; // Explicit bounds to use that override state and/or the default bounds in the `window` options.
  }) {
    const { window: options = {}, uid, type, bounds = {} } = args;
    const isStateful = defaultValue(args.isStateful, true);

    if (!app.isReady) {
      throw new Error(`Cannot create window '${type}:${uid}' before app is ready.`);
    }

    /**
     * Setup window state manager (bounds).
     */
    const file = `window-state/${type}-${uid}.json`;
    const state: S.State = WindowState({
      defaultWidth: options.width,
      defaultHeight: options.height,
      file,
    });

    // Determine the bounds.
    let x = options.x;
    let y = options.y;
    let width = options.width;
    let height = options.height;

    if (isStateful) {
      x = defaultValue(state.x, x);
      y = defaultValue(state.y, y);
      width = defaultValue(state.width, width);
      height = defaultValue(state.height, height);
    }

    if (bounds) {
      x = defaultValue(bounds.x, x);
      y = defaultValue(bounds.y, y);
      width = defaultValue(bounds.width, width);
      height = defaultValue(bounds.height, height);
    }

    /**
     * Create the window.
     */
    const window = new BrowserWindow({
      show: false,
      acceptFirstMouse: true,
      ...options,
      x,
      y,
      width,
      height,
      webPreferences: {
        nodeIntegration: true, // Ensure `process` and other node related features are available to the window.
      },
    });

    window.once('ready-to-show', () => {
      if (type) {
        this.windows.tag(window.id, { tag: 'type', value: type });
      }
      if (options.title) {
        window.setTitle(options.title);
      }
      window.show();
    });

    /**
     * Update state on change.
     */
    if (isStateful) {
      const saveState = () => state.saveState(window);
      const state$ = new Subject<{}>();
      state$.pipe(debounceTime(200)).subscribe(() => saveState());
      window.on('moved', () => state$.next());
      window.on('resize', () => state$.next());
      window.on('closed', () => saveState());
    }

    /**
     * Load URL.
     */
    window.loadURL(args.url);
    return window;
  }

  /**
   * Create a factory for generating a specific type of window.
   */
  public type(args: {
    type: string;
    url: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
  }): t.IScreenTypeFactory<M, S> {
    const { type, url, isStateful, window: options } = args;
    return {
      type,
      log: this.log,
      settings: this.settings,
      ipc: this.ipc,
      windows: this.windows,
      create: args => {
        return this.create({
          type,
          url,
          uid: args.uid,
          isStateful: defaultValue(args.isStateful, isStateful),
          window: { ...options, ...args.window },
          bounds: args.bounds,
        });
      },
    };
  }
}
