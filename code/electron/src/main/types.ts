import { IpcMessage, StoreJson, IContext } from '../types';

export type IMain<
  M extends IpcMessage = any,
  S extends StoreJson = any
> = IContext & {
};
