import { t } from '../common';

/**
 * Commands
 */
export type GridCommand = GridClipboardCommand | GridStyleCommand | GridOverlayCommand;

/**
 * Overlay (screen)
 */
export type GridOverlayCommand = GridOverlayShowCommand | GridOverlayHideCommand;
export type GridOverlayShowCommand = 'OVERLAY/show';
export type GridOverlayHideCommand = 'OVERLAY/hide';

export type IGridOverlayCommand = IGridOverlayShowCommand | IGridOverlayHideCommand;

export type IGridOverlayShowCommand = IGridCommand<
  GridOverlayShowCommand,
  { cell: string; screen: t.ICellScreenView }
>;

export type IGridOverlayHideCommand = IGridCommand<GridOverlayHideCommand>;

/**
 * Clipboard
 */
export type GridClipboardCommand = GridClipboardReadCommand | GridClipboardPasteCommand;

export type GridClipboardReadCommand = GridClipboardCutCommand | GridClipboardCopyCommand;
export type GridClipboardCutCommand = 'CUT';
export type GridClipboardCopyCommand = 'COPY';
export type GridClipboardPasteCommand = 'PASTE';

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
 * Event Payload
 */
export type IGridCommand<C = GridCommand, P = {}> = {
  command: C;
  grid: t.IGrid;
  selection: t.IGridSelection;
  props: P;
  isCancelled: boolean;
  cancel(): void;
};
