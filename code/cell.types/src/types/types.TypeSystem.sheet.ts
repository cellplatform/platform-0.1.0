import { t } from '../common';

export type ITypedSheet<T> = {
  readonly ok: boolean;
  readonly uri: string;
  readonly type: t.ITypeClient;
  readonly types: t.ITypeDef[];
  readonly events$: t.Observable<TypedSheetEvent>;
  readonly dispose$: t.Observable<{}>;
  readonly isDisposed: boolean;
  dispose(): void;
  cursor(args?: ITypedSheetRowsArgs): Promise<ITypedSheetCursor<T>>;
};

export type ITypedSheetRowsArgs = { index?: number; take?: number };

export type ITypedSheetCursor<T> = {
  readonly uri: string;
  readonly index: number;
  readonly take?: number;
  readonly total: number;
  readonly rows: Array<ITypedSheetRow<T>>;
  row(index: number): T | undefined;
};

export type ITypedSheetRow<T> = {
  readonly index: number;
  readonly uri: string;
  readonly types: t.ITypeDef[];
  readonly props: T;
};

/**
 * [Events]
 */
export type TypedSheetEvent = ITypedSheetFetchEvent;

export type ITypedSheetFetch = {};
export type ITypedSheetFetchEvent = {
  type: 'SHEET/fetch';
  payload: ITypedSheetFetch;
};
