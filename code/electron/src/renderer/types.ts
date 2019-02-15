import * as React from 'react';
import { IpcMessage, IRendererContext, StoreJson } from '../types';
import { WindowsRenderer } from '../helpers/windows/renderer';

export type IRenderer<
  M extends IpcMessage = any,
  S extends StoreJson = any
> = IRendererContext & {
  Provider: React.FunctionComponent;
  windows: WindowsRenderer;
};

export * from '../types';
