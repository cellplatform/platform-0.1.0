import { t } from '../common';

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
export type FetchSheetCellsResult = {
  exists: boolean;
  cells: t.ICellMap;
  total: { rows: number };
  error?: t.IHttpError;
};

export type FetchSheetColumns = (args: { ns: string }) => Promise<FetchSheetColumnsResult>;
export type FetchSheetColumnsResult = {
  exists: boolean;
  columns: t.IColumnMap;
  error?: t.IHttpError;
};
