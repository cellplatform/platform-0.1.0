import { app, BrowserWindow } from 'electron';
import * as S from 'electron-window-state';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, share, takeUntil } from 'rxjs/operators';

import { defaultValue, t } from './common';

const TAG_TYPE = 'type';
const WindowState = require('electron-window-state');

export class ScreenFactory<M extends t.IpcMessage = any, S extends t.StoreJson = any>
  implements t.IScreenFactory<M, S> {
  /**
   * [Lifecycle]
   */
  constructor(args: {
    log: t.ILog;
    ipc: t.IpcClient<M>;
    settings: t.IStoreClient<S>;
    windows: t.IWindows;
  }) {
    const { windows } = args;

    this.log = args.log;
    this.settings = args.settings;
    this.ipc = args.ipc;
    this.windows = windows;

    /**
     * Pipe window events.
     */
    windows.change$.pipe(takeUntil(this.dispose$)).subscribe(e => {
      const tag = e.window.tags.find(({ tag }) => tag === TAG_TYPE);
      if (tag && typeof tag.value === 'string') {
        const screen = tag.value as string;
        const payload: t.IScreenChange = { ...e, screen };
        this.fire({ type: '@platform/SCREEN/window/change', payload });
      }
    });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  public readonly log: t.ILog;
  public readonly settings: t.IStoreClient<S>;
  public readonly ipc: t.IpcClient<M>;
  public readonly windows: t.IWindows;

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.ScreenEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  public readonly change$ = this.events$.pipe(
    filter(e => e.type === '@platform/SCREEN/window/change'),
    map(e => e.payload as t.IScreenChange),
    share(),
  );

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
        this.windows.tag(window.id, { tag: TAG_TYPE, value: type });
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

    const events$ = this.events$.pipe(filter(e => e.payload.type === type));
    const change$ = events$.pipe(
      filter(e => e.type === '@platform/SCREEN/window/change'),
      map(e => e.payload as t.IScreenChange),
    );

    return {
      type,
      log: this.log,
      settings: this.settings,
      ipc: this.ipc,
      windows: this.windows,
      events$,
      change$,
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

  /**
   * [Helpers]
   */
  private fire(e: t.ScreenEvent) {
    this._events$.next(e);
  }
}
