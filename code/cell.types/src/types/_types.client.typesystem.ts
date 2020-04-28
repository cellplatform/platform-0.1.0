import { t } from '../common';

type N = string | t.INsUri;

export type IClientTypesystem = {
  readonly http: t.IHttpClient;
  readonly fetch: t.ISheetFetcher;
  readonly changes: t.ITypedSheetChangeMonitor;
  defs(ns: N | N[]): Promise<t.INsTypeDef[]>;
  typescript(ns: N | N[]): Promise<t.ITypeClientTypescript>;
  sheet<T>(ns: N): Promise<t.ITypedSheet<T>>;
};

/**
 * Save monitor.
 */

export type ITypedSheetPendingChanges = { [ns: string]: t.ITypedSheetStateChanges };

/**
 * Save monitor (events).
 */
export type ITypedSheetSaveEvent = ITypedSheetSavingEvent | ITypedSheetSavedEvent;

export type ITypedSheetSavingEvent = {
  type: 'SHEET/saving';
  payload: ITypedSheetSaving;
};
export type ITypedSheetSaving = {
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetStateChanges;
};

export type ITypedSheetSavedEvent = {
  type: 'SHEET/saved';
  payload: ITypedSheetSaved;
};
export type ITypedSheetSaved = {
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetStateChanges;
};
