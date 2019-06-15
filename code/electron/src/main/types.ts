export * from '../helpers/screen/types';

import { IpcMessage, SettingsJson, IContext, IMainLog } from '../types';

export type IMain<M extends IpcMessage = any, S extends SettingsJson = any> = IContext<M, S> & {
  log: IMainLog;
};
