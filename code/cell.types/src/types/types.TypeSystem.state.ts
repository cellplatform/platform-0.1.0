import { t } from '../common';

/**
 * State machine for a sheet.
 */
export type ITypedSheetState<T> = {
  readonly change$: t.Observable<t.ITypedSheetChange>;
  readonly changed$: t.Observable<t.ITypedSheetStateChange>;
  readonly changes: ITypedSheetStateChanges;
  readonly fetch: t.ISheetFetcher;
};

/**
 * Represents a single change within a sheet.
 */
export type ITypedSheetStateChange<D extends t.ICellData = t.ICellData> = {
  uri: string;
  from: D;
  to: D;
};

export type ITypedSheetStateChanges = {
  [uri: string]: ITypedSheetStateChange;
};
