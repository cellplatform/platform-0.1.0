import { t } from './common';

export type ITableMap<V = any> = {
  [key: string]: V | undefined;
};

export type ICellTable<T extends t.ICellData = t.ICellData> = ITableMap<T>;
export type IColumnTable<T extends t.IColumnData = t.IColumnData> = ITableMap<T>;
export type IRowTable<T extends t.IRowData = t.IRowData> = ITableMap<T>;

export type ITableData<
  V extends t.ICellData = t.ICellData,
  C extends t.IColumnData = t.IColumnData,
  R extends t.IRowData = t.IRowData
> = {
  cells: ITableMap<V>;
  columns: ITableMap<C>;
  rows: ITableMap<R>;
};
