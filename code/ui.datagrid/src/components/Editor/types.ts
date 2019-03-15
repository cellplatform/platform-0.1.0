import { Grid } from '../grid.api';

export type EditorFactory = (e: IEditorContext) => JSX.Element | null;

/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {
  column: number;
  row: number;
  grid: Grid;
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
    isCancelled: boolean;
    row: number;
    column: number;
    value: {
      to: any;
    };
  };
};
