import { IpcMessage, StoreJson, IContext, IMainLog } from '../types';

export type IMain<M extends IpcMessage = any, S extends StoreJson = any> = IContext & {
  log: IMainLog;
};
