import * as t from './common/types';
import { Observable } from 'rxjs';

/**
 * Events used by the Electron application.
 */
export type AppEvent = t.TypedSheetEvent | t.IpcEvent;

/**
 * Context passed around the Electron application.
 */
export type IContext = {
  client: t.IClientTypesystem;
  sheet: t.ITypedSheet<t.App>;
  apps: t.ITypedSheetData<t.App>;
  windowRefs: IWindowRef[];
  event$: Observable<AppEvent>;
};

/**
 * Referennce to a single Electron browser window.
 */
export type IWindowRef = {
  uri: string;
  send<T>(channel: string, payload: T): void;
};
