import { Grid, Cell } from '../api';
import * as t from '../../types';

/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {
  autoCancel: boolean; // Automatically cancels on Escape key.
  row: number;
  column: number;
  grid: Grid;
  cell: Cell;
  keys$: t.Observable<t.IGridKeypress>;
  end$: t.Observable<IEndEditingEvent>;
  cancel(): void;
  complete(args: { value: any }): void;
};

/**
 * [Events]
 */
export type EditorEvent = IBeginEditingEvent | IEndEditingEvent;

export type IBeginEditingEvent = {
  type: 'GRID/EDITOR/begin';
  payload: {
    row: number;
    column: number;
  };
};

export type IEndEditingEvent = {
  type: 'GRID/EDITOR/end';
  payload: {
    row: number;
    column: number;
    isCancelled: boolean;
    value: { to: any };
  };
};
