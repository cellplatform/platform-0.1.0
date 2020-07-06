import * as t from '@platform/cell.types';
import { Observable } from 'rxjs';

import { App } from './types.g';

export * from './types.g';

export type AppEvent = t.TypedSheetEvent | t.IpcEvent;

export type IContext = {
  client: t.IClientTypesystem;
  sheet: t.ITypedSheet<App>;
  apps: t.ITypedSheetData<App>;
  windowRefs: IWindowRef[];
  event$: Observable<AppEvent>;
};

export type IWindowRef = {
  uri: string;
  send<T>(channel: string, payload: T): void;
};
