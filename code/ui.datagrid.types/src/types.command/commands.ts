import { t } from '../common';

/**
 * Commands
 */
export type GridCommand = GridClipboardCommand | GridStyleCommand;

/**
 * Clipboard
 */
export type GridClipboardCommand = GridCopyCommand | GridCutCommand | GridPasteCommand;
export type GridCopyCommand = 'COPY';
export type GridCutCommand = 'CUT';
export type GridPasteCommand = 'PASTE';

export type IGridClipboardCommand = IGridCommand<GridClipboardCommand>;

/**
 * Style
 */
export type GridStyleCommand =
  | GridStyleBoldCommand
  | GridStyleItalicCommand
  | GridStyleUnderlineCommand;
export type GridStyleBoldCommand = 'BOLD';
export type GridStyleItalicCommand = 'ITALIC';
export type GridStyleUnderlineCommand = 'UNDERLINE';

export type IGridStyleCommand = IGridCommand<GridStyleCommand>;

/**
 * Event payload.
 */
export type IGridCommand<C = GridCommand, P = {}> = {
  command: C;
  grid: t.IGrid;
  selection: t.IGridSelection;
  props: P;
  isCancelled: boolean;
  cancel(): void;
};
