import { t } from '../common';

/**
 * Commands
 */
export type GridCommand = GridClipboardCommand | GridStyleCommand;

// Clipboard
export type GridClipboardCommand = GridCopyCommand | GridCutCommand | GridPasteCommand;
export type GridCopyCommand = 'COPY';
export type GridCutCommand = 'CUT';
export type GridPasteCommand = 'PASTE';

export type IGridClipboardCommand = IGridCommand<GridClipboardCommand, {}>;

// Style
export type GridStyleCommand = GridBoldCommand;
export type GridBoldCommand = 'BOLD';

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
