/**
 * TODO 🐷
 * Move to [cell.types]
 */

import { t } from './common';

export * from '../common/types';

export type ISheet<T> = {
  readonly ok: boolean;
  readonly uri: string;
  readonly types: t.ITypeDef[];
  cursor(args?: ISheetRowsArgs): Promise<ISheetCursor<T>>;
};

export type ISheetRowsArgs = { index?: number; take?: number };

export type ISheetCursor<T> = {
  readonly uri: string;
  readonly index: number;
  readonly take?: number;
  readonly total: number;
  readonly rows: Array<ISheetRow<T>>;
  row(index: number): T | undefined;
};

export type ISheetRow<T> = {
  readonly index: number;
  readonly uri: string;
  readonly types: t.ITypeDef[];
  readonly props: T;
};

/**
 * Data fetching
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

export type SheetEvent = ISheetFetchEvent;

export type ISheetFetch = {};
export type ISheetFetchEvent = {
  type: 'SHEET/fetch';
  payload: ISheetFetch;
};
