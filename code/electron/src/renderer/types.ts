import * as React from 'react';
import { IpcMessage, IRendererContext, StoreJson } from '../types';
import { WindowsRenderer } from '../helpers/windows/renderer';

export type IRenderer<M extends IpcMessage = any, S extends StoreJson = any> = IRendererContext<
  M,
  S
> & {
  Provider: React.FunctionComponent;
  windows: WindowsRenderer;
};

export * from '../types';

export type GetContext<M extends IpcMessage = any, S extends StoreJson = any> = (args: {
  context: IRendererContext<M, S>;
}) => Promise<any>;
