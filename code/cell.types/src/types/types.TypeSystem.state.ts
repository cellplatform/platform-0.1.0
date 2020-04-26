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
  uri: string;
  to: D;
};
export type ITypedSheetChangeNsDiff<D extends N = N> = ITypedSheetChangeNs<D> & { from: D };

/**
 * An individual cell change within a sheet.
 */
type C = t.ICellData;
export type ITypedSheetChangeCell<D extends C = C> = {
  kind: 'CELL';
  uri: string;
  to: D;
};
export type ITypedSheetChangeCellDiff<D extends C = C> = ITypedSheetChangeCell & { from: D };
