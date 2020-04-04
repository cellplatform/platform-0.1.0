import { t } from '../common';

/**
 * [Events]
 */
export type TypedSheetEvent =
  | ITypedSheetLoadingEvent
  | ITypedSheetLoadedEvent
  | ITypedSheetChangeEvent
  | ITypedSheetChangedEvent
  | ITypedSheetRevertedEvent;

/**
 * Fires when a sheet cursor commences loading.
 */
export type ITypedSheetLoadingEvent = {
  type: 'SHEET/loading';
  payload: ITypedSheetLoading;
};
export type ITypedSheetLoading = {
  ns: string; // URI.
  range: string; // row range, eg: "1:500"
};

/**
 * Fires when a sheet cursor completed a load operation.
 */
export type ITypedSheetLoadedEvent = {
  type: 'SHEET/loaded';
  payload: ITypedSheetLoaded;
};
export type ITypedSheetLoaded = ITypedSheetLoading & {
  total: number; // Total number of rows within the database.
};

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

/**
 * Fired after a change update has completed.
 */
export type ITypedSheetChangedEvent = {
  type: 'SHEET/changed';
  payload: t.ITypedSheetChanged;
};
export type ITypedSheetChanged = {
  ns: string; // URI.
  change: t.ITypedSheetStateChange;
  changes: t.ITypedSheetStateChanges;
};

/**
 * Fires when a set of changes are reverted.
 */
export type ITypedSheetRevertedEvent = {
  type: 'SHEET/reverted';
  payload: t.ITypedSheetReverted;
};
export type ITypedSheetReverted = {
  ns: string; // URI.
  from: t.ITypedSheetStateChanges;
  to: t.ITypedSheetStateChanges;
};
