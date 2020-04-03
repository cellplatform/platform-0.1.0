import { t } from '../common';

/**
 * [Events]
 */
export type TypedSheetEvent =
  | ITypedSheetChangeEvent
  | ITypedSheetChangedEvent
  | ITypedSheetRevertedEvent;

/**
 * Dispatches a change to a cell's data.
 */
export type ITypedSheetChangeEvent = {
  type: 'SHEET/change';
  payload: ITypedSheetChange;
};
export type ITypedSheetChange = {
  cell: string;
  data: t.ICellData<any>;
};

export type ITypedSheetChangedEvent = {
  type: 'SHEET/changed';
  payload: t.ITypedSheetChanged;
};
export type ITypedSheetChanged = {
  ns: string; // URI.
  change: t.ITypedSheetStateChange;
  changes: t.ITypedSheetStateChanges;
};

export type ITypedSheetRevertedEvent = {
  type: 'SHEET/reverted';
  payload: t.ITypedSheetReverted;
};
export type ITypedSheetReverted = {
  ns: string; // URI.
  from: t.ITypedSheetStateChanges;
  to: t.ITypedSheetStateChanges;
};
