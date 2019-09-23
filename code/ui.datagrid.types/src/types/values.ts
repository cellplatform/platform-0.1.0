import { ICoord } from '@platform/util.cell/lib/types';
export { ICoord };

export type ISize = { width: number; height: number };

export type GridCellType = 'CELL' | 'COLUMN' | 'ROW';
export type GridCellKey = string;
export type GridCellRangeKey = string;
export type CellValue = string | boolean | number | object | null | undefined;
export type CellRef = ICoord | GridCellKey;
