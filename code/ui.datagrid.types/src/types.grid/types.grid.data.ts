import { t } from '../common';

export type IGridData = t.INsData<t.IGridCellData, t.IGridColumnData, t.IGridRowData>;

/**
 * Cell
 */
export type IGridCellData<P extends t.ICellProps = t.IGridCellProps> = t.ICellData<P>;

export type GetGridCell<P = t.IGridCellProps> = (key: string) => GetGridCellPromise<P>;
export type GetGridCellPromise<P = t.IGridCellProps> = Promise<t.IGridCellData<P> | undefined>;

/**
 * Column
 */
export type IGridColumnPropsAll = t.IColumnProps & { width: number };
export type IGridColumnProps = Partial<IGridColumnPropsAll>;
export type IGridColumnData = t.IColumnData<IGridColumnProps>;

/**
 * Row
 */
export type IGridRowPropsAll = t.IRowProps & { height: number };
export type IGridRowProps = Partial<IGridRowPropsAll>;
export type IGridRowData = t.IRowData<IGridRowProps>;
