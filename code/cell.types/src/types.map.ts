import { t } from './common';

export type IMap<V = any> = { [key: string]: V | undefined };

export type ICellMap<T extends t.ICellData = t.ICellData> = IMap<T>;
export type IColumnMap<T extends t.IColumnData = t.IColumnData> = IMap<T>;
export type IRowMap<T extends t.IRowData = t.IRowData> = IMap<T>;

