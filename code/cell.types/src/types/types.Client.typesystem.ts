import { t } from '../common';

type N = string | t.INsUri;

export type IClientTypesystem = {
  readonly http: t.IHttpClient;
  readonly fetch: t.ISheetFetcher;
  readonly cache: t.IMemoryCache;
  readonly changes: t.ITypedSheetChangeMonitor;
  sheet<T>(ns: N): Promise<t.ITypedSheet<T>>;
  defs(ns: N | N[]): Promise<t.INsTypeDef[]>;
  typescript(
    ns: N | N[],
    options?: { header?: boolean; exports?: boolean; imports?: boolean },
  ): Promise<t.ITypeClientTypescript>;
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
  target: string;
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetStateChanges;
};

export type ITypedSheetSavedEvent = {
  type: 'SHEET/saved';
  payload: ITypedSheetSaved;
};
export type ITypedSheetSaved = {
  ok: boolean;
  target: string;
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetStateChanges;
  errors: { ns: string; error: t.IHttpError }[];
};
