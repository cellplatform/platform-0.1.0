/**
 * Siblings
 */
export interface ICellSiblings {
  cell: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  toString: () => string;
}


export type CellEdge = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';

export type ICellOffsetOptions = {
  totalColumns?: number;
  totalRows?: number;
  clamp?: boolean; // Always return siblings, clipped to the edges (eg. [0,0] or [totalColumns,totalRows])
};

export type ICellSiblingOptions = ICellOffsetOptions & {
  offset?: number;
};

export type ICellSiblingArgs = {};
