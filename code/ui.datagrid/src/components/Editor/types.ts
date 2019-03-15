import { Observable } from 'rxjs';

import { Grid } from '../grid.api';
import { IGridKeydown } from '../Grid/types';

export type EditorFactory = (e: IEditorContext) => JSX.Element | null;

/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {
  autoCancel: boolean; // Automatically cancels on Escape key.
  column: number;
  row: number;
  grid: Grid;
  keys$: Observable<IGridKeydown>;
  end$: Observable<IEndEditingEvent>;
  cancel(): void;
  done(args: { value: any }): void;
};

/**
 * [Events]
 */
export type EditorEvent = IBeginEditingEvent | IEndEditingEvent;

export type IBeginEditingEvent = {
  type: 'GRID/EDITOR/begin';
  payload: {
    column: number;
    row: number;
  };
};

export type IEndEditingEvent = {
  type: 'GRID/EDITOR/end';
  payload: {
    column: number;
    row: number;
    isCancelled: boolean;
    value: { to: any };
  };
};
