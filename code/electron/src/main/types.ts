export * from '../helpers/screen/types';

import { IpcMessage, StoreJson, IContext, IMainLog } from '../types';

export type IMain<M extends IpcMessage = any, S extends StoreJson = any> = IContext<M, S> & {
  log: IMainLog;
};
