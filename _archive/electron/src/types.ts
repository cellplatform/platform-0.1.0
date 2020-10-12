import { IpcClient, IpcMessage } from './helpers/ipc/types';
import { ILog, IMainLog } from './helpers/logger/types';
import { ISettingsClient, SettingsJson } from './helpers/settings/types';
import { DevTools } from './helpers/devTools/renderer';
import { IWindows } from './helpers/windows/types';

export * from './renderer/types';
export * from './main/types';

export { ISettingsClient, IMainSettingsClient, SettingsJson } from './helpers/settings/types';

export { IpcMessage } from './helpers/ipc/types';
export {
  IWindows,
  IWindowsState,
  IWindowRef,
  IWindowTag,
  IWindowChange,
} from './helpers/windows/types';

export { ILog, IMainLog, IpcClient };
export type ProcessType = 'MAIN' | 'RENDERER';

export type IContext<M extends IpcMessage = any, S extends SettingsJson = any> = {
  id: number;
  ipc: IpcClient<M>;
  settings: ISettingsClient<S>;
  log: ILog;
  windows: IWindows;
};

export type IRendererContext<M extends IpcMessage = any, S extends SettingsJson = any> = IContext<
  M,
  S
> & {
  uid: string;
  devTools: DevTools;
  remote: Electron.Remote;
  window: Electron.BrowserWindow;
};

/**
 * Events
 */
export { SystemEvents } from './helpers/types';
