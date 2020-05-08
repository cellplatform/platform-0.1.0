import { t } from '../common';

type S = t.ITypedSheet | t.INsUri | string;

/**
 * Manages in-memory pooling of sheet instances.
 */
export type ISheetPool = {
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  readonly count: number;
  readonly sheets: { [ns: string]: t.ITypedSheet };

  dispose(): void;
  exists(sheet: S): boolean;
  sheet<T = {}>(sheet: S): t.ITypedSheet<T> | undefined;
  add(sheet: t.ITypedSheet, options?: { parent?: S }): ISheetPool;
  remove(sheet: S): ISheetPool;
  children(sheet: S): t.ITypedSheet[];
};
