import { ICoordPosition } from '@platform/cell.types';
export { ICoordPosition, CellValue } from '@platform/cell.types';

export type ISize = { width: number; height: number };

export type GridCellType = 'CELL' | 'COLUMN' | 'ROW';
export type GridCellKey = string;
export type GridCellRangeKey = string;
export type GridCellRef = ICoordPosition | GridCellKey;
