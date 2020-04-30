import { t } from '../common';

type N = t.INsProps;
type C = t.ICellData;

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

  readonly change: {
    ns<D extends N = N>(to: D): void;
    cell<D extends C = C>(key: string, to: D): void;
  };

  readonly clear: {
    cache(): void;
    changes(action: t.ITypedSheetChangesCleared['action']): void;
  };
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
export type ITypedSheetChangeNs<D extends N = N> = {
  kind: 'NS';
  ns: string;
  to: D;
};
export type ITypedSheetChangeNsDiff<D extends N = N> = ITypedSheetChangeNs<D> & { from: D };

/**
 * An individual cell change within a sheet.
 */
export type ITypedSheetChangeCell<D extends C = C> = {
  kind: 'CELL';
  ns: string;
  key: string; // Key (eg "A1").
  to: D;
};
export type ITypedSheetChangeCellDiff<D extends C = C> = ITypedSheetChangeCell & { from: D };
