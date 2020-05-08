import { t } from '../common';

export type ISheetPool = {
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  readonly sheets: { [ns: string]: t.ITypedSheet };
  dispose(): void;
};
