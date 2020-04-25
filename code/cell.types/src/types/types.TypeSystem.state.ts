import { t } from '../common';

/**
 * State machine for a sheet.
 */
export type ITypedSheetState = {
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
 *
 */
export type ITypedSheetStateChanges = {
  ns?: ITypedSheetStateChangedNs;
  cells?: { [key: string]: ITypedSheetStateChangedCell };
};

export type ITypedSheetStateChanged = ITypedSheetStateChangedNs | ITypedSheetStateChangedCell;

/**
 * A change to the namespace
 */
export type ITypedSheetStateChangedNs<D extends t.INsData = t.INsData> = {
  kind: 'NS';
  uri: string;
  from: D;
  to: D;
};

/**
 * An individual cell change within a sheet.
 */
export type ITypedSheetStateChangedCell<D extends t.ICellData = t.ICellData> = {
  kind: 'CELL';
  uri: string;
  from: D;
  to: D;
};
