import { BrowserWindow } from 'electron';

import * as t from '../../../types';
export * from '../../../types';

export type IScreenContext<M extends t.IpcMessage = any, S extends t.StoreJson = any> = {
  readonly log: t.ILog;
  readonly settings: t.IStoreClient<S>;
  readonly ipc: t.IpcClient<M>;
  readonly windows: t.IWindows;
};

export type IScreenFactory<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
> = IScreenContext<M, S> & {
  create(args: {
    type: string;
    url: string;
    uid: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
    bounds?: Partial<Electron.Rectangle>; // Explicit bounds to use that override state and/or the default bounds in the `window` options.
  }): BrowserWindow;
  type(args: {
    type: string;
    url: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
  }): t.IScreenTypeFactory<M, S>;
};

export type IScreenTypeFactory<
  M extends t.IpcMessage = any,
  S extends t.StoreJson = any
> = IScreenContext<M, S> & {
  type: string;
  create(args: {
    uid: string;
    isStateful?: boolean;
    window?: Electron.BrowserWindowConstructorOptions;
    bounds?: Partial<Electron.Rectangle>; // Explicit bounds to use that override state and/or the default bounds in the `window` options.
  }): BrowserWindow;
};
