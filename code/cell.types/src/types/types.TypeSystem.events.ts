import { t } from '../common';

/**
 * [Events]
 */
export type TypedSheetEvent =
  | ITypedSheetLoadingEvent
  | ITypedSheetLoadedEvent
  | ITypedSheetRowLoadingEvent
  | ITypedSheetRowLoadedEvent
  | ITypedSheetChangeEvent
  | ITypedSheetChangedEvent
  | ITypedSheetChangesClearedEvent;

/**
 * Fires when a sheet cursor commences loading.
 */
export type ITypedSheetLoadingEvent = {
  type: 'SHEET/loading';
  payload: ITypedSheetLoading;
};
export type ITypedSheetLoading = {
  ns: string; // uri.
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
 * Fires when a sheet row commences loading.
 */
export type ITypedSheetRowLoadingEvent = {
  type: 'SHEET/row/loading';
  payload: ITypedSheetRowLoading;
};
export type ITypedSheetRowLoading = {
  index: number;
  row: string; // uri.
};

/**
 * Fires when a sheet row completes loading.
 */
export type ITypedSheetRowLoadedEvent = {
  type: 'SHEET/row/loaded';
  payload: ITypedSheetRowLoaded;
};
export type ITypedSheetRowLoaded = {
  index: number;
  row: string; // uri.
};

/**
 * Dispatches a change to a cell's data.
 */
export type ITypedSheetChangeEvent = {
  type: 'SHEET/change';
  payload: t.ITypedSheetChange;
};

/**
 * Fired after a change update has completed.
 */
export type ITypedSheetChangedEvent = {
  type: 'SHEET/changed';
  payload: t.ITypedSheetChanged;
};
export type ITypedSheetChanged = {
  ns: string; // uri.
  change: t.ITypedSheetChangeDiff;
  changes: t.ITypedSheetStateChanges;
};

/**
 * Fires when a set of changes are reverted.
 */
export type ITypedSheetChangesClearedEvent = {
  type: 'SHEET/changes/cleared';
  payload: t.ITypedSheetChangesCleared;
};
export type ITypedSheetChangesCleared = {
  ns: string; // uri.
  from: t.ITypedSheetStateChanges;
  to: t.ITypedSheetStateChanges;
  action: 'REVERT' | 'SAVED';
};
