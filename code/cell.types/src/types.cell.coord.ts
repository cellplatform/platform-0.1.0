/**
 * Cell
 */
export type CoordAxis = 'COLUMN' | 'ROW';
export type CoordType = 'CELL' | CoordAxis;
export type ICoordPosition = {
  column: number;
  row: number;
};
export type ICoordCell = {
  key: string;
  column: number;
  row: number;
};

/**
 * Siblings
 */
export interface ICoordSiblings {
  cell: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  toString: () => string;
}

export type CoordEdge = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

export type ICoordOffsetOptions = {
  totalColumns?: number;
  totalRows?: number;
  clamp?: boolean; // Always return siblings, clipped to the edges (eg. [0,0] or [totalColumns,totalRows])
};
export type ICoordSiblingOptions = ICoordOffsetOptions & { offset?: number };
