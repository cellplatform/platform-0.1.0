import { t } from '../common';

/**
 * Managed event monitoring for a number of sheets
 * and child (REF) sheets.
 */
export type ITypedSheetChangeMonitor = {
  readonly isDisposed: boolean;
  readonly watching: t.ITypedSheet[];

  readonly event$: t.Observable<t.TypedSheetEvent>;
  readonly changed$: t.Observable<t.ITypedSheetChanged>;
  readonly dispose$: t.Observable<{}>;

  dispose(): void;
  watch(sheet: t.ITypedSheet | t.ITypedSheet[]): ITypedSheetChangeMonitor;
  unwatch(sheet: t.ITypedSheet | t.ITypedSheet[]): ITypedSheetChangeMonitor;
  isWatching(sheet: t.ITypedSheet | t.ITypedSheet[]): boolean;
};
