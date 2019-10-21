import { t } from '../common';

/**
 * [Events]
 */
export type EditorEvent = IBeginEditingEvent | IEndEditingEvent;

export type IBeginEditingEvent = {
  type: 'GRID/EDITOR/begin';
  payload: IBeginEditing;
};
export type IBeginEditing = {
  readonly cell: t.IGridCell;
  cancel(): void;
};

export type IEndEditingEvent = {
  type: 'GRID/EDITOR/end';
  payload: IEndEditing;
};
export type IEndEditing = {
  cell: t.IGridCell;
  isCancelled: boolean;
  isChanged: boolean;
  value: { from?: t.CellValue; to?: t.CellValue };
  size?: t.ISize;
  cancel(): void;
};
