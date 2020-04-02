import * as t from '../../common/types';
export * from '../../common/types';

export type SheetCtx = {
  events$: t.Subject<t.TypedSheetEvent>;
  fetch: t.ISheetFetcher;
  sheet: {
    load<T>(args: { ns: string }): Promise<t.ITypedSheet<T>>;
    create<T>(args: { implements: string }): Promise<t.ITypedSheet<T>>;
  };
};
