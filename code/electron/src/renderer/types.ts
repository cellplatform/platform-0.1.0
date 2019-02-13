import * as React from 'react';
import { IpcMessage, StoreJson, IContext } from '../types';

export type IRenderer<
  M extends IpcMessage = any,
  S extends StoreJson = any
> = IContext & {
  Context: React.Context<IContext>;
  Provider: React.FunctionComponent;
};
