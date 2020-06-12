import { t } from '../common';

type N = t.INsProps;
type C = t.ICellData;

/**
 * State machine for a sheet.
 */
export type ITypedSheetState = {
  readonly uri: t.INsUri;
  readonly fetch: t.ISheetFetcher;

  readonly dispose$: t.Observable<{}>;
  readonly event$: t.Observable<t.TypedSheetEvent>;
  readonly change$: t.Observable<t.ITypedSheetChange>;
  readonly changed$: t.Observable<t.ITypedSheetChanged>;
  readonly changes: t.ITypedSheetChanges;

  readonly hasChanges: boolean;
  readonly isDisposed: boolean;

  readonly change: {
    ns<D extends N = N>(to: D): void;
    cell<D extends C = C>(key: string, to: D): void;
  };

  readonly clear: {
    cache(): void;
    changes(action: t.ITypedSheetChangesCleared['action']): void;
  };
};
