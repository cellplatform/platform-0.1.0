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
 * Data fetching.
 */
export type ISheetFetcher = {
  getType: FetchSheetType;
  getCells: FetchSheetCells;
  getColumns: FetchSheetColumns;
};

export type FetchSheetType = (args: { ns: string }) => Promise<FetchSheetTypeResult>;
export type FetchSheetTypeResult = {
  exists: boolean;
  type: t.INsType;
  error?: t.IHttpError;
};

export type FetchSheetCells = (args: {
  ns: string;
  query: string;
}) => Promise<FetchSheetCellsResult>;
export type FetchSheetCellsResult = { exists: boolean; cells: t.ICellMap; error?: t.IHttpError };

export type FetchSheetColumns = (args: { ns: string }) => Promise<FetchSheetColumnsResult>;
export type FetchSheetColumnsResult = {
  exists: boolean;
  columns: t.IColumnMap;
  error?: t.IHttpError;
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
