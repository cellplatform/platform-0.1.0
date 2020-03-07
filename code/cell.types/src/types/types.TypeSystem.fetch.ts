import { t } from '../common';

/**
 * Data fetcher.
 */
export type ISheetFetcher = {
  getType: FetchSheetType;
  getCells: FetchSheetCells;
  getColumns: FetchSheetColumns;
};

/**
 * Fetch type.
 */
export type FetchSheetType = (args: { ns: string }) => Promise<FetchSheetTypeResult>;
export type FetchSheetTypeResult = {
  exists: boolean;
  type: t.INsType;
  error?: t.IHttpError;
};

/**
 * Fetch cells.
 */
export type FetchSheetCells = (args: {
  ns: string;
  query: string;
}) => Promise<FetchSheetCellsResult>;
export type FetchSheetCellsResult = {
  cells: t.ICellMap;
  total: { rows: number };
  error?: t.IHttpError;
};

/**
 * Fetch columns.
 */
export type FetchSheetColumns = (args: { ns: string }) => Promise<FetchSheetColumnsResult>;
export type FetchSheetColumnsResult = {
  columns: t.IColumnMap;
  error?: t.IHttpError;
};
