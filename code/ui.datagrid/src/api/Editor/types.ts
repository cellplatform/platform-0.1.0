import { Observable } from 'rxjs';

import { Cell } from '../Cell';
import { Grid } from '../Grid';
import * as t from '../../types';

/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {
  isCancelled: boolean;
  autoCancel: boolean; // Automatically cancels on Escape key.
  readonly initial: t.CellValue;
  readonly size: t.ISize | undefined;
  readonly cell: Cell;
  readonly grid: Grid;
  readonly keys$: Observable<t.IGridKeydown>;
  readonly end$: Observable<IEndEditingEvent>;
  readonly value: {
    readonly from?: any;
    readonly to?: any; // Writable, or use `set(...)` method.
  };
  set(args: { value?: any; size?: t.ISize }): IEditorContext;
  cancel(): IEditorContext;
  complete(): IEditorContext;
};

/**
 * [Events]
 */
export type EditorEvent = IBeginEditingEvent | IEndEditingEvent;

export type IBeginEditingEvent = {
  type: 'GRID/EDITOR/begin';
  payload: IBeginEditing;
};
export type IBeginEditing = {
  cell: Cell;
  cancel(): void;
};

export type IEndEditingEvent = {
  type: 'GRID/EDITOR/end';
  payload: IEndEditing;
};
export type IEndEditing = {
  cell: Cell;
  isCancelled: boolean;
  isChanged: boolean;
  value: { from?: t.CellValue; to?: t.CellValue };
  size?: t.ISize;
  cancel(): void;
};
