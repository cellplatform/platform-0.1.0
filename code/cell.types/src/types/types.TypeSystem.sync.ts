import { t } from '../common';

/**
 * Managed event monitoring for a number of sheets
 * and child (REF) sheets.
 */
export type ITypedSheeChangeMonitor = {
  readonly isDisposed: boolean;
  readonly watching: string[];

  readonly event$: t.Observable<t.TypedSheetEvent>;
  readonly changed$: t.Observable<t.ITypedSheetChanged>;
  readonly dispose$: t.Observable<{}>;

  dispose(): void;
  watch(sheet: t.ITypedSheet | t.ITypedSheet[]): ITypedSheeChangeMonitor;
  unwatch(sheet: t.ITypedSheet | t.ITypedSheet[]): ITypedSheeChangeMonitor;
  isWatching(sheet: t.ITypedSheet | t.ITypedSheet[]): boolean;
};
