import { app, BrowserWindow } from 'electron';
import * as S from 'electron-window-state';
import { Subject } from 'rxjs';
import { debounceTime, filter, share, takeUntil, map } from 'rxjs/operators';

import { defaultValue, t, TAG } from './common';
import { Screen } from './Screen';

const WindowState = require('electron-window-state');

export class ScreenFactory<M extends t.IpcMessage = any, S extends t.SettingsJson = any>
  implements t.IScreenFactory<M, S> {
  /**
   * [Lifecycle]
   */
  constructor(args: {
    log: t.ILog;
    ipc: t.IpcClient<M>;
    settings: t.ISettingsClient<S>;
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
      const tag = e.window.tags.find(({ tag }) => tag === TAG.TYPE);
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
  public readonly settings: t.ISettingsClient<S>;
  public readonly ipc: t.IpcClient<M>;
  public readonly windows: t.IWindows;
  public instances: Array<t.IScreen<M, S>> = [];

  private readonly _dispose$ = new Subject<{}>();
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

  public readonly created$ = this.change$.pipe(
    filter(e => e.type === 'CREATED'),
    share(),
  );

  public readonly closed$ = this.change$.pipe(
    filter(e => e.type === 'CLOSED'),
    share(),
  );

  /**
   * [Properties]
   */
  public get context(): t.IScreenContext<M, S> {
    return {
      log: this.log,
      ipc: this.ipc,
      settings: this.settings,
      windows: this.windows,
    };
  }

  /**
   * [Methods]
   */
  public instance = (uid: string) => this.instances.find(s => s.uid === uid);
  public exists = (uid: string) => Boolean(this.instance(uid));

  public create(args: {
    type: string;
    url: string;
    uid?: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
    bounds?: Partial<Electron.Rectangle>; // Explicit bounds to use that override state and/or the default bounds in the `window` options.
  }) {
    const { window: options = {}, type, bounds = {} } = args;
    const uid = args.uid || type;
    const isStateful = defaultValue(args.isStateful, true);

    if (!app.isReady) {
      throw new Error(`Cannot create window '${type}:${uid}' before app is ready.`);
    }

    const existing = this.instances.find(s => s.uid === uid);
    if (existing) {
      existing.window.focus();
      return existing;
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

    /**
     * Assign tags to window.
     */
    this.windows.tag(window.id, { tag: TAG.UID, value: uid });
    if (type) {
      this.windows.tag(window.id, { tag: TAG.TYPE, value: type });
    }

    /**
     * Reveal window when loaded.
     */
    window.once('ready-to-show', () => {
      if (options.title) {
        window.setTitle(options.title);
      }

      // NB:  The initial CREATED event is not fired through the screen
      //      objects because that 'type' tag did not exist on the window
      //      at time of creation.
      this.fire({
        type: '@platform/SCREEN/window/change',
        payload: {
          type: 'CREATED',
          screen: type,
          window: this.windows.byId(window.id),
          state: this.windows.toObject(),
        },
      });

      window.show();
    });

    /**
     * Update stored state on change to window.
     */
    if (isStateful) {
      const saveState = () => state.saveState(window);
      const state$ = new Subject<{}>();
      state$.pipe(debounceTime(200)).subscribe(() => saveState());
      window.on('moved', () => state$.next());
      window.on('resize', () => state$.next());
      window.once('closed', () => saveState());
    }

    /**
     * Load URL.
     */
    window.loadURL(args.url);

    // Screen the [Screen] instance.
    const id = window.id;
    const ctx = this.context;
    const events$ = this.events$.pipe(filter(e => includesType(type, e.payload.window.tags)));
    const instance = new Screen({ ctx, uid, type, window, events$ });

    // Store reference to [Screen] instance.
    this.instances = [...this.instances, instance];
    window.once('close', () => {
      this.instances = this.instances.filter(s => s.window.id !== id);
    });

    // Finish up.
    return instance;
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
    const self = this; // tslint:disable-line
    const { type, url, isStateful, window } = args;
    const events$ = this.events$.pipe(filter(e => includesType(type, e.payload.window.tags)));
    const change$ = this.change$.pipe(filter(e => includesType(type, e.window.tags)));
    const created$ = change$.pipe(filter(e => e.type === 'CREATED'));
    const closed$ = change$.pipe(filter(e => e.type === 'CLOSED'));

    return {
      type,
      log: this.log,
      settings: this.settings,
      ipc: this.ipc,
      windows: this.windows,
      events$,
      change$,
      created$,
      closed$,
      get instances() {
        return self.instances.filter(s => s.type === type);
      },
      instance: this.instance,
      exists: this.exists,
      create: (options = {}) => {
        return this.create({
          type,
          url,
          uid: options.uid || type,
          isStateful: defaultValue(options.isStateful, isStateful),
          window: { ...window, ...options.window },
          bounds: options.bounds,
        });
      },
    };
  }

  private fire(e: t.ScreenEvent) {
    this._events$.next(e);
  }
}

/**
 * [Helpers]
 */
const includesType = (type: string, tags: t.IWindowTag[]) =>
  tags.some(item => item.tag === TAG.TYPE && item.value === type);
