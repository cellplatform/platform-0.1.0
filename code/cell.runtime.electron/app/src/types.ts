import * as t from './common/types';
import { Observable } from 'rxjs';
import { IServerLog } from '@platform/log/lib/server/types';

/**
 * Events used by the Electron application.
 */
export type AppEvent = t.TypedSheetEvent | t.IpcEvent;

/**
 * Context passed around the Electron application.
 */
export type IContext = {
  client: t.IClientTypesystem;
  sheet: t.ITypedSheet<t.AppTypeIndex>;
  apps: t.ITypedSheetData<t.AppTypeIndex, 'App'>;
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

export type IAppPaths = {
  dir: string;
  db: string;
  fs: string;
  config: string;
  archive: string;
};

/**
 * [Logging]
 */

export type IElectronLog = IServerLog & { file: { path: string }; format: IElectronLogFormat };

export type IElectronLogFormat = {
  uri(input?: string | t.IUri): string;
};
