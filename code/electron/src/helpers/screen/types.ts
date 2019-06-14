import { BrowserWindow } from 'electron';
import { Observable } from 'rxjs';
import * as t from '../../types';

export * from '../../types';

/**
 * General context accompanying a screen.
 */
export type IScreenContext<M extends t.IpcMessage = any, S extends t.StoreJson = any> = {
  readonly log: t.ILog;
  readonly settings: t.IStoreClient<S>;
  readonly ipc: t.IpcClient<M>;
  readonly windows: t.IWindows;
};

/**
 * A factory for screens of any type.
 */
export type IScreenFactory<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
> = IScreenContext<M, S> & {
  events$: Observable<ScreenEvent>;
  instances: Array<t.IScreen<M, S>>;
  create(args: {
    type: string;
    url: string;
    uid: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
    bounds?: Partial<Electron.Rectangle>; // Explicit bounds to use that override state and/or the default bounds in the `window` options.
  }): IScreen<M, S>;
  type(args: {
    type: string;
    url: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
  }): IScreenTypeFactory<M, S>;
};

/**
 * A factory for screens of a single type.
 */
export type IScreenTypeFactory<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
> = IScreenContext<M, S> & {
  type: string;
  events$: Observable<ScreenEvent>;
  instances: Array<t.IScreen<M, S>>;
  create(args: {
    uid: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
    bounds?: Partial<Electron.Rectangle>; // Explicit bounds to use that override state and/or the default bounds in the `window` options.
  }): IScreen<M, S>;
};

/**
 * A screen instance.
 */
export type IScreen<M extends t.IpcMessage = any, S extends t.StoreJson = any> = IScreenContext<
  M,
  S
> & {
  readonly uid: string;
  readonly type: string;
  readonly window: BrowserWindow;
  readonly tags: t.IWindowTag[];
  readonly dispose$: Observable<{}>;
  readonly events$: Observable<ScreenEvent>;
  readonly change$: Observable<IScreenChange>;
  readonly close$: Observable<IScreenChange>;
};

/**
 * [Events]
 */
export type ScreenEvent = IScreenChangeEvent;

export type IScreenChangeEvent = {
  type: '@platform/SCREEN/window/change';
  payload: IScreenChange;
};
export type IScreenChange = t.IWindowChange & { screen: string };
