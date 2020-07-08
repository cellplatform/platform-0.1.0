import { t } from '../common';

/**
 * Constructs a sheet-data-fetcher from an HTTP host/client.
 */
export function fromFuncs(args: {
  getNs: t.FetchSheetNs;
  getColumns: t.FetchSheetColumns;
  getCells: t.FetchSheetCells;
}): t.ISheetFetcher {
  const { getNs, getCells, getColumns } = args;
  return { getNs, getCells, getColumns };
}
