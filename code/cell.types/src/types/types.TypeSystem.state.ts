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
 * CHANGES
 */
export type ITypedSheetStateChanges = {
  ns?: ITypedSheetStateChangedNs;
  cells?: { [key: string]: ITypedSheetStateChangedCell };
};

export type ITypedSheetStateChange = ITypedSheetStateChangeNs | ITypedSheetStateChangeCell;
export type ITypedSheetStateChanged = ITypedSheetStateChangedNs | ITypedSheetStateChangedCell;

/**
 * A change to the namespace
 */
type N = t.INsData;
export type ITypedSheetStateChangeNs<D extends N = N> = {
  kind: 'NS';
  uri: string;
  to: D;
};
export type ITypedSheetStateChangedNs<D extends N = N> = ITypedSheetStateChangeNs<D> & { from: D };

/**
 * An individual cell change within a sheet.
 */
type C = t.ICellData;
export type ITypedSheetStateChangeCell<D extends C = C> = {
  kind: 'CELL';
  uri: string;
  from: D;
  to: D;
};
export type ITypedSheetStateChangedCell<D extends C = C> = ITypedSheetStateChangeCell & { from: D };
