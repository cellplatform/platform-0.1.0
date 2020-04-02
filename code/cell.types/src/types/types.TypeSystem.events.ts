import { t } from '../common';

/**
 * [Events]
 */
export type TypedSheetEvent = ITypedSheetChangeEvent | ITypedSheetChangedEvent;

/**
 * Dispatches a change to a cell's data.
 */
export type ITypedSheetChangeEvent = {
  type: 'SHEET/change';
  payload: ITypedSheetChange;
};
export type ITypedSheetChange = {
  uri: string;
  data: t.ICellData<any>;
};

export type ITypedSheetChangedEvent = {
  type: 'SHEET/changed';
  payload: t.ITypedSheetChanged;
};
export type ITypedSheetChanged = {
  change: t.ITypedSheetStateChange;
  changes: t.ITypedSheetStateChanges;
};
