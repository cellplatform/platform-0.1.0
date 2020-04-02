import { t } from '../common';

/**
 * State machine for a sheet.
 */
export type ITypedSheetState<T> = {
  readonly uri: t.INsUri;
  readonly fetch: t.ISheetFetcher;

  readonly change$: t.Observable<t.ITypedSheetChange>;
  readonly changed$: t.Observable<t.ITypedSheetChanged>;
  readonly changes: ITypedSheetStateChanges;
  readonly hasChanges: boolean;
  getCell(key: string): Promise<t.ICellData | undefined>;
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
  [key: string]: ITypedSheetStateChange;
};
