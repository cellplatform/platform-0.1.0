import { ReactNode } from 'react';
import { Grid } from '../../api';
import * as t from '../../types';

/**
 * A factory function that produces a visual component for display within the grid.
 */
export type GridFactory = (req: IGridFactoryRequest) => ReactNode | null;
export type GridFactoryType = 'EDITOR' | 'CELL';

/**
 * Arguments used to determine what and how to produce the visual
 * component for the grid.
 */
export type IGridFactoryRequest = {
  type: GridFactoryType;
  row: number;
  column: number;
  grid: Grid;
  value: t.CellValue;
};
