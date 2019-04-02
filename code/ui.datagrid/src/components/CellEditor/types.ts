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

/**
 * [Events]
 */
export type CellEditorEvent = ICellEditorChangedEvent | ICellEditorChangingEvent;

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
  from: string;
  to: string;
};
