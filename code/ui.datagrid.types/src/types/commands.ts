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

// Style
export type GridStyleCommand = GridBoldCommand;
export type GridBoldCommand = 'BOLD';

/**
 * [Event]
 */
export type IGridCommand = {
  command: t.GridCommand;
  grid: t.IGrid;
  isCancelled: boolean;
  cancel(): void;
};
