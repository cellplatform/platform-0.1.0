import { t } from './common';

export type INs = { id: string; props?: INsProps };
export type INsProps = { name?: string };

/**
 * A "namespace" is a logically related set of cells
 * (aka: a "sheet", "table" or "grid").
 */
export type INsData<
  V extends t.ICellData = t.ICellData,
  C extends t.IColumnData = t.IColumnData,
  R extends t.IRowData = t.IRowData
> = {
  ns: INs;
  cells: t.IMap<V>;
  columns: t.IMap<C>;
  rows: t.IMap<R>;
};
