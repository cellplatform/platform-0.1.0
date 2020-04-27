import { t } from '../common';

/**
 * State machine for a sheet.
 */
export type ITypedSheetState = {
  readonly uri: t.INsUri;
  readonly fetch: t.ISheetFetcher;

  readonly dispose$: t.Observable<{}>;
  readonly event$: t.Observable<t.TypedSheetEvent>;
  readonly change$: t.Observable<t.ITypedSheetChange>;
  readonly changed$: t.Observable<t.ITypedSheetChanged>;
  readonly changes: ITypedSheetStateChanges;

  readonly hasChanges: boolean;
  readonly isDisposed: boolean;

  clearChanges(action: t.ITypedSheetChangesCleared['action']): void;
  clearCache(): void;
};

/**
 * CHANGES
 */
export type ITypedSheetStateChanges = {
  ns?: ITypedSheetChangeNsDiff;
  cells?: { [key: string]: ITypedSheetChangeCellDiff };
};

export type ITypedSheetChange = ITypedSheetChangeNs | ITypedSheetChangeCell;
export type ITypedSheetChangeDiff = ITypedSheetChangeNsDiff | ITypedSheetChangeCellDiff;

/**
 * A change to the namespace
 */
type N = t.INsProps;
export type ITypedSheetChangeNs<D extends N = N> = {
  kind: 'NS';
  ns: string;
  to: D;
};
export type ITypedSheetChangeNsDiff<D extends N = N> = ITypedSheetChangeNs<D> & { from: D };

/**
 * An individual cell change within a sheet.
 */
type C = t.ICellData;
export type ITypedSheetChangeCell<D extends C = C> = {
  kind: 'CELL';
  ns: string;
  key: string; // Key (eg "A1").
  to: D;
};
export type ITypedSheetChangeCellDiff<D extends C = C> = ITypedSheetChangeCell & { from: D };
