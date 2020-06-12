import { t } from '../common';

type N = t.INsProps;
type C = t.ICellData;

/**
 * A set of changes for a sheet.
 */
export type ITypedSheetChanges = {
  ns?: ITypedSheetChangeNsDiff;
  cells?: { [key: string]: ITypedSheetChangeCellDiff };
};

export type ITypedSheetChange = ITypedSheetChangeNs | ITypedSheetChangeCell;
export type ITypedSheetChangeDiff = ITypedSheetChangeNsDiff | ITypedSheetChangeCellDiff;

/**
 * A change to the namespace.
 */
export type ITypedSheetChangeNs<D extends N = N> = {
  kind: 'NS';
  ns: string;
  to: D;
};
export type ITypedSheetChangeNsDiff<D extends N = N> = ITypedSheetChangeNs<D> & { from: D };

/**
 * A change to an individual cell change within a sheet.
 */
export type ITypedSheetChangeCell<D extends C = C> = {
  kind: 'CELL';
  ns: string;
  key: string; // Key (eg "A1").
  to: D;
};
export type ITypedSheetChangeCellDiff<D extends C = C> = ITypedSheetChangeCell & { from: D };
