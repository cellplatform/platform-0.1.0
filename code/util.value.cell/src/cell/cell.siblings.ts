import { t, R } from '../common';
import { fromKey, toKey } from './cell.key';

/**
 * Retrieves the contiguous cells.
 */
export function siblings(cell: string, options: t.ICellSiblingOptions = {}): t.ICellSiblings {
  const top = sibling(cell, 'TOP', options);
  const right = sibling(cell, 'RIGHT', options);
  const bottom = sibling(cell, 'BOTTOM', options);
  const left = sibling(cell, 'LEFT', options);
  return {
    cell,
    top,
    right,
    bottom,
    left,
    toString() {
      const edge = (text?: string) => (text ? text : 'none');
      let edges = '';
      edges += `top:${edge(top)}; `;
      edges += `right:${edge(right)}; `;
      edges += `bottom:${edge(bottom)}; `;
      edges += `left:${edge(left)}`;
      return `[${cell} siblings - ${edges}]`;
    },
  };
}

/**
 * Retrives the contiguous cell on the given edge.
 */
export function sibling(
  cell: string,
  edge: t.CellEdge,
  options: t.ICellSiblingOptions = {},
): string | undefined {
  const shift = !options.offset ? 1 : Math.abs(options.offset);
  switch (edge) {
    case 'TOP':
      return offset(cell, 0, 0 - shift, options);
    case 'RIGHT':
      return offset(cell, 0 + shift, 0, options);
    case 'BOTTOM':
      return offset(cell, 0, 0 + shift, options);
    case 'LEFT':
      return offset(cell, 0 - shift, 0, options);
    default:
      throw new Error(`Cell sibling edge '${edge}' not supported.`);
  }
}

/**
 * Retrieves the cell at the given offset to the current cell.
 */
export function offset(
  cell: string,
  columnOffset: number,
  rowOffset: number,
  options: t.ICellOffsetOptions = {},
) {
  const { totalColumns, totalRows, clamp = false } = options;

  const res = fromKey(cell);
  let column = res.column + columnOffset;
  let row = res.row + rowOffset;

  column = clamp ? R.clamp(0, (totalColumns || Number.MAX_SAFE_INTEGER) - 1, column) : column;
  row = clamp ? R.clamp(0, (totalRows || Number.MAX_SAFE_INTEGER) - 1, row) : row;

  const isWithinBounds = (column: number, row: number) => {
    if (column < 0 || row < 0) {
      return false;
    }
    if (totalColumns !== undefined && column >= totalColumns) {
      return false;
    }
    if (totalRows !== undefined && row >= totalRows) {
      return false;
    }
    return true;
  };

  return isWithinBounds(column, row) ? toKey(column, row) : undefined;
}
