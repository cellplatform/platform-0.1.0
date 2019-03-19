import { Grid } from '../../api';

/**
 * A factory function that produces a visual component for display within the grid.
 */
export type GridFactory = (req: IGridFactoryRequest) => JSX.Element | null;

export type GridFactoryType = 'EDITOR';

/**
 * Arguments used to determine what and how to produce the visual
 * component for the grid.
 */
export type IGridFactoryRequest = {
  type: GridFactoryType;
  row: number;
  column: number;
  grid: Grid;
};
