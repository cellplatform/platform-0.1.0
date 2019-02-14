import { IpcMessage, StoreJson, IContext, IMainLog } from '../types';
import { WindowsMain } from '../helpers/windows/main';

export type IMain<
  M extends IpcMessage = any,
  S extends StoreJson = any
> = IContext & {
  log: IMainLog;
  windows: WindowsMain;
};
