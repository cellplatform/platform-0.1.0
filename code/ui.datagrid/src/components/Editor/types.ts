import { Observable } from 'rxjs';

import { Cell, Grid } from '../../api';
import * as t from '../../types';

/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {
  autoCancel: boolean; // Automatically cancels on Escape key.
  readonly cell: Cell;
  readonly grid: Grid;
  readonly keys$: Observable<t.IGridKeypress>;
  readonly end$: Observable<IEndEditingEvent>;
  readonly value: {
    readonly from?: any;
    to?: any; // Writable, or use `set(...)` method.
  };
  set(value: any): void;
  cancel(): void;
  complete(): void;
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
  cancel(): void;
};
