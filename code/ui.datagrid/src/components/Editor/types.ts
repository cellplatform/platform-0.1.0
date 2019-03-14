/**
 * Properties that are passed to React editor
 * components as `context`.
 */
export type IEditorContext = {};

/**
 * [Events]
 */
export type EditorEvent = IBeginEditingEvent | IEndEditingEvent;

export type IBeginEditingEvent = {
  type: 'GRID/EDITOR/begin';
  payload: {
    grid: string;
    row: number;
    column: number;
  };
};

export type IEndEditingEvent = {
  type: 'GRID/EDITOR/end';
  payload: {
    grid: string;
    isCancelled: boolean;
    row: number;
    column: number;
    value: {
      to: any;
    };
  };
};
