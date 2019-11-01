import { t } from './common';

/**
 * A "cell namespace" being a logically related set of cells (aka: a "sheet").
 */
export type INsData<
  V extends t.ICellData = t.ICellData,
  C extends t.IColumnData = t.IColumnData,
  R extends t.IRowData = t.IRowData
> = {
  ns: string;
  cells: t.IMap<V>;
  columns: t.IMap<C>;
  rows: t.IMap<R>;
};
