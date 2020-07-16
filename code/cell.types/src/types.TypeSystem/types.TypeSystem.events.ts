import { t } from '../common';

type O = Record<string, unknown>;

/**
 * [Events]
 */
export type TypedSheetEvent =
  | t.TypedSheetSaveEvent
  | ITypedSheetLoadingEvent
  | ITypedSheetLoadedEvent
  | ITypedSheetRowLoadingEvent
  | ITypedSheetRowLoadedEvent
  | ITypedSheetRefsLoadingEvent
  | ITypedSheetRefsLoadedEvent
  | ITypedSheetChangeEvent
  | ITypedSheetChangedEvent
  | ITypedSheetChangesClearedEvent
  | ITypedSheetSyncEvent
  | ITypedSheetSyncedEvent
  | ITypedSheetUpdatedEvent;

/**
 * Fires when a sheet cursor commences loading.
 */
export type ITypedSheetLoadingEvent = {
  type: 'SHEET/loading';
  payload: ITypedSheetLoading;
};
export type ITypedSheetLoading = {
  sheet: t.ITypedSheet;
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
  sheet: t.ITypedSheet;
  index: number;
};

/**
 * Fires when a sheet row completes loading.
 */
export type ITypedSheetRowLoadedEvent = {
  type: 'SHEET/row/loaded';
  payload: ITypedSheetRowLoaded;
};
export type ITypedSheetRowLoaded = ITypedSheetRowLoading;

/**
 * Fires when a child Refs sheet starts loading
 */
export type ITypedSheetRefsLoadingEvent = {
  type: 'SHEET/refs/loading';
  payload: ITypedSheetRefsLoading;
};
export type ITypedSheetRefsLoading<T = O, K extends keyof T = any> = {
  sheet: t.ITypedSheet;
  refs: t.ITypedSheetRefs<T, K>;
};

/**
 * Fires when a child Refs sheet loads.
 */
export type ITypedSheetRefsLoadedEvent = {
  type: 'SHEET/refs/loaded';
  payload: ITypedSheetRefsLoaded;
};
export type ITypedSheetRefsLoaded<T = O> = ITypedSheetRefsLoading<T>;

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
  sheet: t.ITypedSheet;
  change: t.ITypedSheetChangeDiff;
  changes: t.ITypedSheetChanges;
};

/**
 * Fires when a set of changes are reverted.
 */
export type ITypedSheetChangesClearedEvent = {
  type: 'SHEET/changes/cleared';
  payload: t.ITypedSheetChangesCleared;
};
export type ITypedSheetChangesCleared = {
  sheet: t.ITypedSheet;
  from: t.ITypedSheetChanges;
  to: t.ITypedSheetChanges;
  action: 'REVERT' | 'SAVE';
};

/**
 * Fires a set of changes that may have changed in a different process
 * allowing any sheets/caches (etc) to synchronize their internal
 * data structures.
 */
export type ITypedSheetSyncEvent = {
  type: 'SHEET/sync';
  payload: ITypedSheetSync;
};
export type ITypedSheetSync = {
  /**
   * TODO 🐷
   * - remove NS ??
   * - it exists in `changes`
   */
  // ns: string;
  changes: t.ITypedSheetChanges;
};

/**
 * Fires after a sheet has been synced (and all internal data
 * structures have updated themselves).
 */
export type ITypedSheetSyncedEvent = {
  type: 'SHEET/synced';
  payload: ITypedSheetSynced;
};
export type ITypedSheetSynced = {
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetChanges;
};

/**
 * Fired when a sheet has been updated via either:
 *
 *  - SHEET/change (value edited, change state pending)
 *  - SHEET/sync   (value changed by another process)
 *
 * This event can be used as a single indicator of when anything
 * displaying the sheet should be aware of a change.
 */
export type ITypedSheetUpdatedEvent = {
  type: 'SHEET/updated';
  payload: ITypedSheetUpdated;
};
export type ITypedSheetUpdated = {
  via: 'SYNC' | 'CHANGE';
  sheet: t.ITypedSheet;
  changes: t.ITypedSheetChanges;
};
