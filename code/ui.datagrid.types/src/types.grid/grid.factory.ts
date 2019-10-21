import { ReactNode } from 'react';
import { t } from '../common';

/**
 * A factory function that produces a visual component for display within the grid.
 */
export type GridFactory = (req: IGridFactoryRequest) => ReactNode | null;
export type GridFactoryType = 'EDITOR' | 'CELL';

/**
 * Arguments used to determine what and how to produce the visual
 * component within a datagrid.
 */
export type IGridFactoryRequest = {
  type: GridFactoryType;
  grid: t.IGrid;
  cell: { key: string; data: t.IGridCell; props: t.IGridCellPropsAll };
};
