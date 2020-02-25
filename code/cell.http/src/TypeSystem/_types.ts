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
  events$: t.Subject<SheetEvent>;
  getType(args: {
    ns: string;
  }): Promise<{ exists: boolean; type: t.INsProps['type']; error?: t.IHttpError }>;
  getCells(args: {
    ns: string;
    query: string;
  }): Promise<{ exists: boolean; cells: t.ICellMap; error?: t.IHttpError }>;
  getColumns(args: {
    ns: string;
  }): Promise<{ exists: boolean; columns: t.IColumnMap; error?: t.IHttpError }>;
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
