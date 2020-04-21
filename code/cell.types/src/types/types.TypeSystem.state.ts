import { t } from '../common';

/**
 * State machine for a sheet.
 */
export type ITypedSheetState<T> = {
  readonly uri: t.INsUri;
  readonly fetch: t.ISheetFetcher;

  readonly dispose$: t.Observable<{}>;
  readonly change$: t.Observable<t.ITypedSheetChange>;
  readonly changed$: t.Observable<t.ITypedSheetChanged>;
  readonly changes: ITypedSheetStateChanges;

  readonly hasChanges: boolean;
  readonly isDisposed: boolean;

  getCell(key: string): Promise<t.ICellData | undefined>;
  clearChanges(action: t.ITypedSheetChangesCleared['action']): void;
  clearCache(): void;
};

/**
 * Represents a single change within a sheet.
 */
export type ITypedSheetStateChange<D extends t.ICellData = t.ICellData> = {
  cell: string; // URI
  from: D;
  to: D;
};

export type ITypedSheetStateChanges = {
  [key: string]: ITypedSheetStateChange;
};
