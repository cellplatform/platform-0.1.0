/**
 * Cell
 */
export type GridCellType = 'CELL' | 'COLUMN' | 'ROW';
export type IGridCellPosition = {
  row: number;
  column: number;
};

/**
 * Siblings
 */
export interface IGridCellSiblings {
  cell: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  toString: () => string;
}

export type GridCellEdge = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

export type IGridCellOffsetOptions = {
  totalColumns?: number;
  totalRows?: number;
  clamp?: boolean; // Always return siblings, clipped to the edges (eg. [0,0] or [totalColumns,totalRows])
};
export type IGridCellSiblingOptions = IGridCellOffsetOptions & { offset?: number };
