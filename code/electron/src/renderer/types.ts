import * as React from 'react';
import { IpcMessage, IRendererContext, StoreJson } from '../types';

export type IRenderer<
  M extends IpcMessage = any,
  S extends StoreJson = any
> = IRendererContext & {
  Provider: React.FunctionComponent;
};
