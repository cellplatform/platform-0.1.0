export * from '@platform/cell.types/lib/types/types.range';

import { CellRange } from './CellRange';
import { CellRangeUnion } from './CellRangeUnion';
export { CellRange, CellRangeUnion };

export const fromKey = CellRange.fromKey;
export const fromCells = CellRange.fromCells;
export const square = CellRange.square;
export const union = CellRangeUnion.fromKey;
