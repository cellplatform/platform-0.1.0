export { KeypressObservable } from '@platform/react';

export * from './api/Editor/types';
export * from './components/DataGrid/types';
export * from './components/render/types';
export * from './components/factory/types';

import { IGridCellPosition } from '@platform/util.value.cell';

export { IGridCellPosition };
export type GridCellKey = string;
export type GridCellRangeKey = string;
export type CellValue = string | boolean | number | object | null | undefined;
export type CellRef = IGridCellPosition | GridCellKey;

export type IGridValues = {
  [key: string]: CellValue;
};
