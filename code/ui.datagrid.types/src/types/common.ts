import { IGridCellPosition } from '@platform/util.value.cell/lib/types';
export { IGridCellPosition };

export type ISize = { width: number; height: number };

export type GridCellKey = string;
export type GridCellRangeKey = string;
export type CellValue = string | boolean | number | object | null | undefined;
export type CellRef = IGridCellPosition | GridCellKey;
