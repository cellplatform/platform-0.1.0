export type IShadow = {
  blur: number;
  color: string | number;
};

export type CellEditorMode = 'FORMULA' | 'MARKDOWN' | 'TEXT';

export type ICellEditorTheme = {
  borderColor: string | number;
  titleBackground: string | number;
  titleColor: string | number;
  inputBackground: string | number;
  inputShadow: IShadow;
};

export type ICellEditorSize = { width: number; height: number };

/**
 * [Events]
 */
export type CellEditorEvent =
  | ICellEditorChangedEvent
  | ICellEditorChangingEvent
  | ICellEditorSizeEvent;

export type ICellEditorChangingEvent = {
  type: 'CELL_EDITOR/changing';
  payload: ICellEditorChanging;
};
export type ICellEditorChanging = ICellEditorChanged & {
  cancel(): void;
  isCancelled: boolean;
};

export type ICellEditorChangedEvent = {
  type: 'CELL_EDITOR/changed';
  payload: ICellEditorChanged;
};
export type ICellEditorChanged = {
  mode: CellEditorMode;
  value: { from: string; to: string };
};

export type ICellEditorSizeEvent = {
  type: 'CELL_EDITOR/size';
  payload: {
    mode: CellEditorMode;
    from: ICellEditorSize;
    to: ICellEditorSize;
  };
};
