import { t } from '../common';

/**
 * Data fetcher.
 */
export type ISheetFetcher = {
  getNs: FetchSheetNs;
  getColumns: FetchSheetColumns;
  getCells: FetchSheetCells;
};

/**
 * Fetch type.
 */
export type FetchSheetNs = (args: { ns: string }) => Promise<FetchSheetNsResult>;
export type FetchSheetNsResult = {
  ns?: t.INsProps;
  error?: t.IHttpError;
};

/**
 * Fetch columns.
 */
export type FetchSheetColumns = (args: { ns: string }) => Promise<FetchSheetColumnsResult>;
export type FetchSheetColumnsResult = {
  columns?: t.IColumnMap;
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
  total: { rows: number };
  cells?: t.ICellMap;
  error?: t.IHttpError;
};
