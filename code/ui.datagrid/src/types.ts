export { Observable, Subject } from 'rxjs';
export { KepressObservable } from '@platform/react';

export * from './components/DataGrid/types';
export * from './components/Editor/types';
export * from './components/render/types';
export * from './components/factory/types';

export type CellValue = string | boolean | number | object | null | undefined;

export type IGridValues = {
  [key: string]: CellValue;
};
