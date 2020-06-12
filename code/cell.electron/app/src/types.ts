import * as t from '@platform/cell.types';

export * from './types.g';

import { App } from './types.g';

export type AppEvent = t.TypedSheetEvent | t.IpcEvent;

export type IContext = {
  host: string;
  client: t.IClientTypesystem;
  sheet: t.ITypedSheet<App>;
  apps: t.ITypedSheetData<App>;
  windowRefs: IWindowRef[];
};

export type IWindowRef = {
  uri: string;
  send<T>(channel: string, payload: T): void;
};
